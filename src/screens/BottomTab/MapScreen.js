import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Animated, // Animated 추가
  PanResponder, // PanResponder 추가
  Dimensions,
  BackHandler,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useFocusEffect} from '@react-navigation/native';
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
import MapRadius from '../../components/MapScreen/MapRadius';
import Loading from '../../hooks/Loading';
import MapTopBar from '../../components/MapScreen/MapTopBar';
import {useMapSearch} from '../../context/MapSearchContext';

const {width, height: SCREEN_HEIGHT} = Dimensions.get('window');

const MapScreen = ({navigation}) => {
  const [location, setLocation] = useState(null);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [detailStoreId, setDetailStoreId] = useState(null);
  const [selectedStoreIndex, setSelectedStoreIndex] = useState(0);
  const [groupStoreIds, setGroupStoreIds] = useState(null);
  const [lastChosenStoreId, setLastChosenStoreId] = useState(null);
  const webViewRef = useRef(null);
  const flatListRef = useRef(null);
  const isProgrammaticPan = useRef(false);
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);
  const [centerLatLng, setCenterLatLng] = useState(null);
  const [prevCenterLatLng, setPrevCenterLatLng] = useState(null);
  const {showToast} = useToast();
  const [isFlatListVisible, setIsFlatListVisible] = useState(true); // 플랫리스트 상태
  const flatListAnim = useRef(new Animated.Value(0)).current; // 초기 위치 0
  const [radius, setRadiusint] = useState(1);
  const {radiusKm} = useMapSearch();
  const prevRadiusRef = useRef(radius);
  const [storegetloading, setStoregetloading] = useState(true);
  const [sheetIndex, setSheetIndex] = useState(1);
  const bottomSheetRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('MainScreen'); // MainScreen 탭으로 전환
        return true; // 기본 뒤로가기 방지
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  useEffect(() => {
    Location();
    setRefresh(false);
  }, []);

  useEffect(() => {
    if (prevRadiusRef.current !== radius) {
      prevRadiusRef.current = radius; // 변경된 값을 저장
      setRefresh(true);
    }
  }, [radius]);

  useEffect(() => {
    if (typeof radiusKm === 'number' && radiusKm !== radius) {
      setRadiusint(radiusKm);
      try {
        setcenterrefresh(radiusKm);
      } catch (e) {}
    }
  }, [radiusKm]);

  const closeStoreListOverlayScript = `
  if (window.currentOverlay && typeof window.currentOverlay.setMap === 'function') {
    window.currentOverlay.setMap(null);
    window.currentOverlay = null;
  }
  true;
`;

  const Location = async () => {
    const currentLocation = await getLocation();
    setLocation(currentLocation);
  };

  const getStorelist = async radius => {
    setLoading(true);
    setStoregetloading(true);
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation);

      const storesData = await Store_getby_radius(
        currentLocation.latitude,
        currentLocation.longitude,
        radius,
      );
      storesData.sort((a, b) =>
        a.locationDto.address.localeCompare(b.locationDto.address),
      );
      setStores(storesData);
      setSelectedStore(storesData[0]);

      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(closeStoreListOverlayScript);

        const script = generateMapScript(
          currentLocation.latitude,
          currentLocation.longitude,
          storesData,
        );
        webViewRef.current.injectJavaScript(script);
      }

      moveCenterMap(currentLocation.latitude, currentLocation.longitude, 1);
    } catch (err) {
      console.error('위치 또는 가게 데이터를 가져오는 중 오류 발생:', err);
    } finally {
      setRefresh(false);
      setLoading(false);
      setStoregetloading(false);
    }
  };

  const fetchSaveLocation = async () => {
    setLoading(true);
    try {
      const currentLocation = await getLocation();
      setLocation(currentLocation);
      setCenterLatLng(currentLocation);

      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(closeStoreListOverlayScript);

        const script = generateMapScript(
          currentLocation.latitude,
          currentLocation.longitude,
          stores,
        );
        webViewRef.current.injectJavaScript(script);
      }
      moveCenterMap(
        currentLocation.latitude,
        currentLocation.longitude,
        sheetIndex,
      );
    } catch (err) {
      console.error('위치 또는 가게 데이터를 가져오는 중 오류 발생:', err);
    } finally {
      setRefresh(true);
      setLoading(false);
    }
  };

  const roundToPrecision = (value, precision = 7) => {
    return parseFloat(value.toFixed(precision)); //  소수점 8자리까지만 남김
  };

  const updateNewLocation = async radius => {
    setLoading(true);
    try {
      const {newLocation, address} = await fetchLocationAddress();
      setCenterLatLng(newLocation);

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
        webViewRef.current.injectJavaScript(closeStoreListOverlayScript);
        moveCenterMap(newLocation.latitude, newLocation.longitude, sheetIndex);
      } else {
        setLocation(newLocation);
        moveCenterMap(newLocation.latitude, newLocation.longitude, sheetIndex);
        if (webViewRef.current) {
          webViewRef.current.injectJavaScript(closeStoreListOverlayScript);
          const script = generateMapScript(
            newLocation.latitude,
            newLocation.longitude,
            stores,
          );
          webViewRef.current.injectJavaScript(script);
        }
      }
    } catch (err) {
      console.error('위치 업데이트 중 오류 발생:', err);
    } finally {
      setRefresh(true);
      setLoading(false);
    }
  };

  const setcenterrefresh = async radius => {
    setLoading(true);
    setStoregetloading(true);
    try {
      // 상세 보기 중이면 목록 보기로 전환
      if (detailStoreId) {
        setDetailStoreId(null);
        setGroupStoreIds(null);
      }

      const lat = centerLatLng?.latitude ?? location?.latitude;
      const lng = centerLatLng?.longitude ?? location?.longitude;

      const centerLocation = {latitude: lat, longitude: lng};

      setLocation(centerLocation);

      if (!lat || !lng) {
        return;
      }

      const storesData = await Store_getby_radius(lat, lng, radius);
      storesData.sort((a, b) =>
        a.locationDto.address.localeCompare(b.locationDto.address),
      );
      setStores(storesData);
      setSelectedStore(storesData[0]);

      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(closeStoreListOverlayScript);
        const offsetY = sheetIndex === 1 ? SCREEN_HEIGHT * 0.18 : 0;
        const script = generateMapScript(lat, lng, storesData, offsetY);
        webViewRef.current.injectJavaScript(script);
      }
    } catch (err) {
      console.error('위치 또는 가게 데이터를 가져오는 중 오류 발생:', err);
    } finally {
      setRefresh(false);
      setLoading(false);
      setStoregetloading(false);
    }
  };

  const moveCenterMap = (lat, lng, sheetIndex, force = false) => {
    const offsetY =
      sheetIndex === null
        ? 0
        : sheetIndex === 1
        ? SCREEN_HEIGHT * 0.18 // 45%일 때
        : sheetIndex === 10
        ? SCREEN_HEIGHT * -0.18
        : 0;
    // console.log(sheetIndex);

    const roundedPrev = prevCenterLatLng && {
      latitude: roundToPrecision(prevCenterLatLng.latitude),
      longitude: roundToPrecision(prevCenterLatLng.longitude),
    };

    const roundedNew = {
      latitude: roundToPrecision(lat),
      longitude: roundToPrecision(lng),
    };

    const moved =
      force || !roundedPrev || isSignificantMovement(roundedPrev, roundedNew);

    if (moved) {
      isProgrammaticPan.current = true; // ?? 다음 idle은 무시하게 하기

      const script = `
       if (window.map) {
          const map = window.map;
    const latLng = new kakao.maps.LatLng(${lat}, ${lng});
    const proj = map.getProjection();
    const point = proj.containerPointFromCoords(latLng);
    const adjustedPoint = new kakao.maps.Point(point.x, point.y + ${offsetY});
    const newCenter = proj.coordsFromContainerPoint(adjustedPoint);
    map.panTo(newCenter);
          }
          true;
        `;
      webViewRef.current?.injectJavaScript(script);
    } else {
    }
  };

  const isSignificantMovement = (prev, current, threshold = 0.00001) => {
    if (!prev) return true;
    const latDiff = Math.abs(prev.latitude - current.latitude);
    const lngDiff = Math.abs(prev.longitude - current.longitude);
    return latDiff > threshold || lngDiff > threshold;
  };

  const onMessageHandler = event => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message && message.action) {
        // console.log('WebView action:', message.action, message);
      }

      // 기존 메시지 처리
      if (message.action === 'mapLoaded') {
        console.log('Kakao Maps API가 로드되었습니다.');
        const initialOffset = sheetIndex === 1 ? SCREEN_HEIGHT * 0.18 : 0;
        const script = generateMapScript(
          location.latitude,
          location.longitude,
          [],
          initialOffset,
        );
        webViewRef.current.injectJavaScript(script);

        getStorelist(radius);
        setRefresh(false);
        return;
      }
      if (message.action === 'mapMoved') {
        if (isProgrammaticPan.current) {
          isProgrammaticPan.current = false;
          return;
        }

        const current = {
          latitude: message.latitude,
          longitude: message.longitude,
        };

        if (isSignificantMovement(prevCenterLatLng, current)) {
          setCenterLatLng(current);
          setPrevCenterLatLng(current); // 이전 좌표 갱신
          setRefresh(true);
        } else {
        }
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
      hideFlatList();
    } else if (message.action === 'markerGroupClicked' && message.storeId) {
      const index = stores.findIndex(store => store.id === message.storeId);
      if (index !== -1) {
        setSelectedStoreIndex(index);
        setGroupStoreIds(null);
        bottomSheetRef.current?.snapToIndex(0);
        const store = stores[index];
        if (store) {
          moveCenterMap(
            store.locationDto.latitude,
            store.locationDto.longitude,
            10,
            true,
          );
        }
        return;
      }
    } else if (message.action === 'markerListItemClicked' && message.storeId) {
      const index = stores.findIndex(store => store.id === message.storeId);
      if (index !== -1) {
        setSelectedStoreIndex(index);
        setGroupStoreIds(null);
        setDetailStoreId(message.storeId);
        setLastChosenStoreId(message.storeId);
        bottomSheetRef.current?.snapToIndex(1);
        const store = stores[index];
        if (store) {
          moveCenterMap(
            store.locationDto.latitude,
            store.locationDto.longitude,
            1,
            true,
          );
        }
      }
    } else if (message.action === 'markerClicked' && message.storeId) {
      const index = stores.findIndex(store => store.id === message.storeId);
      if (index !== -1) {
        setSelectedStoreIndex(index);
        setGroupStoreIds(null);
        setDetailStoreId(message.storeId);
        setLastChosenStoreId(message.storeId);
        bottomSheetRef.current?.snapToIndex(1);
        const store = stores[index];
        if (store) {
          moveCenterMap(
            store.locationDto.latitude,
            store.locationDto.longitude,
            1,
            true,
          );
        }
      }
    }
  }, 500);

  return (
    <>
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
          textZoom={100}
        />
      ) : null}

      {/* <MapRadius setRadiusint={setRadiusint} /> */}
      <MapTopBar
        navigation={navigation}
        refresh={refresh}
        setcenterrefresh={setcenterrefresh}
        radius={radius}
      />
      <MapStoreList
        updateNewLocation={() => updateNewLocation()}
        fetchSaveLocation={() => fetchSaveLocation()}
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
        loading={loading}
        storegetloading={storegetloading}
        radius={radius}
        setRadiusint={setRadiusint}
        setSheetIndex={setSheetIndex}
        detailStoreId={detailStoreId}
        groupStoreIds={groupStoreIds}
        onOpenDetail={id => {
          setDetailStoreId(id);
          setGroupStoreIds(null);
          setLastChosenStoreId(id);
        }}
        onCloseDetail={() => setDetailStoreId(null)}
        lastChosenStoreId={lastChosenStoreId}
        onCloseGroup={() => setGroupStoreIds(null)}
        bottomSheetRef={bottomSheetRef}
      />

      <Loading loading={loading} />
    </>
  );
};

const styles = StyleSheet.create({
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
    fontFamily: 'Pretendard-Medium', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#c0c0c0',
  },
});

export default MapScreen;
