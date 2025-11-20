import React, {useMemo, useRef, useEffect, useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  FlatList,
  TouchableOpacity,
  InteractionManager,
  BackHandler,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetScrollView,
} from '@gorhom/bottom-sheet';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  runOnJS,
  useAnimatedReaction,
  withTiming,
} from 'react-native-reanimated';
import MapStoreItem from './MapStoreItem';
import MapLocation from '../MapLocation';
import MapStoreItemSkeleton from './MapStoreItemSkeleton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NoneStore from './NoneStore';
import FilterPotal from './FilterPotal';
import MapFilterHeader from './MapFilterHeader';
import MapDetailItem from './MapDetailItem';
import {useMapSearch} from '../../../context/MapSearchContext';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import MapDetailItemSkeleton from './MapDetailItemSkeleton';
const {height: SCREEN_HEIGHT} = Dimensions.get('window');
const DEFAULT_DETAIL_HEADER_HEIGHT = 110;

const MapStoreList = ({
  updateNewLocation,
  isFlatListVisible,
  stores,
  selectedStoreIndex,
  setSelectedStoreIndex,
  setSelectedStore,
  moveCenterMap,
  flatListRef,
  navigation,
  location,
  loading,
  storegetloading,
  setRadiusint,
  setSheetIndex,
  detailStoreId,
  detailStoreData,
  detailStoreLoading = false,
  onCloseDetail,
  groupStoreIds,
  onOpenDetail,
  onCloseGroup,
  bottomSheetRef,
  hasMoreStores = false,
  onLoadMoreStores,
  loadingMoreStores = false,
  onApplyFilters,
}) => {
  // const bottomSheetRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [filterheight, setFilterheight] = useState(0);
  const [detailContentHeight, setDetailContentHeight] = useState(null);
  const [detailHeaderHeight, setDetailHeaderHeight] = useState(null);
  const detailRevealProgress = useSharedValue(1);
  const detailPointerState = useSharedValue(1);
  const [detailPointerEnabled, setDetailPointerEnabled] = useState(true);
  const listRevealProgress = useSharedValue(1);
  const initialIndex = stores.length === 0 ? 1 : 1;
  const detailStore = detailStoreData || null;
  const isDetailMode = !!detailStoreId;
  const detailCollapsedHeight = useMemo(() => {
    if (!detailStoreId) {
      return SCREEN_HEIGHT * 0.03 + filterheight + insets.bottom;
    }
    const platformOffset = Platform.OS === 'android' ? 10 : 0;
    const safePadding = insets.bottom + 20 + platformOffset;
    const headerHeight = detailHeaderHeight ?? DEFAULT_DETAIL_HEADER_HEIGHT;
    return safePadding + headerHeight;
  }, [detailStoreId, filterheight, insets.bottom, detailHeaderHeight]);
  const detailSnapPoint = useMemo(() => {
    if (!detailStoreId) return SCREEN_HEIGHT * 0.55;
    const measured = detailContentHeight ?? SCREEN_HEIGHT * 0.55;
    const padding = insets.bottom + 30 + (Platform.OS === 'android' && 8);
    const computed = measured + padding;
    const safeMax = Math.max(
      SCREEN_HEIGHT * 0.85,
      SCREEN_HEIGHT - insets.top - 16,
    );
    return Math.min(safeMax, computed);
  }, [detailStoreId, detailContentHeight, insets.bottom, insets.top]);
  const hideFloatingButtons =
    isDetailMode && detailSnapPoint >= SCREEN_HEIGHT * 0.7;
  const detailCenterOffset = useMemo(() => {
    if (!isDetailMode) return null;
    if (typeof detailSnapPoint !== 'number' || detailSnapPoint <= 0) {
      return null;
    }
    // 살짝 덜 올려서 지도 위치가 너무 위로 치우치지 않도록 보정
    return Math.max(0, detailSnapPoint / 2 - 32);
  }, [isDetailMode, detailSnapPoint]);

  const snapPoints = useMemo(() => {
    const first = detailCollapsedHeight;
    const nonemid = SCREEN_HEIGHT * 0.3;
    const mid = SCREEN_HEIGHT * 0.55;
    const max = SCREEN_HEIGHT * 0.7;
    if (loading || storegetloading) return [first, first];
    if (stores.length === 0 && !loading && !storegetloading) {
      return [first, nonemid];
    }
    // 상세보기 모드에서는 80% 스냅 비활성화
    if (detailStoreId) return [first, detailSnapPoint];
    return [first, mid, max];
  }, [
    stores,
    loading,
    storegetloading,
    detailStoreId,
    detailSnapPoint,
    detailCollapsedHeight,
  ]);

  const animatedIndex = useSharedValue(0);
  const [translateY, setTranslateY] = useState(0);
  const [showListButtons, setShowListButtons] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [itemheight, setItemheight] = useState(120);
  const [listfastview, setListfastview] = useState(false);
  const lastCenteredIndexRef = useRef(null);
  const currentSheetIndexRef = useRef(null);
  const mapMoveTimerRef = useRef(null);
  const didForceAfterLoadRef = useRef(true);
  const lastDetailCenterKeyRef = useRef(null);
  const groupFilteredStores = useMemo(
    () =>
      Array.isArray(groupStoreIds) && groupStoreIds.length > 0
        ? stores.filter(s => groupStoreIds.includes(s.id))
        : [],
    [stores, groupStoreIds],
  );
  const isGroupMode = groupFilteredStores.length > 0 && !isDetailMode;

  useEffect(() => {
    if (isDetailMode) {
      setFilterheight(0);
    } else {
      setDetailContentHeight(null);
      setDetailHeaderHeight(null);
      detailRevealProgress.value = 1;
      detailPointerState.value = 1;
      setDetailPointerEnabled(true);
      listRevealProgress.value = 1;
    }
  }, [
    isDetailMode,
    detailRevealProgress,
    detailPointerState,
    listRevealProgress,
  ]);
  const handleDetailPointerState = useCallback(enabled => {
    setDetailPointerEnabled(prev => (prev === enabled ? prev : enabled));
  }, []);

  useAnimatedReaction(
    () => animatedIndex.value,
    index => {
      'worklet';
      let newValue;

      if (snapPoints.length === 2) {
        if (index === 0)
          newValue = -SCREEN_HEIGHT * 0.03 - filterheight - insets.bottom;
        if (index === 1) {
          if (detailStoreId) {
            if (index === 1) newValue = -SCREEN_HEIGHT * 0.55;
          } else {
            newValue = -SCREEN_HEIGHT * 0.3;
          }
        }
      } else {
        if (index === 0)
          newValue = -SCREEN_HEIGHT * 0.03 - filterheight - insets.bottom;
        if (index === 1) newValue = -SCREEN_HEIGHT * 0.55;
        if (index === 2) newValue = 0;
      }

      if (newValue === undefined) return;

      runOnJS(setTranslateY)(newValue);
      runOnJS(setShowListButtons)(index < 2);
    },
  );
  useAnimatedReaction(
    () => animatedIndex.value,
    value => {
      'worklet';
      const raw = detailStoreId ? value ?? 0 : 1;
      const next = Math.max(0, Math.min(1, raw));
      if (Math.abs(detailRevealProgress.value - next) > 0.001) {
        detailRevealProgress.value = next;
      }
      const shouldEnable = next >= 0.05 ? 1 : 0;
      if (detailPointerState.value !== shouldEnable) {
        detailPointerState.value = shouldEnable;
        runOnJS(handleDetailPointerState)(!!shouldEnable);
      }
    },
    [detailStoreId, handleDetailPointerState],
  );

  const handleSheetChange = useCallback(
    index => {
      if (isDetailMode && index === 2) {
        // 상세보기 모드에서는 80% 스냅 금지 → 바로 45%로 고정
        bottomSheetRef.current?.snapToIndex(1);
        setCurrentIndex(1);
        currentSheetIndexRef.current = 1;
        setSheetIndex?.(1);
        setListfastview(true);
        return;
      }

      setCurrentIndex(index);
      currentSheetIndexRef.current = index;
      setSheetIndex?.(index);
      setListfastview(prev => prev || index >= 1);
    },
    [isDetailMode, setSheetIndex],
  );
  // initialize sheet index so offset can be applied before onChange fires
  useEffect(() => {
    currentSheetIndexRef.current = initialIndex;
    setSheetIndex?.(initialIndex);
  }, [initialIndex, setSheetIndex]);
  const scrollStartAtTop = useRef(false);
  const userScrollStartedRef = useRef(false);

  const handleScrollBeginDrag = useCallback(e => {
    const offsetY = e.nativeEvent.contentOffset.y;
    scrollStartAtTop.current = offsetY === 0;
    userScrollStartedRef.current = true;
    didForceAfterLoadRef.current = true;
    // true = 최상단에서 드래그 시작함
  }, []);

  const handleScrollEndDrag = useCallback(
    e => {
      const offsetY = e.nativeEvent.contentOffset.y;

      // 시작도 0, 끝도 0 → 아래로 당겼다 놓은 상황
      if (scrollStartAtTop.current && offsetY === 0 && currentIndex === 2) {
        bottomSheetRef.current?.snapToIndex(1);
      }
    },
    [currentIndex],
  );
  // 상세 모드 진입 시 45% 스냅 고정
  useEffect(() => {
    if ((isDetailMode || isGroupMode) && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(1);
    }
  }, [isDetailMode, isGroupMode, bottomSheetRef]);

  useEffect(() => {
    if (isDetailMode && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(1);
    }
  }, [detailSnapPoint, isDetailMode, bottomSheetRef]);

  const handleCloseDetail = useCallback(() => {
    onCloseDetail?.();
    // FlatList가 다시 마운트된 후 인덱스로 스크롤
    const tryScrollTop = () => {
      if (!flatListRef?.current) return false;
      try {
        flatListRef.current.scrollToOffset({offset: 0, animated: false});
        return true;
      } catch (e) {
        try {
          flatListRef.current.scrollToIndex?.({index: 0, animated: false});
          return true;
        } catch (_ignored) {
          return false;
        }
      }
    };

    if (tryScrollTop()) return;

    requestAnimationFrame(() => {
      if (tryScrollTop()) return;
      requestAnimationFrame(() => {
        if (tryScrollTop()) return;
        InteractionManager.runAfterInteractions(() => {
          tryScrollTop();
        });
      });
    });
  }, [onCloseDetail, flatListRef]);

  const handleCloseGroup = useCallback(() => {
    onCloseGroup?.();

    const tryScrollTop = () => {
      if (!flatListRef?.current) return false;
      try {
        flatListRef.current.scrollToOffset({offset: 0, animated: false});
        return true;
      } catch (e) {
        try {
          flatListRef.current.scrollToIndex?.({index: 0, animated: false});
          return true;
        } catch (_ignored) {
          return false;
        }
      }
    };

    if (tryScrollTop()) return;

    requestAnimationFrame(() => {
      if (tryScrollTop()) return;
      requestAnimationFrame(() => {
        if (tryScrollTop()) return;
        InteractionManager.runAfterInteractions(() => {
          tryScrollTop();
        });
      });
    });
  }, [onCloseGroup, flatListRef]);

  const handleDetailLayout = useCallback(
    e => {
      if (!isDetailMode) return;
      const height = e?.nativeEvent?.layout?.height;
      if (!height || Number.isNaN(height)) return;
      setDetailContentHeight(prev =>
        Math.abs((prev ?? 0) - height) > 2 ? height : prev,
      );
    },
    [isDetailMode],
  );
  const handleDetailHeaderLayout = useCallback(
    height => {
      if (!height || Number.isNaN(height)) return;
      setDetailHeaderHeight(prev =>
        prev == null || Math.abs(prev - height) > 2 ? height : prev,
      );
    },
    [setDetailHeaderHeight],
  );

  useFocusEffect(
    useCallback(() => {
      if (!isDetailMode && !isGroupMode) return undefined;

      const onBackPress = () => {
        if (isDetailMode) {
          handleCloseDetail();
          return true; // consume when closing detail
        }
        if (isGroupMode) {
          handleCloseGroup();
          return true; // consume when closing group
        }
        return false;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      const navBeforeRemove = navigation?.addListener?.('beforeRemove', e => {
        if (!isDetailMode && !isGroupMode) return;
        e.preventDefault();
        if (isDetailMode) handleCloseDetail();
        else if (isGroupMode) handleCloseGroup();
      });

      return () => {
        subscription.remove();
        navBeforeRemove && navBeforeRemove();
      };
    }, [
      isDetailMode,
      isGroupMode,
      handleCloseDetail,
      handleCloseGroup,
      navigation,
    ]),
  );

  // Track top visible item and center map when sheet is at 45%
  const viewabilityConfig = useRef({itemVisiblePercentThreshold: 25});

  const storesRef = useRef(stores);
  useEffect(() => {
    storesRef.current = stores;
  }, [stores]);

  // 새 스토어 목록으로 갱신되면, 첫 스크롤에서 패닝을 강제하고
  // 이전 topIndex 중복 스킵 상태를 초기화한다.
  useEffect(() => {
    lastCenteredIndexRef.current = null;
    didForceAfterLoadRef.current = false; // 스크롤 시작 전에는 강제 패닝 비활성화
    // 데이터가 새로 바뀌면 사용자 스크롤 다시 요구
    userScrollStartedRef.current = false;
  }, [stores]);

  const onViewableItemsChanged = useRef(() => {});

  useEffect(() => {
    onViewableItemsChanged.current = ({viewableItems}) => {
      // 사용자가 스크롤을 시작한 이후에만 지도 중심 이동 허용
      if (!userScrollStartedRef.current) {
        return;
      }
      const bypass = didForceAfterLoadRef.current === true;
      if (
        currentSheetIndexRef.current !== 1 ||
        !Array.isArray(viewableItems) ||
        viewableItems.length === 0 ||
        (!bypass && storegetloading) ||
        (!bypass && loading) ||
        storesRef.current.length === 0 // ✅ 여기서도 최신 ref 사용 추천
      ) {
        return;
      }

      const topItem = viewableItems.reduce((prev, curr) =>
        prev.index < curr.index ? prev : curr,
      );
      const topIndex = topItem?.index ?? 0;

      if (lastCenteredIndexRef.current === topIndex) return;
      lastCenteredIndexRef.current = topIndex;

      const latestStoreList = storesRef.current; // ✅ 최신 stores
      const store = latestStoreList[topIndex];
      if (!store) return;

      setSelectedStoreIndex?.(topIndex);
      setSelectedStore?.(store);

      const lat = store?.locationDto?.latitude;
      const lng = store?.locationDto?.longitude;

      if (typeof lat === 'number' && typeof lng === 'number') {
        // 🔥 이전 타이머 취소
        if (mapMoveTimerRef.current) {
          clearTimeout(mapMoveTimerRef.current);
        }

        mapMoveTimerRef.current = setTimeout(() => {
          const refreshedStoreList = storesRef.current; // ✅ 1초 뒤에도 최신값
          const freshStore = refreshedStoreList[topIndex];
          if (!freshStore) return;

          const offsetOverride =
            currentSheetIndexRef.current === 1 &&
            typeof detailCenterOffset === 'number'
              ? detailCenterOffset
              : undefined;

          moveCenterMap(
            freshStore.locationDto.latitude,
            freshStore.locationDto.longitude,
            currentSheetIndexRef.current,
            didForceAfterLoadRef.current,
            offsetOverride,
          );
          if (didForceAfterLoadRef.current) {
            didForceAfterLoadRef.current = false;
          }
        }, 500);
      }
    };
  }, [
    currentIndex,
    storegetloading,
    loading,
    moveCenterMap, // stores 제거!!
    setSelectedStoreIndex,
    setSelectedStore,
    detailCenterOffset,
  ]);

  // ✅ stores가 변경되면 예약된 이동 취소
  useEffect(() => {
    return () => {
      if (mapMoveTimerRef.current) {
        clearTimeout(mapMoveTimerRef.current);
      }
    };
  }, [stores]);

  useEffect(() => {
    if (!isDetailMode) {
      lastDetailCenterKeyRef.current = null;
      return;
    }
    if (!detailStore) return;
    const lat = detailStore?.locationDto?.latitude;
    const lng = detailStore?.locationDto?.longitude;
    if (
      typeof lat !== 'number' ||
      typeof lng !== 'number' ||
      typeof detailCenterOffset !== 'number'
    ) {
      return;
    }
    const key = `${detailStoreId}-${detailCenterOffset.toFixed(
      2,
    )}-${lat.toFixed(5)}-${lng.toFixed(5)}`;
    if (lastDetailCenterKeyRef.current === key) {
      return;
    }
    lastDetailCenterKeyRef.current = key;
    moveCenterMap(lat, lng, 1, true, detailCenterOffset);
  }, [
    isDetailMode,
    detailStore,
    detailCenterOffset,
    moveCenterMap,
    detailStoreId,
  ]);

  const keyExtractor = useCallback(
    item => item.id?.toString?.() ?? String(item.id ?? ''),
    [],
  );

  const renderItem = useCallback(
    ({item, index}) => (
      <MapStoreItem
        item={item}
        index={index}
        selectedStoreIndex={selectedStoreIndex}
        setSelectedStore={setSelectedStore}
        moveCenterMap={moveCenterMap}
        navigation={navigation}
        location={location}
        loading={loading}
        onItemPress={() => onOpenDetail?.(item.id)}
        setItemheight={setItemheight}
      />
    ),
    [
      selectedStoreIndex,
      setSelectedStore,
      moveCenterMap,
      navigation,
      location,
      loading,
    ],
  );

  const renderNoStoreView = () => (
    <NoneStore navigation={navigation} location={location} />
  );

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterInitialTab, setFilterInitialTab] = useState('거리');
  const [selectedFilters, setSelectedFilters] = useState({
    거리: '1km',
    카테고리: '',
    주종: '',
    방문시간: '',
    매장분위기: '',
    인원: '',
    주차: '',
    콜키지: '',
    스크린: '',
    룸: '',
    야장: '',
  });

  const mapSearchCtx = useMapSearch();
  const listModeCollapsed = !isDetailMode && currentIndex === 0;

  useEffect(() => {
    if (isDetailMode) return;
    const target = listModeCollapsed ? 0 : 1;
    listRevealProgress.value = withTiming(target, {duration: 220});
  }, [isDetailMode, listModeCollapsed, listRevealProgress]);

  const listBodyAnimatedStyle = useAnimatedStyle(() => {
    const progress = listRevealProgress.value;
    return {
      opacity: progress,
      transform: [
        {
          translateY: (1 - progress) * 12,
        },
      ],
    };
  }, [listRevealProgress]);

  const handleShowList = () => {
    if (!bottomSheetRef.current) return;
    // Ensure list view shows and mount list immediately
    setListfastview(true);
    bottomSheetRef.current.snapToIndex(1);
  };

  const distanceLabel = selectedFilters['거리'] || '1km';
  const categoryLabel = selectedFilters['카테고리'] || '카테고리';
  const peopleLabel = selectedFilters['인원'] || '인원';
  const alcoholLabel = selectedFilters['주종'] || '주종';
  const storeatmVal = selectedFilters['매장분위기'];
  const storeatmCount = Array.isArray(storeatmVal)
    ? storeatmVal.length
    : storeatmVal
    ? 1
    : 0;
  const storeatmLabel =
    storeatmCount > 0 ? `매장분위기 ${storeatmCount}` : '매장분위기';
  const timeActive = selectedFilters['방문시간'] || '방문시간';
  const parkingLabel = selectedFilters['주차'] || '주차';
  const corkageLabel = selectedFilters['콜키지'] || '콜키지';
  const screenLabel = selectedFilters['스크린'] || '스크린';
  const roomLabel = selectedFilters['룸'] || '룸';
  const outdoorLabel = selectedFilters['야장'] || '야장';

  let computedLabels = null;
  const renderSheetBody = () => {
    if (detailStoreId) {
      if (detailStore) {
        return (
          <BottomSheetScrollView
            contentContainerStyle={{
              paddingHorizontal: 0,
              paddingBottom: insets.bottom,
            }}
            showsVerticalScrollIndicator={false}>
            {/* Back moved to custom handle */}
            <View onLayout={handleDetailLayout}>
              <MapDetailItem
                storeData={detailStore}
                index={selectedStoreIndex}
                selectedStoreIndex={selectedStoreIndex}
                setSelectedStore={setSelectedStore}
                moveCenterMap={moveCenterMap}
                navigation={navigation}
                location={location}
                loading={loading}
                sheetIndex={currentIndex}
                onCloseDetail={handleCloseDetail}
                onHeaderLayout={handleDetailHeaderLayout}
                detailRevealProgressValue={detailRevealProgress}
                detailPointerEnabled={detailPointerEnabled}
              />
            </View>
          </BottomSheetScrollView>
        );
      }
      return (
        <View style={styles.detailLoadingContainer}>
          {detailStoreLoading ? (
            <MapDetailItemSkeleton />
          ) : (
            <Text style={styles.detailLoadingText}>
              매장 정보를 불러오지 못했어요.
            </Text>
          )}
        </View>
      );
    }

    let listContent = null;
    if (storegetloading) {
      if (currentIndex >= 1 || listfastview) {
        listContent = (
          <FlatList
            data={[1, 2, 3]}
            keyExtractor={(item, index) => index.toString()}
            renderItem={() => <MapStoreItemSkeleton />}
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged.current}
            viewabilityConfig={viewabilityConfig.current}
          />
        );
      } else {
        listContent = null;
      }
    } else if (stores.length === 0 && !loading) {
      listContent = renderNoStoreView();
    } else if (currentIndex < 1 && !listfastview) {
      listContent = <View />;
    } else {
      listContent = (
        <FlatList
          ref={flatListRef}
          data={stores}
          keyExtractor={keyExtractor}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            ...styles.listContentContainer,
            ...(currentIndex === 1 && {
              paddingBottom: SCREEN_HEIGHT * 0.25 + insets.bottom,
            }),
          }}
          onScroll={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          scrollEventThrottle={16}
          onViewableItemsChanged={onViewableItemsChanged.current}
          viewabilityConfig={viewabilityConfig.current}
          renderItem={renderItem}
          extraData={selectedStoreIndex}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={10}
          updateCellsBatchingPeriod={16}
          removeClippedSubviews
          onEndReached={() => {
            if (hasMoreStores && !loadingMoreStores) {
              onLoadMoreStores?.();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMoreStores ? (
              <FlatList
                data={[1, 2, 3]}
                keyExtractor={(item, index) => index.toString()}
                renderItem={() => <MapStoreItemSkeleton />}
                showsVerticalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged.current}
                viewabilityConfig={viewabilityConfig.current}
              />
            ) : null
          }
        />
      );
    }

    return (
      <Animated.View
        style={[styles.listAnimatedContainer, listBodyAnimatedStyle]}
        pointerEvents={listModeCollapsed ? 'none' : 'auto'}>
        {listContent}
      </Animated.View>
    );
  };
  return (
    <>
      {isFlatListVisible && (
        <>
          {stores.length > 0 && currentIndex === 0 && (
            <Pressable
              style={[
                styles.listButton,
                {
                  bottom: detailCollapsedHeight + 20,
                },
              ]}
              onPress={handleShowList}>
              <Ionicons name="list" color="#000" size={17} />
              <Text style={styles.listButtonText}>목록보기</Text>
            </Pressable>
          )}

          <BottomSheet
            ref={bottomSheetRef}
            index={initialIndex}
            snapPoints={snapPoints}
            detached
            style={styles.sheet}
            bottomInset={0}
            handleIndicatorStyle={{backgroundColor: '#D1D5DB'}}
            backgroundStyle={{
              borderTopRightRadius: 16,
              borderTopLeftRadius: 16,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
            }}
            enableContentPanningGesture={false}
            enableHandlePanningGesture={!filterModalVisible}
            enableOverDrag={false}
            animatedIndex={animatedIndex}
            onChange={handleSheetChange}>
            <BottomSheetView style={{flex: 1}}>
              {(() => {
                const filters = mapSearchCtx?.selectedFilters || {};
                const findExistingKey = (filtersObj, hint) => {
                  if (!filtersObj) return hint;
                  if (Object.prototype.hasOwnProperty.call(filtersObj, hint))
                    return hint;
                  const keys = Object.keys(filtersObj || {});
                  const compact = s => (s || '').replace(/\s/g, '');
                  const found = keys.find(k =>
                    compact(k).includes(compact(hint)),
                  );
                  return found || hint;
                };
                const keyDistance = findExistingKey(filters, '거리');
                const keyCategory = findExistingKey(filters, '카테고리');
                const keyPeople = findExistingKey(filters, '인원');
                const keyAlcohol = findExistingKey(filters, '주종');
                const keyStoreatm = findExistingKey(filters, '매장분위기');
                const keyTime = findExistingKey(filters, '방문시간');
                const keyParking = findExistingKey(filters, '주차');
                const keyCorkage = findExistingKey(filters, '콜키지');
                const keyScreen = findExistingKey(filters, '스크린');
                const keyRoom = findExistingKey(filters, '룸');
                const keyOutdoor = findExistingKey(filters, '야장');
                const getVal = (key, def) => filters?.[key] ?? def;

                // expose computed labels into JSX via closure variables
                const storeatmVal = getVal(keyStoreatm, []);
                const storeatmCount = Array.isArray(storeatmVal)
                  ? storeatmVal.length
                  : storeatmVal
                  ? 1
                  : 0;
                computedLabels = {
                  distance: getVal(keyDistance, '1km'),
                  category: getVal(keyCategory, '카테고리'),
                  people: getVal(keyPeople, '인원'),
                  alcohol: getVal(keyAlcohol, '주종'),
                  storeatm: getVal(keyStoreatm, '매장분위기'),
                  time: getVal(keyTime, '방문시간'),
                  parking: getVal(keyParking, '주차'),
                  corkage: getVal(keyCorkage, '콜키지'),
                  screen: getVal(keyScreen, '스크린'),
                  room: getVal(keyRoom, '룸'),
                  outdoor: getVal(keyOutdoor, '야장'),
                  storeatmCount: storeatmCount,
                };

                return null;
              })()}

              {!hideFloatingButtons && (
                <View style={styles.floatingButtons}>
                  <MapLocation onPress={updateNewLocation} />
                </View>
              )}

              {!isDetailMode && (
                <MapFilterHeader
                  setFilterInitialTab={setFilterInitialTab}
                  setFilterModalVisible={setFilterModalVisible}
                  setFilterheight={setFilterheight}
                  distanceLabel={computedLabels?.distance || distanceLabel}
                  categoryLabel={computedLabels?.category || categoryLabel}
                  peopleLabel={computedLabels?.people || peopleLabel}
                  alcoholLabel={computedLabels?.alcohol || alcoholLabel}
                  timeActive={computedLabels?.time || timeActive}
                  parkingLabel={computedLabels?.parking || parkingLabel}
                  corkageLabel={computedLabels?.corkage || corkageLabel}
                  screenLabel={computedLabels?.screen || screenLabel}
                  roomLabel={computedLabels?.room || roomLabel}
                  outdoorLabel={computedLabels?.outdoor || outdoorLabel}
                  storeatmLabel={computedLabels?.storeatm || storeatmLabel}
                  storeatmCount={computedLabels?.storeatmCount || storeatmCount}
                />
              )}

              {renderSheetBody()}
            </BottomSheetView>
          </BottomSheet>
        </>
      )}

      <FilterPotal
        filterModalVisible={filterModalVisible}
        setFilterModalVisible={setFilterModalVisible}
        selectedFilters={mapSearchCtx?.selectedFilters || {}}
        setSelectedFilters={mapSearchCtx?.setSelectedFilters}
        initialTab={filterInitialTab}
        setRadiusint={v => {
          try {
            setRadiusint?.(v);
            mapSearchCtx?.setRadiusKm?.(v);
          } catch (e) {}
        }}
        onApply={filters => onApplyFilters?.(filters)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  sheet: {
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -2}, // 🔥 위쪽 그림자(-)
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  listContentContainer: {paddingBottom: 18},
  floatingButtons: {
    position: 'absolute',
    top: -85,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 1,
  },
  detailLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  detailLoadingText: {
    marginTop: 8,
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
  },
  listButton: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 2,
    borderRadius: 17,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 4,
    elevation: 3,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 2,
  },
  listButtonText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
  },
  detailCloseButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 6,
    marginBottom: 6,
    zIndex: 4,
    bottom: 50,
    right: 30,
    elevation: 2,
  },
  handleRow: {
    height: 44,
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    alignSelf: 'flex-start',
  },
  handleContainer: {
    height: 44,
    width: '100%',
    justifyContent: 'center',
  },
  handleBack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  handleTitle: {
    marginLeft: 6,
    maxWidth: '80%',
    fontSize: 14,
    color: '#111',
    fontFamily: 'Pretendard-SemiBold',
  },
  handleCenter: {
    display: 'none',
  },
  handleCenterOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  handleIndicator: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  collapsedSpacer: {
    width: '100%',
  },
  listAnimatedContainer: {
    flex: 1,
  },
});

export default MapStoreList;
