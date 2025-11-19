import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  StyleSheet,
  Animated, // Animated 추가
  Dimensions,
  BackHandler,
} from 'react-native';
import {WebView} from 'react-native-webview';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {getLocation} from '../../storage/locationStorage';
import {fetchLocationAddress} from '../../hooks/useLocation';
import {useToast} from '../../context/ToastContext';
import {
  Store_getby_condition_search,
  Store_getby_condition_search_markers,
  StoreMainPreviewget,
} from '../../api/storeApi';
import throttle from 'lodash/throttle';
import KakaoMapHTML from '../../components/MapScreen/KakaoMapHTML';
import generateMapScript from '../../components/MapScreen/generateMapScript';
import MapStoreList from '../../components/MapScreen/MapStore/MapStoreList';
import Loading from '../../hooks/Loading';
import MapTopBar from '../../components/MapScreen/MapTopBar';
import {useMapSearch} from '../../context/MapSearchContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  buildConditionSearchDto,
  normalizeStoreResponse,
} from '../../utils/buildConditionSearchDto';

const resolveLocationDto = store => {
  if (!store) {
    return null;
  }
  const loc = store.locationDto;
  if (
    loc &&
    typeof loc.latitude === 'number' &&
    typeof loc.longitude === 'number'
  ) {
    return loc;
  }
  const fallbackLat =
    store?.latitude ??
    store?.lat ??
    store?.location?.latitude ??
    store?.location?.lat ??
    null;
  const fallbackLng =
    store?.longitude ??
    store?.lng ??
    store?.location?.longitude ??
    store?.location?.lng ??
    null;
  if (typeof fallbackLat === 'number' && typeof fallbackLng === 'number') {
    return {
      ...(loc || {}),
      latitude: fallbackLat,
      longitude: fallbackLng,
      address:
        loc?.address ?? store?.address ?? store?.location?.address ?? null,
    };
  }
  return loc ?? null;
};

const resolveStoreName = store =>
  store?.name ??
  store?.storeName ??
  store?.storeNm ??
  store?.store_name ??
  store?.title ??
  null;
const mergeUniqueStores = (prevList = [], nextList = []) => {
  const map = new Map();
  (Array.isArray(prevList) ? prevList : []).forEach(item => {
    if (item && item.id != null) {
      map.set(String(item.id), item);
    }
  });
  (Array.isArray(nextList) ? nextList : []).forEach(item => {
    if (item && item.id != null) {
      map.set(String(item.id), item);
    }
  });
  return Array.from(map.values());
};

const extractTotalPages = response =>
  response?.totalPages ??
  response?.data?.totalPages ??
  response?.data?.page?.totalPages ??
  response?.page?.totalPages ??
  null;

const {width, height: SCREEN_HEIGHT} = Dimensions.get('window');

