import React, {useState, useEffect, useRef} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated, // Animated 추가
  PanResponder, // PanResponder 추가
} from 'react-native';
import {WebView} from 'react-native-webview';
import {getLocation, saveLocationAddress} from '../../storage/locationStorage';
import {fetchLocationAddress} from '../../hooks/useLocation';
import {useToast} from '../../context/ToastContext';
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
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const {showToast} = useToast();
  const [isFlatListVisible, setIsFlatListVisible] = useState(true); // 플랫리스트 상태
  const flatListAnim = useRef(new Animated.Value(0)).current; // 초기 위치 0

  useEffect(() => {
    fetchSaveLocation();
  }, []);

  useEffect(() => {
    if (refresh) {
      fetchSaveLocation();
      setRefresh(false);
    }
  }, [refresh]);

  const fetchSaveLocation = async () => {
    setLoading(true);
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation);

      const storesData = await Store_getby_radius(
        currentLocation.latitude,
        currentLocation.longitude,
      );
      storesData.sort((a, b) =>
        a.locationDto.address.localeCompare(b.locationDto.address),
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
      moveCenterMap(currentLocation.latitude, currentLocation.longitude);
    } catch (err) {
      console.error('위치 또는 가게 데이터를 가져오는 중 오류 발생:', err);
    } finally {
      setLoading(false);
    }
  };

  const roundToPrecision = (value, precision = 4) => {
    return parseFloat(value.toFixed(precision)); // 🔥 소수점 5자리까지만 남김
  };

  const updateNewLocation = async () => {
    setLoading(true);
    try {
      const {newLocation, address} = await fetchLocationAddress();

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
        storesData.sort((a, b) =>
          a.locationDto.address.localeCompare(b.locationDto.address),
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
    } finally {
      setLoading(false);
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
      {/* <MapSearchBar refresh={refresh} setRefresh={setRefresh} /> */}
      <MapLocation onPress={updateNewLocation} />
      <MapDirections onPress={fetchSaveLocation} />

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
      {(refresh || loading) && (
        <View style={styles.loading}>
          <Text style={styles.loadingtext}>Loading...</Text>
        </View>
      )}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
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
