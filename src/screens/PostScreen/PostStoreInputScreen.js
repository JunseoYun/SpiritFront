import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  FlatList,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../utils/CustomText';
import FastImage from 'react-native-fast-image';
import ColorUtil from '../../utils/ColorUtil';
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {
  Store_getby_liked,
  Store_getby_store,
  Store_getby_viewed,
} from '../../api/storeApi';
import PostStoreResultItem from '../../components/Post/PostStoreResultItem';
import CancelText from '../../components/CancelText/CancelText';
import CustomTextInput from '../../utils/CustomTextInput';

const {width} = Dimensions.get('window');
const MAX_LANDSCAPE_RATIO = 16 / 9;
const PostStoreInputScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const preview = route?.params?.preview ?? {};
  const photos = Array.isArray(preview.photos) ? preview.photos : [];
  const previewMode = preview.previewMode ?? 'crop';
  const baseFrame = preview.baseFrame ?? {};
  const baseIsPortraitPhoto = baseFrame.isPortraitPhoto ?? true;
  const baseLandscapeAspectRatio = baseFrame.landscapeAspectRatio ?? 1;
  const hasMultiplePhotos = photos.length > 1;
  const previewItemWidth = hasMultiplePhotos ? width * 0.86 : width;
  const previewSidePadding = hasMultiplePhotos ? 6 : 20;
  const previewItemSpacing = hasMultiplePhotos ? 2 : 0;
  const clampedLandscapeRatio = Math.min(
    baseLandscapeAspectRatio || 1,
    MAX_LANDSCAPE_RATIO,
  );
  const previewAspectRatio =
    previewMode === 'full'
      ? 1
      : baseIsPortraitPhoto
      ? 3 / 4
      : clampedLandscapeRatio;
  const bottomSheetRef = useRef(null);
  const searchInputRef = useRef(null);
  const bottomSheetSnapPoints = useMemo(() => ['20%', '45%', '90%'], []);
  const storeGridGap = 14;
  const storeCardWidth = useMemo(
    () => (width - 16 * 2 - storeGridGap) / 2,
    [storeGridGap],
  );
  const [activeChip, setActiveChip] = useState('viewed');
  const [searchValue, setSearchValue] = useState('');
  const [selectedStore, setSelectedStore] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchState, setSearchState] = useState({
    items: [],
    loading: false,
  });
  const [viewedState, setViewedState] = useState({
    items: [],
    loading: false,
    loaded: false,
  });
  const [likedState, setLikedState] = useState({
    items: [],
    loading: false,
    loaded: false,
  });

  useEffect(() => {
    const fetchViewed = async () => {
      setViewedState(prev => ({...prev, loading: true}));
      try {
        const data = await Store_getby_viewed(0);

        const items = Array.isArray(data?.content)
          ? data.content
          : Array.isArray(data)
          ? data
          : [];
        setViewedState({items, loading: false, loaded: true});
      } catch (error) {
        console.error('최근 본 매장 조회 실패:', error);
        setViewedState(prev => ({...prev, loading: false, loaded: true}));
      }
    };

    const fetchLiked = async () => {
      setLikedState(prev => ({...prev, loading: true}));
      try {
        const items = (await Store_getby_liked(0)) ?? [];
        setLikedState({items, loading: false, loaded: true});
      } catch (error) {
        console.error('저장한 매장 조회 실패:', error);
        setLikedState(prev => ({...prev, loading: false, loaded: true}));
      }
    };

    if (activeChip === 'viewed' && !viewedState.loaded) {
      fetchViewed();
    }
    if (activeChip === 'liked' && !likedState.loaded) {
      fetchLiked();
    }
  }, [activeChip, likedState.loaded, viewedState.loaded]);

  useEffect(() => {
    const trimmed = searchValue.trim();
    let isActive = true;

    const fetchStores = async () => {
      if (!trimmed) {
        setSearchState({items: [], loading: false});
        return;
      }
      setSearchState(prev => ({...prev, loading: true}));
      try {
        const data = await Store_getby_store(0, trimmed);
        if (!isActive) return;
        setSearchState({
          items: data?.content ?? [],
          loading: false,
        });
      } catch (error) {
        console.error('매장 검색 실패:', error);
        if (isActive) {
          setSearchState(prev => ({...prev, loading: false}));
        }
      }
    };

    fetchStores();
    return () => {
      isActive = false;
    };
  }, [searchValue]);

  const getStoreId = store => store?.id ?? store?.storeId ?? store?.store_id;

  const handleSelectStore = store => {
    setSelectedStore(prev => {
      const prevId = getStoreId(prev);
      const nextId = getStoreId(store);
      return prevId && nextId && prevId === nextId ? null : store;
    });
    requestAnimationFrame(() => {
      bottomSheetRef.current?.snapToIndex(1);
    });
  };
  const activeItems =
    activeChip === 'viewed' ? viewedState.items : likedState.items;
  const activeLoading =
    activeChip === 'viewed' ? viewedState.loading : likedState.loading;
  const trimmedSearchValue = searchValue.trim();
  const isSearching = trimmedSearchValue.length > 0;
  const displayedItems = isSearching ? searchState.items : activeItems;
  const displayedLoading = isSearching ? searchState.loading : activeLoading;

  const handleChipPress = useCallback(chipKey => {
    setActiveChip(chipKey);
    bottomSheetRef.current?.snapToIndex(2);
  }, []);

  const handleManualPress = useCallback(() => {
    setSearchValue('');
    setActiveChip('manual');
    bottomSheetRef.current?.snapToIndex(2);
  }, []);

  const handleSheetChange = useCallback(
    index => {
      if (index < 2 && isSearchFocused) {
        searchInputRef.current?.blur?.();
        Keyboard.dismiss();
      }
    },
    [isSearchFocused],
  );

  const handleSheetScroll = useCallback(() => {
    if (isSearchFocused) {
      searchInputRef.current?.blur?.();
      Keyboard.dismiss();
    }
  }, [isSearchFocused]);

  const renderPhoto = ({item, index}) => {
    const isLast = index === photos.length - 1;

    return (
      <View
        style={[
          styles.previewItem,
          {
            width: previewItemWidth,
            paddingHorizontal: previewSidePadding,
            marginRight: isLast ? 0 : previewItemSpacing,
          },
        ]}>
        <View style={[styles.previewStage, {aspectRatio: previewAspectRatio}]}>
          <FastImage
            source={{uri: item.uri}}
            style={styles.previewImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        </View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0),
          paddingBottom: insets.bottom,
        },
      ]}>
      <View style={styles.header}>
        <Pressable
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#111" />
        </Pressable>
        <CustomText style={styles.headerTitle}>매장 입력</CustomText>
        <Pressable
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={() => {}}>
          <CustomText style={styles.nextText}>다음</CustomText>
        </Pressable>
      </View>
      <Pressable
        style={styles.selectedStoreRow}
        onPress={() => {
          if (!selectedStore) {
            bottomSheetRef.current?.snapToIndex(2);
          }
        }}
        disabled={Boolean(selectedStore)}>
        <View style={styles.selectedStoreIcon}>
          <Ionicons
            name="storefront"
            size={16}
            color={selectedStore ? '#1F2937' : '#9CA3AF'}
          />
        </View>
        <CustomText
          style={
            selectedStore
              ? styles.selectedStoreText
              : styles.selectedStorePlaceholder
          }
          numberOfLines={1}>
          {selectedStore?.name || '선택된 매장이 없어요.'}
        </CustomText>
        {selectedStore && (
          <Pressable
            onPress={() => setSelectedStore(null)}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            style={styles.selectedStoreClear}>
            <CustomText style={styles.selectedStoreClearText}>삭제</CustomText>
          </Pressable>
        )}
      </Pressable>
      {photos.length ? (
        <FlatList
          data={photos}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderPhoto}
          contentContainerStyle={
            hasMultiplePhotos ? styles.previewList : undefined
          }
        />
      ) : (
        <View
          style={[
            styles.previewItem,
            {
              width: previewItemWidth,
              paddingHorizontal: previewSidePadding,
            },
          ]}>
          <View style={styles.previewStage}>
            <View style={styles.emptyState}>
              <CustomText style={styles.emptyText}>
                미리볼 사진이 없습니다.
              </CustomText>
            </View>
          </View>
        </View>
      )}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={bottomSheetSnapPoints}
        handleIndicatorStyle={styles.sheetHandleIndicator}
        backgroundStyle={[styles.sheetBackground]}
        onChange={handleSheetChange}>
        <BottomSheetView style={[styles.bottomSheetHeader]}>
          <View style={styles.searchRow}>
            <Ionicons name="search-outline" size={18} color="#7A7A7A" />
            <CustomTextInput
              ref={searchInputRef}
              style={styles.searchInput}
              value={searchValue}
              onChangeText={setSearchValue}
              onFocus={() => {
                setIsSearchFocused(true);
                bottomSheetRef.current?.snapToIndex(2);
              }}
              onBlur={() => setIsSearchFocused(false)}
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => searchInputRef.current?.blur?.()}
              placeholder="매장명을 검색하세요."
              placeholderTextColor="#9B9B9B"
            />
            {Boolean(searchValue) && (
              <CancelText
                rightnum={10}
                centerVertical
                paddingnum={4}
                handlecancel={setSearchValue}
                size={20}
              />
            )}
          </View>
        </BottomSheetView>
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.bottomSheetContent,
            {paddingBottom: Math.max(insets.bottom, 20)},
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScroll={handleSheetScroll}
          scrollEventThrottle={16}>
          {!isSearching && (
            <View style={styles.chipRow}>
              <Pressable
                style={[
                  styles.chip,
                  activeChip === 'viewed' && styles.chipActive,
                ]}
                onPress={() => handleChipPress('viewed')}
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                <CustomText
                  style={[
                    styles.chipText,
                    activeChip === 'viewed' && styles.chipActiveText,
                  ]}>
                  최근 본
                </CustomText>
              </Pressable>
              <Pressable
                style={[
                  styles.chip,
                  activeChip === 'liked' && styles.chipActive,
                ]}
                onPress={() => handleChipPress('liked')}
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                <CustomText
                  style={[
                    styles.chipText,
                    activeChip === 'liked' && styles.chipActiveText,
                  ]}>
                  저장한
                </CustomText>
              </Pressable>

              <Pressable
                style={[
                  styles.chip,
                  activeChip === 'manual' && styles.chipActive,
                ]}
                onPress={() => handleChipPress('manual')}
                hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                <CustomText
                  style={[
                    styles.chipText,
                    activeChip === 'manual' && styles.chipActiveText,
                  ]}>
                  직접 입력
                </CustomText>
              </Pressable>
            </View>
          )}
          {(isSearching || activeChip !== 'manual') && (
            <View style={styles.storeGrid}>
              {displayedLoading ? (
                <CustomText style={styles.emptyStoreText}>
                  불러오는 중...
                </CustomText>
              ) : displayedItems.length === 0 ? (
                <CustomText style={styles.emptyStoreText}>
                  {isSearching
                    ? '검색된 매장이 없어요.'
                    : activeChip === 'viewed'
                    ? '최근 본 매장이 없어요.'
                    : '저장한 매장이 없어요.'}
                </CustomText>
              ) : (
                displayedItems.map((store, index) => {
                  const storeId = getStoreId(store);
                  const isSelected = getStoreId(selectedStore) === storeId;
                  return (
                    <View
                      key={String(storeId)}
                      style={[
                        styles.storeCardWrap,
                        {
                          width: storeCardWidth,
                          marginRight: index % 2 === 0 ? storeGridGap : 0,
                        },
                      ]}>
                      <PostStoreResultItem
                        store={store}
                        width={storeCardWidth}
                        onPress={handleSelectStore}
                      />
                      {isSelected && (
                        <View style={styles.storeCardCheck}>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color="#4AA3FF"
                          />
                        </View>
                      )}
                    </View>
                  );
                })
              )}
            </View>
          )}
          {isSearching && (
            <View style={styles.manualEntryWrap}>
              <CustomText style={styles.manualEntryHint}>
                찾는 매장이 없다면 직접 입력해보세요.
              </CustomText>
              <Pressable
                style={styles.manualEntryButton}
                onPress={handleManualPress}>
                <CustomText style={styles.manualEntryText}>
                  직접 입력하기
                </CustomText>
              </Pressable>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#F1F1F1',
  },
  headerTitle: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#111',
  },
  nextText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#4AA3FF',
  },
  previewItem: {
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  previewList: {
    paddingHorizontal: 12,
  },
  previewStage: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ColorUtil.border,
    borderRadius: 7,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DDE2E6',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#666',
  },
  bottomSheetContent: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  bottomSheetHeader: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  sheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: -4},
    elevation: 12,
  },
  sheetHandleIndicator: {
    backgroundColor: '#E4E4E4',
    width: 48,
    height: 4,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F4F5F7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
    position: 'relative',
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#111',
    paddingRight: 28,
  },
  selectedStoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 14,
    borderColor: '#E5E7EB',
    marginHorizontal: 20,
  },
  selectedStoreIcon: {
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 6,
  },
  selectedStoreText: {
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#111827',
  },
  selectedStorePlaceholder: {
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#9CA3AF',
  },
  selectedStoreClear: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedStoreClearText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    color: '#EF4444',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: '#333',
    borderColor: '#333',
  },
  chipText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    color: '#333',
  },
  chipActiveText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    color: '#fff',
  },
  manualEntryButton: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#EEF6FF',
    marginTop: 7,
  },
  manualEntryWrap: {
    marginTop: 25,
    marginBottom: 20,
    alignItems: 'center',
    gap: 6,
  },
  manualEntryHint: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#3CBBFF',
  },
  manualEntryText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    color: '#4AA3FF',
  },
  storeGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  storeCardWrap: {
    marginTop: 10,
    marginBottom: 14,
  },
  storeCardCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 50,
    padding: 1,
  },
  emptyStoreText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
    color: '#9B9B9B',
    textAlign: 'center',
    paddingVertical: 14,
    width: '100%',
  },
  chipGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#EEF6FF',
  },
  chipGhostText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    color: '#4AA3FF',
  },
});

export default PostStoreInputScreen;
