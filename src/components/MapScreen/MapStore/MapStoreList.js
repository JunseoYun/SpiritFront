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

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

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
  onCloseDetail,
  groupStoreIds,
  onOpenDetail,
  onCloseGroup,
  bottomSheetRef,
}) => {
  // const bottomSheetRef = useRef(null);
  const insets = useSafeAreaInsets();
  const [filterheight, setFilterheight] = useState(0);
  const initialIndex = stores.length === 0 ? 1 : 1;
  const snapPoints = useMemo(() => {
    const first = SCREEN_HEIGHT * 0.03 + filterheight + insets.bottom; //
    const nonemid = SCREEN_HEIGHT * 0.3;
    const mid = SCREEN_HEIGHT * 0.55;
    const max = SCREEN_HEIGHT * 0.7;
    if (stores.length === 0 && !loading && !storegetloading) {
      return [first, nonemid];
    }
    // 상세보기 모드에서는 80% 스냅 비활성화
    if (detailStoreId) return [first, mid];
    return [first, mid, max];
  }, [stores, loading, storegetloading, detailStoreId]);

  const animatedIndex = useSharedValue(0);
  const [translateY, setTranslateY] = useState(0);
  const [showListButtons, setShowListButtons] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [itemheight, setItemheight] = useState(120);
  const [listfastview, setListfastview] = useState(null);
  const lastCenteredIndexRef = useRef(null);
  const currentSheetIndexRef = useRef(null);
  const mapMoveTimerRef = useRef(null);
  const didForceAfterLoadRef = useRef(true);
  const detailStore = useMemo(
    () => stores?.find?.(s => s.id === detailStoreId) || null,
    [stores, detailStoreId],
  );
  const groupFilteredStores = useMemo(
    () =>
      Array.isArray(groupStoreIds) && groupStoreIds.length > 0
        ? stores.filter(s => groupStoreIds.includes(s.id))
        : [],
    [stores, groupStoreIds],
  );
  const isGroupMode = groupFilteredStores.length > 0 && !detailStore;

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

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{translateY: withTiming(translateY, {duration: 250})}],
  }));

  const handleSheetChange = useCallback(
    index => {
      if (detailStore && index === 2) {
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
      setListfastview(index >= 1);
    },
    [detailStore, setSheetIndex],
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
    if ((detailStore || isGroupMode) && bottomSheetRef.current) {
      bottomSheetRef.current.snapToIndex(1);
    }
  }, [detailStore, isGroupMode]);

  const handleCloseDetail = useCallback(() => {
    const idx = detailStore
      ? stores.findIndex(s => s.id === detailStore.id)
      : -1;
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
  }, [detailStore, stores, onCloseDetail, flatListRef, itemheight]);

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

  useEffect(() => {
    if (!detailStore && !isGroupMode) return;

    const onBackPress = () => {
      if (detailStore) {
        handleCloseDetail();
      }
      if (isGroupMode) {
        handleCloseGroup();
      }
      return detailStore || isGroupMode ? true : false;
    };

    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      onBackPress,
    );

    return () => subscription.remove();
  }, [detailStore, isGroupMode]);

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

          moveCenterMap(
            freshStore.locationDto.latitude,
            freshStore.locationDto.longitude,
            currentSheetIndexRef.current,
            didForceAfterLoadRef.current,
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
    if (!bottomSheetRef.current) return;
    if (isFlatListVisible) bottomSheetRef.current.snapToIndex(0);
    else bottomSheetRef.current.close();
  }, [isFlatListVisible]);

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
  return (
    <>
      {isFlatListVisible && (
        <>
          {stores.length > 0 && currentIndex === 0 && (
            <Pressable
              style={[
                styles.listButton,
                {
                  bottom:
                    SCREEN_HEIGHT * 0.03 + 20 + filterheight + insets.bottom,
                },
              ]}
              onPress={handleShowList}>
              <Ionicons name="list" color="#000" size={17} />
              <Text style={styles.listButtonText}>목록보기</Text>
            </Pressable>
          )}

          <Animated.View style={[styles.floatingButtons, floatingStyle]}>
            <MapLocation onPress={updateNewLocation} />
          </Animated.View>

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

              {detailStore ? (
                <BottomSheetScrollView
                  contentContainerStyle={{
                    paddingHorizontal: 12,
                    paddingTop: 8,
                    paddingBottom: 24,
                  }}
                  showsVerticalScrollIndicator={false}>
                  <Pressable
                    onPress={handleCloseDetail}
                    style={styles.detailCloseButton}>
                    <Ionicons name="arrow-back" size={18} color="#111" />
                  </Pressable>
                  <MapDetailItem
                    item={detailStore}
                    index={selectedStoreIndex}
                    selectedStoreIndex={selectedStoreIndex}
                    setSelectedStore={setSelectedStore}
                    moveCenterMap={moveCenterMap}
                    navigation={navigation}
                    location={location}
                    loading={loading}
                    sheetIndex={currentIndex}
                  />
                </BottomSheetScrollView>
              ) : // :  isGroupMode ? (
              //   <View style={{flex: 1}}>
              //     <TouchableOpacity
              //       onPress={handleCloseGroup}
              //       style={styles.detailCloseButton}>
              //       <Ionicons name="arrow-back" size={18} color="#111" />
              //     </TouchableOpacity>
              //     <FlatList
              //       data={groupFilteredStores}
              //       keyExtractor={keyExtractor}
              //       showsVerticalScrollIndicator={false}
              //       contentContainerStyle={{
              //         ...styles.listContentContainer,
              //         ...(currentIndex === 1 && {
              //           paddingBottom: SCREEN_HEIGHT * 0.25,
              //         }),
              //       }}
              //       renderItem={renderFilteredItem}
              //       onScroll={handleScrollBeginDrag}
              //       onScrollEndDrag={handleScrollEndDrag} // ✅ 추가
              //     />
              //   </View>
              // )
              storegetloading ? (
                currentIndex >= 1 || listfastview ? (
                  <FlatList
                    data={[1, 2, 3]}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={() => <MapStoreItemSkeleton />}
                    showsVerticalScrollIndicator={false}
                    onViewableItemsChanged={onViewableItemsChanged.current}
                    viewabilityConfig={viewabilityConfig.current}
                  />
                ) : null
              ) : stores.length === 0 && !loading ? (
                renderNoStoreView()
              ) : currentIndex < 1 && !listfastview ? (
                <View />
              ) : (
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
                  onScrollEndDrag={handleScrollEndDrag} // ✅ 추가
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
                />
              )}
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
      />
    </>
  );
};

const styles = StyleSheet.create({
  sheet: {zIndex: 3},
  listContentContainer: {paddingBottom: 18},
  floatingButtons: {
    position: 'absolute',
    bottom: 20,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    zIndex: 1,
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
});

export default MapStoreList;
