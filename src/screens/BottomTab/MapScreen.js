import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated, // Animated 추가
  PanResponder, // PanResponder 추가
} from 'react-native';
import {WebView} from 'react-native-webview';
import {getLocation} from '../../storage/locationStorage';
import {fetchLocation} from '../../hooks/useLocation';
import {Store_getby_radius} from '../../api/storeApi';
import throttle from 'lodash/throttle';
import MapSearchBar from '../../components/MapScreen/MapSearchBar';
import MapLocation from '../../components/MapScreen/MapLocation';
import MapDirections from '../../components/MapScreen/MapDirections';
import KakaoMapHTML from '../../components/MapScreen/KakaoMapHTML';
import generateMapScript from '../../components/MapScreen/generateMapScript';
import MapStoreList from '../../components/MapScreen/MapStore/MapStoreList';
import {openKakaoMap} from '../../hooks/openKakaoMap';
const MapScreen = ({navigation}) => {
  const [location, setLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const webViewRef = useRef(null);
  const flatListRef = useRef(null);

  const [isFlatListVisible, setIsFlatListVisible] = useState(true); // 플랫리스트 상태
  const flatListAnim = useRef(new Animated.Value(0)).current; // 초기 위치 0

  useEffect(() => {
    fetchSaveLocation();
  }, []);

  const fetchSaveLocation = async () => {
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation);

      const storesData = await Store_getby_radius(
        currentLocation.latitude,
        currentLocation.longitude,
      );
      setStores(storesData);
      setSelectedStore(storesData[0]);

      if (webViewRef.current) {
        const script = generateMapScript(
          currentLocation.latitude,
          currentLocation.longitude,
          storesData,
        );
        webViewRef.current.injectJavaScript(script);
      }
    } catch (err) {
      console.error('위치 또는 가게 데이터를 가져오는 중 오류 발생:', err);
    }
  };

  const roundToPrecision = (value, precision = 4) => {
    return parseFloat(value.toFixed(precision)); // 🔥 소수점 5자리까지만 남김
  };

  const updateNewLocation = async () => {
    try {
      const newLocation = await fetchLocation();
      const roundedCurrentLat = location
        ? roundToPrecision(location.latitude)
        : null;
      const roundedCurrentLng = location
        ? roundToPrecision(location.longitude)
        : null;
      const roundedNewLat = roundToPrecision(newLocation.latitude);
      const roundedNewLng = roundToPrecision(newLocation.longitude);

      if (
        roundedCurrentLat === roundedNewLat &&
        roundedCurrentLng === roundedNewLng
      ) {
        console.log('true');
        moveCenterMap(newLocation.latitude, newLocation.longitude);
      } else {
        console.log('false');
        setLocation(newLocation);
        updateMap(newLocation.latitude, newLocation.longitude, stores);
        moveCenterMap(newLocation.latitude, newLocation.longitude);
        const storesData = await Store_getby_radius(
          newLocation.latitude,
          newLocation.longitude,
        );
        setStores(storesData);
        setSelectedStore(storesData[0]);
        if (webViewRef.current) {
          const script = generateMapScript(
            newLocation.latitude,
            newLocation.longitude,
            storesData,
          );
          webViewRef.current.injectJavaScript(script);
        }
      }
    } catch (err) {
      console.error('위치 업데이트 중 오류 발생:', err);
    }
  };

  const moveCenterMap = (lat, lng) => {
    const script = `
      if (window.map) {
        window.map.panTo(new kakao.maps.LatLng(${lat}, ${lng}));
      }
      true;
    `;
    webViewRef.current?.injectJavaScript(script);
  };

  const updateMap = (lat, lng, stores) => {
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(generateMapScript(lat, lng, stores));
    }
  };

  const onMessageHandler = event => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      // 기존 메시지 처리
      if (message.action === 'mapLoaded') {
        console.log('Kakao Maps API가 로드되었습니다.');
        const script = generateMapScript(
          location.latitude,
          location.longitude,
          stores,
        );
        webViewRef.current?.injectJavaScript(script);
      }

      // 새로운 메시지 처리
      handleWebViewMessage(message); // 새로운 로직 추가
    } catch (error) {
      console.error('Error parsing message from WebView:', error);
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // 세로로 드래그된 경우만 활성화
        return (
          Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
          Math.abs(gestureState.dy) > 30
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -30) {
          // 위로 드래그
          showFlatList();
        } else if (gestureState.dy > 30) {
          // 아래로 드래그
          hideFlatList();
        }
      },
    }),
  ).current;

  // 플랫리스트 애니메이션 함수
  const hideFlatList = () => {
    Animated.timing(flatListAnim, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => setIsFlatListVisible(false));
  };

  const showFlatList = () => {
    setIsFlatListVisible(true);
    Animated.timing(flatListAnim, {
      toValue: 0, // 플랫리스트를 원래 위치로
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleWebViewMessage = throttle(message => {
    if (message.action === 'hideFlatList') {
      console.log('Hiding FlatList');
      hideFlatList();
    } else if (message.action === 'markerClicked' && message.storeId) {
      console.log('Marker clicked:', message.storeId);
      showFlatList();

      const index = stores.findIndex(store => store.id === message.storeId);
      if (index !== -1) {
        setSelectedStoreIndex(index);

        // flatListRef가 유효한 경우에만 scrollToOffset 호출
        if (flatListRef.current) {
          flatListRef.current.scrollToOffset({
            offset: index * 410,
            animated: true,
          });
        }

        const store = stores[index];
        if (store) {
          moveCenterMap(
            store.locationDto.latitude,
            store.locationDto.longitude,
          );
        }
      }
    }
  }, 500);

  const openMapHandle = () => {
    if (selectedStore) {
      openKakaoMap(
        location.latitude,
        location.longitude,
        selectedStore.locationDto.latitude,
        selectedStore.locationDto.longitude,
      );
    }
  };

  return (
    <View style={styles.container}>
      {location ? (
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{html: KakaoMapHTML()}}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          onMessage={onMessageHandler} // 메시지 핸들러 추가
          nestedScrollEnabled={true} // 제스처 전달 허용
          style={styles.webview}
        />
      ) : (
        <View style={styles.loading}>
          <Text style={styles.loadingtext}>Loading Map...</Text>
        </View>
      )}
      <MapSearchBar
        navigation={navigation}
        buttonText="근처 주점들을 검색해보세요."
      />
      <MapLocation onPress={updateNewLocation} />
      <MapDirections onPress={openMapHandle} />

      <MapStoreList
        panHandlers={panResponder.panHandlers}
        flatListAnim={flatListAnim}
        isFlatListVisible={isFlatListVisible}
        stores={stores}
        selectedStoreIndex={selectedStoreIndex}
        setSelectedStoreIndex={setSelectedStoreIndex}
        setSelectedStore={setSelectedStore}
        moveCenterMap={moveCenterMap}
        flatListRef={flatListRef}
        navigation={navigation}
        location={location}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  webview: {
    flex: 1,
  },
  loading: {
    flex: 1,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingtext: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default MapScreen;
