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
  const [resultCount, setResultCount] = useState(null);
  const lastGroupCountRef = useRef(null);

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

  // baseLat/baseLng: base center coords (marker visually offset from here)
  // queryLat/queryLng: API query coords (marker actual position with offset applied)
  const refreshWithLatLngs = async (
    baseLat,
    baseLng,
    queryLat,
    queryLng,
    radius,
    offsetY,
  ) => {
    try {
      const storesData = await Store_getby_radius(queryLat, queryLng, radius);
      storesData.sort((a, b) =>
        a.locationDto.address.localeCompare(b.locationDto.address),
      );
      setStores(storesData);
      setSelectedStore(storesData[0]);

      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(closeStoreListOverlayScript);
        const script = generateMapScript(baseLat, baseLng, storesData, offsetY);
        webViewRef.current.injectJavaScript(script);
      }
    } catch (err) {
      console.error('반경 내 매장 조회 중 오류:', err);
    } finally {
      setRefresh(false);
      setLoading(false);
      setStoregetloading(false);
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
      const offsetY = sheetIndex === 1 ? SCREEN_HEIGHT * 0.18 : 0;

      if (webViewRef.current) {
        const calcAdjustedScript = `
          (function(){
            try {
              var map = window.map;
              var __lat = ${lat}, __lng = ${lng};
              var __offset = ${offsetY} || 0;
              var __adjLat = __lat, __adjLng = __lng;
              if (map) {
                var proj = map.getProjection();
                var base = new kakao.maps.LatLng(__lat, __lng);
                var pt = proj.containerPointFromCoords(base);
                // 마커는 중심에서 위로 올려 찍음 → y - offset
                var adjPt = new kakao.maps.Point(pt.x, pt.y - __offset);
                var adj = proj.coordsFromContainerPoint(adjPt);
                __adjLat = adj.getLat();
                __adjLng = adj.getLng();
              }
              window.ReactNativeWebView.postMessage(JSON.stringify({
                action: 'adjustedLatLngForQuery',
                reqId: 'setcenterrefresh',
                baseLat: __lat,
                baseLng: __lng,
                latitude: __adjLat,
                longitude: __adjLng,
                radius: ${radius},
                offsetY: __offset
              }));
            } catch (e) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                action: 'adjustedLatLngForQuery',
                reqId: 'setcenterrefresh',
                baseLat: ${lat},
                baseLng: ${lng},
                latitude: ${lat},
                longitude: ${lng},
                radius: ${radius},
                offsetY: ${offsetY},
                error: 'calc_failed'
              }));
            }
            true;
          })();
        `;
        webViewRef.current.injectJavaScript(closeStoreListOverlayScript);
        webViewRef.current.injectJavaScript(calcAdjustedScript);
      } else {
        refreshWithLatLngs(lat, lng, lat, lng, radius, offsetY);
      }
    } catch (err) {
      console.error('위치 또는 가게 데이터를 가져오는 중 오류 발생:', err);
    } finally {
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
      if (
        message.action === 'adjustedLatLngForQuery' &&
        message.reqId === 'setcenterrefresh'
      ) {
        const baseLat = message.baseLat ?? location?.latitude;
        const baseLng = message.baseLng ?? location?.longitude;
        const queryLat = message.latitude;
        const queryLng = message.longitude;
        const reqRadius = message.radius ?? radius;
        const adjOffsetY =
          message.offsetY ??
          (sheetIndex === 1
            ? SCREEN_HEIGHT * 0.18
            : sheetIndex === 10
            ? SCREEN_HEIGHT * -0.18
            : 0);
        refreshWithLatLngs(
          baseLat,
          baseLng,
          queryLat,
          queryLng,
          reqRadius,
          adjOffsetY,
        );
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
        // Ensure we exit detail mode so the sheet can collapse fully
        setDetailStoreId(null);
        bottomSheetRef.current?.snapToIndex(0);
        try {
          const js = `try{ if(window.clearStoreLabel){ window.clearStoreLabel(); } }catch(e){}; true;`;
          webViewRef.current?.injectJavaScript(js);
        } catch(e){}
        const store = stores[index];
        if (store) {
          moveCenterMap(
            store.locationDto.latitude,
            store.locationDto.longitude,
            10,
            true,
          );
        }
        // save group total for later when picking an item
        if (typeof message.total === 'number') {
          lastGroupCountRef.current = message.total;
          setResultCount(message.total);
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
        // decide count to show on bubble (only for clusters > 1)
        let bubbleCount = null;
        if (typeof message.total === 'number' && message.total > 1) {
          bubbleCount = message.total;
          setResultCount(message.total);
          lastGroupCountRef.current = message.total;
        } else if (typeof lastGroupCountRef.current === 'number' && lastGroupCountRef.current > 1) {
          bubbleCount = lastGroupCountRef.current;
          setResultCount(lastGroupCountRef.current);
        } else {
          bubbleCount = null;
          setResultCount(null);
        }
        bottomSheetRef.current?.snapToIndex(1);
        const store = stores[index];
        if (store) {
          moveCenterMap(
            store.locationDto.latitude,
            store.locationDto.longitude,
            1,
            true,
          );
          try {
            // close list overlay and show name bubble above marker with count
            const countArg = bubbleCount != null ? String(bubbleCount) : 'null';
            const js = `try{ if(window.currentOverlay){ window.currentOverlay.setMap(null); window.currentOverlay=null;} if(window.showStoreLabelAt){ window.showStoreLabelAt(${store.locationDto.latitude}, ${store.locationDto.longitude}, ${JSON.stringify(store.name)}, ${countArg}); } }catch(e){}; true;`;
            webViewRef.current?.injectJavaScript(js);
          } catch(e){}
        }
      }
    } else if (message.action === 'markerClicked' && message.storeId) {
      const index = stores.findIndex(store => store.id === message.storeId);
      if (index !== -1) {
        setSelectedStoreIndex(index);
        setGroupStoreIds(null);
        setDetailStoreId(message.storeId);
        setLastChosenStoreId(message.storeId);
        // single marker: do not show list count badge
        setResultCount(null);
        lastGroupCountRef.current = null;
        bottomSheetRef.current?.snapToIndex(1);
        const store = stores[index];
        if (store) {
          moveCenterMap(
            store.locationDto.latitude,
            store.locationDto.longitude,
            1,
            true,
          );
          try {
            const js = `try{ if(window.showStoreLabelAt){ window.showStoreLabelAt(${store.locationDto.latitude}, ${store.locationDto.longitude}, ${JSON.stringify(store.name)}, null); } }catch(e){}; true;`;
            webViewRef.current?.injectJavaScript(js);
          } catch(e){}
        }
      }
    }
  }, 500);

  // When detail opens (via list or marker), show label and set count
  useEffect(() => {
    if (!detailStoreId) {
      // clear label and badge when closing detail
      try {
        const js = `try{ if(window.clearStoreLabel){ window.clearStoreLabel(); } }catch(e){}; true;`;
        webViewRef.current?.injectJavaScript(js);
      } catch(e) {}
      setResultCount(null);
      lastGroupCountRef.current = null;
      return;
    }
    const store = stores.find(s => s.id === detailStoreId);
    if (store && webViewRef.current) {
      try {
        const countVal = (typeof lastGroupCountRef.current === 'number' && lastGroupCountRef.current > 1)
          ? lastGroupCountRef.current
          : null;
        const countArg = countVal != null ? String(countVal) : 'null';
        const js = `try{ if(window.showStoreLabelAt){ window.showStoreLabelAt(${store.locationDto.latitude}, ${store.locationDto.longitude}, ${JSON.stringify(store.name)}, ${countArg}); } }catch(e){}; true;`;
        webViewRef.current.injectJavaScript(js);
      } catch(e) {}
      // only keep resultCount when from a cluster selection (>1)
      if (!(typeof lastGroupCountRef.current === 'number' && lastGroupCountRef.current > 1)) {
        setResultCount(null);
      }
    }
  }, [detailStoreId]);

  // Track group total when a marker group is clicked
  useEffect(() => {
    // no-op; placeholder to avoid lint complaints for hooks order
  }, []);

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