const MapScreen = ({navigation, route}) => {
  const [location, setLocation] = useState(null);
  const insets = useSafeAreaInsets();
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [detailStoreId, setDetailStoreId] = useState(null);
  const [detailStoreData, setDetailStoreData] = useState(null);
  const [detailStoreLoading, setDetailStoreLoading] = useState(false);
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
  const {radiusKm, selectedFilters, searchText} = useMapSearch();
  const prevRadiusRef = useRef(radius);
  const [storegetloading, setStoregetloading] = useState(true);
  const [sheetIndex, setSheetIndex] = useState(1);
  const skipAutoSnapRef = useRef(false);
  const bottomSheetRef = useRef(null);
  const [resultCount, setResultCount] = useState(null);
  const lastGroupCountRef = useRef(null);
  const [markerStores, setMarkerStores] = useState([]);
  const [listPage, setListPage] = useState(0);
  const [hasMoreStores, setHasMoreStores] = useState(true);
  const [loadingMoreStores, setLoadingMoreStores] = useState(false);
  const skipInitialOffsetRef = useRef(true);
  const lastQueryRef = useRef({lat: null, lng: null});
  const detailFetchSeqRef = useRef(0);
  const isFocused = useIsFocused();
  const buildCurrentQuerySignature = useCallback(
    () =>
      JSON.stringify({
        searchKeyword: (searchText || '').trim(),
        filters: selectedFilters || {},
      }),
    [searchText, selectedFilters],
  );
  const lastAppliedQueryRef = useRef(buildCurrentQuerySignature());
  const buildCurrentConditionDto = useCallback(() => {
    return buildConditionSearchDto({
      filters: selectedFilters,
      searchKeyword: searchText,
    });
  }, [selectedFilters, searchText]);

  const fetchStoreListPage = useCallback(
    async ({page = 0, append = false, lat, lng, conditionDto} = {}) => {
      const targetLat =
        typeof lat === 'number' ? lat : lastQueryRef.current.lat;
      const targetLng =
        typeof lng === 'number' ? lng : lastQueryRef.current.lng;
      if (typeof targetLat !== 'number' || typeof targetLng !== 'number') {
        return;
      }
      const dto = conditionDto || buildCurrentConditionDto();
      if (append) {
        if (loadingMoreStores || !hasMoreStores) {
          return;
        }
        setLoadingMoreStores(true);
      } else {
        setStoregetloading(true);
      }
      try {
        const response = await Store_getby_condition_search(
          targetLat,
          targetLng,
          dto,
          page,
          radius,
        );
        const normalized = normalizeStoreResponse(response);
        setStores(prevStores =>
          append ? mergeUniqueStores(prevStores, normalized) : normalized,
        );
        if (!append) {
          setSelectedStore(normalized[0] || null);
          setSelectedStoreIndex(0);
        }
        setListPage(page);
        const totalPages = extractTotalPages(response);
        const nextHasMore =
          typeof totalPages === 'number'
            ? page < totalPages - 1
            : normalized.length > 0;
        setHasMoreStores(nextHasMore);
      } catch (error) {
        console.error('조건 검색 (목록) 실패:', error);
        if (!append) {
          setStores([]);
          setSelectedStore(null);
        }
        setHasMoreStores(false);
      } finally {
        if (append) {
          setLoadingMoreStores(false);
        } else {
          setStoregetloading(false);
        }
      }
    },
    [buildCurrentConditionDto, hasMoreStores, loadingMoreStores],
  );

  const handleLoadMoreStores = useCallback(() => {
    if (!hasMoreStores || loadingMoreStores) {
      return;
    }
    const nextPage = listPage + 1;
    fetchStoreListPage({page: nextPage, append: true});
  }, [fetchStoreListPage, hasMoreStores, listPage, loadingMoreStores]);

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

  // consume skipAutoSnap param once and persist in ref for the next focus event
  useEffect(() => {
    if (route?.params?.skipAutoSnap) {
      skipAutoSnapRef.current = true;
      navigation?.setParams?.({skipAutoSnap: false});
    }
  }, [navigation, route?.params?.skipAutoSnap]);

  useFocusEffect(
    useCallback(() => {
      // When coming straight from Search, skip the auto snap once to avoid jitter
      if (skipAutoSnapRef.current) {
        skipAutoSnapRef.current = false;
        lastGroupCountRef.current = null;
        return undefined;
      }
      // Collapse bottom sheet and clear selection whenever MapScreen becomes active
      bottomSheetRef.current?.snapToIndex?.(0);
      setTimeout(() => {
        bottomSheetRef.current?.snapToIndex?.(1);
      }, 500);
      lastGroupCountRef.current = null;
      return undefined;
    }, []),
  );

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

      if (
        !currentLocation ||
        typeof currentLocation.latitude !== 'number' ||
        typeof currentLocation.longitude !== 'number'
      ) {
        setStores([]);
        setSelectedStore(null);
        setRefresh(false);
        setLoading(false);
        setStoregetloading(false);
        return;
      }

      const offsetY = 0;

      moveCenterMap(currentLocation.latitude, currentLocation.longitude, 1);

      await refreshWithLatLngs(
        currentLocation.latitude,
        currentLocation.longitude,
        currentLocation.latitude,
        currentLocation.longitude,
        radius,
        offsetY,
      );
    } catch (err) {
      console.error('위치 또는 가게 데이터를 가져오는 중 오류 발생:', err);
      setRefresh(false);
      setLoading(false);
      setStoregetloading(false);
    }
  };

  const roundToPrecision = (value, precision = 7) => {
    return parseFloat(value.toFixed(precision)); //  소수점 8자리까지만 남김
  };

  const updateNewLocation = async radius => {
    setLoading(true);
    try {
      if (!skipInitialOffsetRef.current) {
        skipInitialOffsetRef.current = true;
      }
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
        moveCenterMap(newLocation.latitude, newLocation.longitude, 1);
      } else {
        setLocation(newLocation);
        moveCenterMap(newLocation.latitude, newLocation.longitude, 1);
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
    reqRadius,
    offsetY,
    conditionDtoOverride = null,
    querySignatureOverride = null,
  ) => {
    try {
      const conditionDto = conditionDtoOverride || buildCurrentConditionDto();
      const signature = querySignatureOverride || buildCurrentQuerySignature();
      lastAppliedQueryRef.current = signature;

      const markerResponse = await Store_getby_condition_search_markers(
        queryLat,
        queryLng,
        conditionDto,
        reqRadius,
      );
      const markerData = normalizeStoreResponse(markerResponse).map(item => {
        const normalized = {...item};
        if (normalized.id == null && normalized.storeId != null) {
          normalized.id = normalized.storeId;
        }
        const location = resolveLocationDto(normalized);
        if (location) {
          normalized.locationDto = location;
        }
        if (!normalized.name) {
          const fallbackName = resolveStoreName(normalized);
          if (fallbackName) {
            normalized.name = fallbackName;
          }
        }
        return normalized;
      });
      setMarkerStores(markerData);
      lastQueryRef.current = {lat: queryLat, lng: queryLng};
      setHasMoreStores(true);
      await fetchStoreListPage({
        page: 0,
        append: false,
        lat: queryLat,
        lng: queryLng,
        conditionDto,
      });

      if (webViewRef.current) {
        const effectiveOffset =
          skipInitialOffsetRef.current === true ? 0 : offsetY;
        webViewRef.current.injectJavaScript(closeStoreListOverlayScript);
        const script = generateMapScript(
          baseLat,
          baseLng,
          markerData,
          effectiveOffset,
        );
        webViewRef.current.injectJavaScript(script);
        if (skipInitialOffsetRef.current && offsetY !== 0) {
          skipInitialOffsetRef.current = false;
        }
      }
    } catch (err) {
      console.error('반경 내 매장 조회 중 오류:', err);
      setStoregetloading(false);
    } finally {
      setRefresh(false);
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
        const script = generateMapScript(
          location.latitude,
          location.longitude,
          [],
          0,
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
        if (skipInitialOffsetRef.current) {
          skipInitialOffsetRef.current = false;
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

  const getStoreFromSources = useCallback(
    storeId => {
      if (storeId == null) {
        return {store: null, index: -1};
      }
      const normalizeId = store =>
        store && (store.id != null || store.storeId != null)
          ? String(store.id ?? store.storeId)
          : null;
      const targetId = String(storeId);
      const listIndex = stores.findIndex(
        store => normalizeId(store) === targetId,
      );
      if (listIndex !== -1) {
        return {store: stores[listIndex], index: listIndex};
      }
      const fallback =
        markerStores?.find(
          markerStore => normalizeId(markerStore) === targetId,
        ) || null;
      return {store: fallback, index: -1};
    },
    [markerStores, stores],
  );

  const fetchDetailStore = useCallback(
    async storeId => {
      detailFetchSeqRef.current += 1;
      const seq = detailFetchSeqRef.current;
      if (!storeId) {
        setDetailStoreData(null);
        setDetailStoreLoading(false);
        return;
      }
      setDetailStoreLoading(true);
      try {
        const data = await StoreMainPreviewget(storeId);
        if (detailFetchSeqRef.current === seq) {
          setDetailStoreData(data || null);
        }
      } catch (error) {
        console.error('Failed to fetch store detail', error);
        if (detailFetchSeqRef.current === seq) {
          setDetailStoreData(null);
        }
        showToast?.('매장 상세 정보를 불러오지 못했어요.', 'center');
      } finally {
        if (detailFetchSeqRef.current === seq) {
          setDetailStoreLoading(false);
        }
      }
    },
    [showToast],
  );

  useEffect(() => {
    fetchDetailStore(detailStoreId);
  }, [detailStoreId, fetchDetailStore]);

  const handleWebViewMessage = throttle(message => {
    if (message.action === 'hideFlatList') {
    } else if (message.action === 'markerGroupClicked' && message.storeId) {
      const {store, index} = getStoreFromSources(message.storeId);
      const location = resolveLocationDto(store);
      if (store && location) {
        if (index !== -1) {
          setSelectedStoreIndex(index);
        }
        setGroupStoreIds(null);
        // Ensure we exit detail mode so the sheet can collapse fully
        setDetailStoreId(null);
        bottomSheetRef.current?.snapToIndex(0);
        try {
          const js = `try{ if(window.clearStoreLabel){ window.clearStoreLabel(); } }catch(e){}; true;`;
          webViewRef.current?.injectJavaScript(js);
        } catch (e) {}
        moveCenterMap(location.latitude, location.longitude, 10, true);
        // save group total for later when picking an item
        if (typeof message.total === 'number') {
          lastGroupCountRef.current = message.total;
          setResultCount(message.total);
        }
        return;
      }
    } else if (message.action === 'markerListItemClicked' && message.storeId) {
      const {store, index} = getStoreFromSources(message.storeId);
      const location = resolveLocationDto(store);
      if (store && location) {
        if (index !== -1) {
          setSelectedStoreIndex(index);
        }
        setGroupStoreIds(null);
        setDetailStoreId(message.storeId);
        setLastChosenStoreId(message.storeId);
        // decide count to show on bubble (only for clusters > 1)
        let bubbleCount = null;
        if (typeof message.total === 'number' && message.total > 1) {
          bubbleCount = message.total;
          setResultCount(message.total);
          lastGroupCountRef.current = message.total;
        } else if (
          typeof lastGroupCountRef.current === 'number' &&
          lastGroupCountRef.current > 1
        ) {
          bubbleCount = lastGroupCountRef.current;
          setResultCount(lastGroupCountRef.current);
        } else {
          bubbleCount = null;
          setResultCount(null);
        }
        bottomSheetRef.current?.snapToIndex(1);
        moveCenterMap(location.latitude, location.longitude, 1, true);
        try {
          // close list overlay and show name bubble above marker with count
          const countArg = bubbleCount != null ? String(bubbleCount) : 'null';
          const js = `try{ if(window.currentOverlay){ window.currentOverlay.setMap(null); window.currentOverlay=null;} if(window.showStoreLabelAt){ window.showStoreLabelAt(${
            location.latitude
          }, ${location.longitude}, ${JSON.stringify(
            resolveStoreName(store) || '',
          )}, ${countArg}); } }catch(e){}; true;`;
          webViewRef.current?.injectJavaScript(js);
        } catch (e) {}
      }
    } else if (message.action === 'markerClicked' && message.storeId) {
      const {store, index} = getStoreFromSources(message.storeId);
      const location = resolveLocationDto(store);
      if (store && location) {
        if (index !== -1) {
          setSelectedStoreIndex(index);
        }
        setGroupStoreIds(null);
        setDetailStoreId(message.storeId);
        setLastChosenStoreId(message.storeId);
        // single marker: do not show list count badge
        setResultCount(null);
        lastGroupCountRef.current = null;
        bottomSheetRef.current?.snapToIndex(1);
        moveCenterMap(location.latitude, location.longitude, 1, true);
        try {
          const js = `try{ if(window.showStoreLabelAt){ window.showStoreLabelAt(${
            location.latitude
          }, ${location.longitude}, ${JSON.stringify(
            resolveStoreName(store) || '',
          )}, null); } }catch(e){}; true;`;
          webViewRef.current?.injectJavaScript(js);
        } catch (e) {}
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
      } catch (e) {}
      setResultCount(null);
      lastGroupCountRef.current = null;
      return;
    }
    const {store} = getStoreFromSources(detailStoreId);
    const location = resolveLocationDto(store);
    if (store && location && webViewRef.current) {
      try {
        const countVal =
          typeof lastGroupCountRef.current === 'number' &&
          lastGroupCountRef.current > 1
            ? lastGroupCountRef.current
            : null;
        const countArg = countVal != null ? String(countVal) : 'null';
        const js = `try{ if(window.showStoreLabelAt){ window.showStoreLabelAt(${
          location.latitude
        }, ${location.longitude}, ${JSON.stringify(
          resolveStoreName(store) || '',
        )}, ${countArg}); } }catch(e){}; true;`;
        webViewRef.current.injectJavaScript(js);
      } catch (e) {}
      // only keep resultCount when from a cluster selection (>1)
      if (
        !(
          typeof lastGroupCountRef.current === 'number' &&
          lastGroupCountRef.current > 1
        )
      ) {
        setResultCount(null);
      }
    }
  }, [detailStoreId, getStoreFromSources]);

  const requeryStoresWithCurrentFilters = useCallback(
    filtersOverride => {
      const baseLat = centerLatLng?.latitude ?? location?.latitude;
      const baseLng = centerLatLng?.longitude ?? location?.longitude;
      if (typeof baseLat !== 'number' || typeof baseLng !== 'number') {
        return;
      }
      if (detailStoreId) {
        setDetailStoreId(null);
      }
      const offsetY = sheetIndex === 1 ? SCREEN_HEIGHT * 0.18 : 0;
      const signature = JSON.stringify({
        searchKeyword: (searchText || '').trim(),
        filters: filtersOverride ?? selectedFilters ?? {},
      });
      const conditionOverride = filtersOverride
        ? buildConditionSearchDto({
            filters: filtersOverride,
            searchKeyword: searchText,
          })
        : null;
      refreshWithLatLngs(
        baseLat,
        baseLng,
        baseLat,
        baseLng,
        radius,
        offsetY,
        conditionOverride,
        signature,
      );
    },
    [
      centerLatLng,
      detailStoreId,
      location,
      radius,
      searchText,
      selectedFilters,
      sheetIndex,
    ],
  );

  const requeryForSearchParamsChange = useCallback(() => {
    requeryStoresWithCurrentFilters();
  }, [requeryStoresWithCurrentFilters]);

  useEffect(() => {
    if (!isFocused) {
      return;
    }
    const signature = buildCurrentQuerySignature();
    if (lastAppliedQueryRef.current === signature) {
      return;
    }
    requeryForSearchParamsChange();
  }, [buildCurrentQuerySignature, isFocused, requeryForSearchParamsChange]);

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
        detailStoreData={detailStoreData}
        detailStoreLoading={detailStoreLoading}
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
        hasMoreStores={hasMoreStores}
        loadingMoreStores={loadingMoreStores}
        onLoadMoreStores={handleLoadMoreStores}
        onApplyFilters={requeryStoresWithCurrentFilters}
      />

      <Loading loading={loading} />
    </>
  );
};

const styles = StyleSheet.create({
  webview: {
    flex: 1,
  },
});

export default MapScreen;
