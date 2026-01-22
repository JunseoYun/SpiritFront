import React, {
  useCallback,
  useLayoutEffect,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  View,
  UIManager,
  findNodeHandle,
  BackHandler,
  ToastAndroid,
} from 'react-native';
import {
  ScrollView,
  TapGestureHandler,
  State as GestureState,
} from 'react-native-gesture-handler';
import {TouchableOpacity} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../utils/CustomText';
import FastImage from 'react-native-fast-image';
import ColorUtil from '../../utils/ColorUtil';
import BottomSheet, {
  BottomSheetFlatList,
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
import {getLocation} from '../../storage/locationStorage';

const {width} = Dimensions.get('window');
const MAX_LANDSCAPE_RATIO = 16 / 9;

const PostStoreInputScreen = ({navigation, route}) => {
  const insets = useSafeAreaInsets();
  const preview = route?.params?.preview ?? {};
  const presetStore = route?.params?.presetStore ?? null;
  const reviewFlow = route?.params?.reviewFlow;
  const [location, setLocation] = useState(route?.params?.location ?? null);
  const [photoList, setPhotoList] = useState(
    Array.isArray(preview.photos) ? preview.photos : [],
  );
  const previewMode = preview.previewMode ?? 'crop';
  const baseFrame = preview.baseFrame ?? {};
  const baseIsPortraitPhoto = baseFrame.isPortraitPhoto ?? true;
  const baseLandscapeAspectRatio = baseFrame.landscapeAspectRatio ?? 1;
  const isStoreLocked = useMemo(() => {
    if (!presetStore) {
      return false;
    }
    const storeId =
      presetStore?.id ?? presetStore?.storeId ?? presetStore?.store_id;
    const storeName = presetStore?.name ?? presetStore?.storeName;
    const storeAddress = presetStore?.address ?? presetStore?.storeAddress;
    return Boolean(storeId || storeName || storeAddress);
  }, [presetStore]);
  const hasMultiplePhotos = photoList.length > 1;
  const previewItemWidth = hasMultiplePhotos ? width * 0.86 : width;
  const previewSidePadding = hasMultiplePhotos ? 6 : 20;
  const previewItemSpacing = hasMultiplePhotos ? 2 : 0;
  const previewForNext = useMemo(
    () => ({...preview, photos: photoList}),
    [photoList, preview],
  );
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
  const [placeName, setPlaceName] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [manualStoreName, setManualStoreName] = useState('');
  const [manualStoreAddress, setManualStoreAddress] = useState('');
  const [placeNameInput, setPlaceNameInput] = useState('');
  const [isManualNameFocused, setIsManualNameFocused] = useState(false);
  const [isManualAddressFocused, setIsManualAddressFocused] = useState(false);
  const [isPlaceFocused, setIsPlaceFocused] = useState(false);
  const [isManualNameOver, setIsManualNameOver] = useState(false);
  const [isManualAddressOver, setIsManualAddressOver] = useState(false);
  const [isPlaceNameOver, setIsPlaceNameOver] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const manualNameInputRef = useRef(null);
  const manualAddressInputRef = useRef(null);
  const placeNameInputRef = useRef(null);
  const focusedInputRef = useRef(null);
  const lastBackPressed = useRef(0);
  const sheetScrollRef = useRef(null);
  const focusStateRef = useRef({
    isSearchFocused: false,
    isManualNameFocused: false,
    isManualAddressFocused: false,
    isPlaceFocused: false,
    isManual: false,
  });
  const [searchState, setSearchState] = useState({
    items: [],
    loading: false,
    page: 0,
    totalPages: null,
    end: false,
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
    const loadLocation = async () => {
      if (location) return;
      try {
        const saved = await getLocation();
        setLocation(saved ?? null);
      } catch (error) {
        console.error('현재 위치 불러오기 실패:', error);
      }
    };
    loadLocation();
  }, [location]);

  useEffect(() => {
    focusStateRef.current = {
      isSearchFocused,
      isManualNameFocused,
      isManualAddressFocused,
      isPlaceFocused,
      isManual,
    };
  }, [
    isSearchFocused,
    isManualNameFocused,
    isManualAddressFocused,
    isPlaceFocused,
    isManual,
  ]);

  const scrollSheetToOffset = useCallback(offset => {
    if (sheetScrollRef.current?.scrollToOffset) {
      sheetScrollRef.current.scrollToOffset({offset, animated: true});
      return;
    }
    sheetScrollRef.current?.scrollTo?.({y: offset, animated: true});
  }, []);

  const scrollSheetToInput = useCallback(
    (inputRef, keyboardHeightOverride) => {
      const inputNode = findNodeHandle(inputRef?.current);
      const scrollNode =
        sheetScrollRef.current?.getScrollableNode?.() ??
        findNodeHandle(sheetScrollRef.current);
      if (!inputNode || !scrollNode) return;

      requestAnimationFrame(() => {
        UIManager.measureLayout(
          inputNode,
          scrollNode,
          () => {},
          (x, y, width, height) => {
            UIManager.measure(scrollNode, (sx, sy, sWidth, sHeight) => {
              const extraOffset = 16;
              const resolvedKeyboardHeight =
                keyboardHeightOverride ?? keyboardHeight;
              const visibleHeight = sHeight - resolvedKeyboardHeight;
              const inputBottom = y + height;
              if (
                resolvedKeyboardHeight > 0 &&
                inputBottom > visibleHeight - extraOffset
              ) {
                const targetOffset = y - (visibleHeight - height) + extraOffset;
                scrollSheetToOffset(Math.max(targetOffset, 0));
                return;
              }
              scrollSheetToOffset(Math.max(y - extraOffset, 0));
            });
          },
        );
      });
    },
    [keyboardHeight, scrollSheetToOffset],
  );

  useEffect(() => {
    const showListener = Keyboard.addListener('keyboardDidShow', event => {
      const nextKeyboardHeight = event?.endCoordinates?.height ?? 0;
      setKeyboardHeight(nextKeyboardHeight);
      if (focusStateRef.current.isSearchFocused) {
        return;
      }
      if (
        focusStateRef.current.isManual ||
        focusStateRef.current.isManualNameFocused ||
        focusStateRef.current.isManualAddressFocused ||
        focusStateRef.current.isPlaceFocused
      ) {
        if (focusedInputRef.current) {
          scrollSheetToInput(focusedInputRef.current, nextKeyboardHeight);
        }
      }
    });
    const hideListener = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0);
    });

    return () => {
      showListener.remove();
      hideListener.remove();
    };
  }, [scrollSheetToInput]);

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
        setSearchState({
          items: [],
          loading: false,
          page: 0,
          totalPages: null,
          end: false,
        });
        setIsManual(activeChip === 'manualStore');
        return;
      }
      setSearchState(prev => ({
        ...prev,
        loading: true,
        page: 0,
        end: false,
      }));
      try {
        const data = await Store_getby_store(0, trimmed);
        if (!isActive) return;
        const totalPages = Number.isFinite(data?.totalPages)
          ? data.totalPages
          : null;
        setSearchState({
          items: data?.content ?? [],
          loading: false,
          page: 0,
          totalPages,
          end:
            (data?.content?.length ?? 0) === 0 ||
            (totalPages !== null ? 0 >= totalPages - 1 : false),
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
  }, [activeChip, searchValue]);

  const getStoreId = store => store?.id ?? store?.storeId ?? store?.store_id;
  const getStoreAddress = store => {
    if (!store) return '';
    const base = store?.locationDto?.address ?? '';
    const detail = store?.locationDto?.addressDetail;
    if (detail && base && base !== detail) {
      return `${base}, ${detail}`;
    }
    return base;
  };

  useEffect(() => {
    if (!isStoreLocked || !presetStore) {
      return;
    }
    const storeId =
      presetStore?.id ?? presetStore?.storeId ?? presetStore?.store_id ?? null;
    const storeName = presetStore?.name ?? presetStore?.storeName ?? '';
    const storeAddress =
      presetStore?.address ?? presetStore?.storeAddress ?? '';
    setSelectedStore({
      id: storeId,
      name: storeName,
      locationDto: {address: storeAddress},
    });
    setPlaceName('');
    setPlaceNameInput('');
    setManualStoreName('');
    setManualStoreAddress('');
  }, [isStoreLocked, presetStore]);

  const handleSelectStore = store => {
    setSelectedStore(prev => {
      const prevId = getStoreId(prev);
      const nextId = getStoreId(store);
      const nextStore = prevId && nextId && prevId === nextId ? null : store;
      if (nextStore) {
        console.log('선택한 매장 정보:', nextStore);
      }
      return nextStore;
    });
    setPlaceName('');
    requestAnimationFrame(() => {
      bottomSheetRef.current?.snapToIndex(1);
    });
  };
  const activeItems =
    activeChip === 'viewed'
      ? viewedState.items
      : activeChip === 'liked'
      ? likedState.items
      : [];
  const activeLoading =
    activeChip === 'viewed'
      ? viewedState.loading
      : activeChip === 'liked'
      ? likedState.loading
      : false;
  const trimmedSearchValue = searchValue.trim();
  const isSearching = trimmedSearchValue.length > 0;
  const displayedItems = isSearching ? searchState.items : activeItems;
  const displayedLoading = isSearching
    ? searchState.loading && searchState.items.length === 0
    : activeLoading;
  const trimmedPlaceName = placeName.trim();
  const selectedAddressText = trimmedPlaceName
    ? ''
    : selectedStore?.id === 'manual'
    ? (selectedStore?.address ?? '').trim()
    : getStoreAddress(selectedStore);
  const isNextEnabled = true;

  const handleChipPress = useCallback(chipKey => {
    setActiveChip(chipKey);
    if (chipKey === 'manualStore' || chipKey === 'place') {
      setSearchValue('');
    }
    setIsManual(chipKey === 'manualStore');
    bottomSheetRef.current?.snapToIndex(2);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();
        if (now - lastBackPressed.current < 2000) {
          navigation.goBack();
          return true;
        }

        lastBackPressed.current = now;

        ToastAndroid.show(
          '한 번 더 누르면 작성한 내용이 사라집니다.',
          ToastAndroid.SHORT,
        );
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  const handleManualPress = useCallback(() => {
    setSearchValue('');
    setActiveChip('manualStore');
    setIsManual(true);
    bottomSheetRef.current?.snapToIndex(2);
  }, []);

  const handleManualCancel = useCallback(() => {
    setIsManual(false);
    setManualStoreName('');
    setManualStoreAddress('');
    setIsManualNameOver(false);
    setIsManualAddressOver(false);
    manualNameInputRef.current?.blur?.();
    manualAddressInputRef.current?.blur?.();
    Keyboard.dismiss();
  }, []);

  const handleManualSubmit = useCallback(() => {
    const trimmedName = manualStoreName.trim();
    if (!trimmedName) {
      return;
    }
    const trimmedAddress = manualStoreAddress.trim();
    setSelectedStore({
      id: 'manual',
      name: trimmedName,
      address: trimmedAddress,
    });
    setPlaceName('');
    setManualStoreName('');
    setManualStoreAddress('');
    setIsManualNameOver(false);
    setIsManualAddressOver(false);
    setIsManualNameFocused(false);
    setIsManualAddressFocused(false);
    setIsManual(true);
    setSearchValue('');
    manualNameInputRef.current?.blur?.();
    manualAddressInputRef.current?.blur?.();
    Keyboard.dismiss();
    bottomSheetRef.current?.snapToIndex(0);
  }, [manualStoreAddress, manualStoreName]);

  const handlePlaceSubmit = useCallback(() => {
    const trimmedName = placeNameInput.trim();
    if (!trimmedName) {
      return;
    }
    setPlaceName(trimmedName);
    setSelectedStore(null);
    setPlaceNameInput('');
    setIsPlaceNameOver(false);
    setIsPlaceFocused(false);
    setSearchValue('');
    manualNameInputRef.current?.blur?.();
    placeNameInputRef.current?.blur?.();
    Keyboard.dismiss();
    bottomSheetRef.current?.snapToIndex(0);
  }, [placeNameInput]);

  const isManualEmpty =
    manualStoreName.trim().length === 0 &&
    manualStoreAddress.trim().length === 0;
  const isManualCancelMode = isManual && isManualEmpty;
  const isManualSubmitDisabled =
    !isManualCancelMode &&
    (manualStoreName.trim().length === 0 ||
      manualStoreAddress.trim().length === 0);

  const isPlaceSubmitDisabled = placeNameInput.trim().length === 0;

  const handleManualAddressSelect = useCallback(value => {
    if (value?.address) {
      setManualStoreAddress(value.address);
    }
  }, []);

  const handleSheetChange = useCallback(
    index => {
      if (index < 2 && isSearchFocused) {
        searchInputRef.current?.blur?.();
      }
      if (index < 2 && isManualNameFocused) {
        manualNameInputRef.current?.blur?.();
      }
      if (index < 2 && isManualAddressFocused) {
        manualAddressInputRef.current?.blur?.();
      }
      if (index < 2 && isPlaceFocused) {
        placeNameInputRef.current?.blur?.();
      }
      if (
        index < 2 &&
        (isSearchFocused ||
          isManualNameFocused ||
          isManualAddressFocused ||
          isPlaceFocused)
      ) {
        Keyboard.dismiss();
      }
    },
    [
      isSearchFocused,
      isManualNameFocused,
      isManualAddressFocused,
      isPlaceFocused,
    ],
  );

  useLayoutEffect(() => {
    const isIOS = Platform.OS === 'ios';

    navigation.setOptions({
      gestureEnabled: !isIOS,
    });
  }, [navigation]);

  const loadMoreSearch = useCallback(async () => {
    const trimmed = searchValue.trim();
    if (!trimmed) return;

    let nextPage;
    setSearchState(prev => {
      if (prev.loading || prev.end) {
        return prev;
      }
      nextPage = prev.page + 1;
      return {...prev, loading: true};
    });

    if (nextPage === undefined) return;

    try {
      const data = await Store_getby_store(nextPage, trimmed);
      setSearchState(prev => {
        const nextItems = [
          ...prev.items,
          ...(Array.isArray(data?.content) ? data.content : []),
        ];
        const unique = Array.from(
          new Map(nextItems.map(store => [getStoreId(store), store])).values(),
        );
        const totalPages = Number.isFinite(data?.totalPages)
          ? data.totalPages
          : prev.totalPages;
        const isEnd =
          (data?.content?.length ?? 0) === 0 ||
          (totalPages !== null ? nextPage >= totalPages - 1 : false);
        return {
          ...prev,
          items: unique,
          loading: false,
          page: nextPage,
          totalPages,
          end: isEnd,
        };
      });
    } catch (error) {
      console.error('매장 추가 검색 실패:', error);
      setSearchState(prev => ({...prev, loading: false}));
    }
  }, [searchValue]);

  const handleSheetScroll = useCallback(() => {
    if (isSearchFocused) {
      searchInputRef.current?.blur?.();
      Keyboard.dismiss();
    }
  }, [isSearchFocused]);

  const handleSearchEndReached = useCallback(() => {
    if (!isSearching || searchState.loading || searchState.end) {
      return;
    }
    loadMoreSearch();
  }, [isSearching, loadMoreSearch, searchState.end, searchState.loading]);

  const keyboardPadding = Math.max(
    0,
    keyboardHeight - insets.bottom + (Platform.OS === 'android' ? 30 : 0),
  );

  const renderPhoto = (item, index) => {
    const isLast = index === photoList.length - 1;
    const canRemove = photoList.length > 1;

    return (
      <View
        key={item.id ?? `${item.uri}-${index}`}
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
        {canRemove && (
          <TapGestureHandler
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            shouldCancelWhenOutside
            onHandlerStateChange={({nativeEvent}) => {
              if (nativeEvent.state === GestureState.END) {
                setPhotoList(prev =>
                  prev.length > 1 ? prev.filter((_, i) => i !== index) : prev,
                );
              }
            }}>
            <View style={styles.previewRemoveButton}>
              <Ionicons name="close" size={18} color="#fff" />
            </View>
          </TapGestureHandler>
        )}
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
          onPress={() => {
            const hasPlaceName = trimmedPlaceName.length > 0;
            const resolvedStoreId = hasPlaceName
              ? null
              : getStoreId(selectedStore);
            const storeId =
              resolvedStoreId && resolvedStoreId !== 'manual'
                ? resolvedStoreId
                : null;
            navigation.navigate('PostWriteScreen', {
              preview: previewForNext,
              storeName: hasPlaceName ? '' : selectedStore?.name ?? '',
              storeAddress: hasPlaceName ? '' : selectedAddressText,
              placeName: hasPlaceName ? trimmedPlaceName : '',
              storeId,
              reviewFlow,
            });
          }}
          disabled={!isNextEnabled}>
          <CustomText
            style={[
              styles.nextText,
              !isNextEnabled && styles.nextTextDisabled,
            ]}>
            다음
          </CustomText>
        </Pressable>
      </View>
      <Pressable
        style={styles.selectedStoreRow}
        onPress={() => {
          if (!isStoreLocked && !selectedStore && !trimmedPlaceName) {
            bottomSheetRef.current?.snapToIndex(2);
          }
        }}
        disabled={isStoreLocked || Boolean(selectedStore || trimmedPlaceName)}>
        <View style={styles.selectedStoreIcon}>
          <Ionicons name="storefront-outline" size={16} color="#333" />
        </View>
        <View style={styles.selectedStoreInfo}>
          {trimmedPlaceName ? (
            <View style={styles.selectedStorePlaceholderWrap}>
              <CustomText
                style={[
                  styles.selectedStoreText,
                  styles.selectedStoreTextSingle,
                ]}
                numberOfLines={1}>
                {trimmedPlaceName}
              </CustomText>
            </View>
          ) : !selectedStore?.name && !selectedAddressText ? (
            <View style={styles.selectedStorePlaceholderWrap}>
              <CustomText
                style={styles.selectedStorePlaceholder}
                numberOfLines={1}>
                장소 선택
              </CustomText>
            </View>
          ) : (
            <>
              <CustomText style={styles.selectedStoreText} numberOfLines={1}>
                {selectedStore?.name}
              </CustomText>
              <CustomText
                style={
                  selectedAddressText
                    ? styles.selectedStoreAddress
                    : styles.selectedAddressPlaceholder
                }
                numberOfLines={1}>
                {selectedAddressText || '매장 주소'}
              </CustomText>
            </>
          )}
        </View>
        {!isStoreLocked && (selectedStore || trimmedPlaceName) && (
          <Pressable
            onPress={() => {
              setSelectedStore(null);
              setPlaceName('');
              if (activeChip === 'place') {
                setPlaceNameInput('');
              }
            }}
            hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
            style={styles.selectedStoreClear}>
            <CustomText style={styles.selectedStoreClearText}>삭제</CustomText>
          </Pressable>
        )}
      </Pressable>
      {photoList.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            hasMultiplePhotos ? styles.previewList : undefined
          }>
          {photoList.map(renderPhoto)}
        </ScrollView>
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
      {!isStoreLocked ? (
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={bottomSheetSnapPoints}
          enableContentPanningGesture
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
                placeholder="매장 이름을 검색하세요."
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
          {isSearching ? (
            <BottomSheetFlatList
              ref={sheetScrollRef}
              data={displayedItems}
              keyExtractor={(item, index) => String(getStoreId(item) ?? index)}
              numColumns={2}
              renderItem={({item, index}) => {
                const storeId = getStoreId(item);
                const isSelected = getStoreId(selectedStore) === storeId;
                return (
                  <View
                    style={[
                      styles.storeCardWrap,
                      {
                        width: storeCardWidth,
                        marginRight: index % 2 === 0 ? storeGridGap : 0,
                      },
                    ]}>
                    <PostStoreResultItem
                      store={item}
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
              }}
              contentContainerStyle={[
                styles.bottomSheetContent,
                {paddingBottom: Math.max(insets.bottom, 20) + keyboardPadding},
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
              onScroll={handleSheetScroll}
              scrollEventThrottle={16}
              onEndReached={handleSearchEndReached}
              onEndReachedThreshold={0.4}
              ListEmptyComponent={
                displayedLoading ? (
                  <CustomText style={styles.emptyStoreText}>
                    불러오는 중...
                  </CustomText>
                ) : (
                  <CustomText style={styles.emptyStoreText}>
                    검색된 매장이 없어요.
                  </CustomText>
                )
              }
              ListFooterComponent={
                <>
                  {isManual && !isSearching ? (
                    <View style={styles.manualForm}>
                      <CustomText style={styles.manualLabel}>
                        매장 이름
                      </CustomText>
                      <CustomTextInput
                        ref={manualNameInputRef}
                        style={[
                          styles.manualInput,
                          isManualNameFocused && styles.manualInputFocused,
                          manualStoreName.length > 0 &&
                            styles.manualInputFilled,
                        ]}
                        value={manualStoreName}
                        onChangeText={text => {
                          const maxChars = 50;
                          if (text.length > maxChars) {
                            setIsManualNameOver(true);
                            return;
                          }
                          setIsManualNameOver(false);
                          setManualStoreName(text);
                        }}
                        placeholder="매장 이름을 입력하세요."
                        placeholderTextColor="#9B9B9B"
                        onFocus={() => {
                          setIsManualNameFocused(true);
                          focusedInputRef.current = manualNameInputRef;
                          bottomSheetRef.current?.snapToIndex(2);
                          scrollSheetToInput(manualNameInputRef);
                        }}
                        onBlur={() => {
                          setIsManualNameFocused(false);
                          if (focusedInputRef.current === manualNameInputRef) {
                            focusedInputRef.current = null;
                          }
                        }}
                        returnKeyType="next"
                        onSubmitEditing={() =>
                          manualAddressInputRef.current?.focus?.()
                        }
                      />
                      {isManualNameOver && (
                        <CustomText style={styles.manualErrorText}>
                          매장 이름은 최대 50자까지 입력 가능합니다.
                        </CustomText>
                      )}
                      <View style={styles.labelView}>
                        <CustomText style={styles.manualLabel}>
                          매장 주소
                        </CustomText>

                        <CustomText maxScale={1.1} style={styles.subLabel}>
                          · 대략적인 위치만 알려주셔도 괜찮아요
                        </CustomText>
                      </View>
                      <View style={styles.manualAddressInputWrapper}>
                        <CustomTextInput
                          ref={manualAddressInputRef}
                          style={[
                            styles.manualInput,
                            styles.manualAddressInput,
                            isManualAddressFocused && styles.manualInputFocused,
                            manualStoreAddress.length > 0 &&
                              styles.manualInputFilled,
                          ]}
                          value={manualStoreAddress}
                          onChangeText={text => {
                            const maxChars = 80;
                            if (text.length > maxChars) {
                              setIsManualAddressOver(true);
                              return;
                            }
                            setIsManualAddressOver(false);
                            setManualStoreAddress(text);
                          }}
                          placeholder="신논현역 인근 또는 강남구 봉은사로 102"
                          placeholderTextColor="#9B9B9B"
                          onFocus={() => {
                            setIsManualAddressFocused(true);
                            focusedInputRef.current = manualAddressInputRef;
                            bottomSheetRef.current?.snapToIndex(2);
                            scrollSheetToInput(manualAddressInputRef);
                          }}
                          onBlur={() => {
                            setIsManualAddressFocused(false);
                            if (
                              focusedInputRef.current === manualAddressInputRef
                            ) {
                              focusedInputRef.current = null;
                            }
                          }}
                          returnKeyType="done"
                        />
                        <TouchableOpacity
                          onPress={() =>
                            navigation.navigate('StoreAddMapScreen', {
                              location,
                              onAddressSelect: handleManualAddressSelect,
                              detailedAddress: '',
                            })
                          }
                          style={styles.manualMapButton}>
                          <Ionicons name="map-outline" size={20} color="#666" />
                        </TouchableOpacity>
                      </View>
                      <Pressable
                        style={[
                          styles.manualEntryButton,
                          {marginTop: 20},
                          isManualSubmitDisabled &&
                            styles.manualEntryButtonDisabled,
                        ]}
                        disabled={isManualSubmitDisabled}
                        onPress={
                          isManualCancelMode
                            ? handleManualCancel
                            : handleManualSubmit
                        }>
                        <CustomText
                          style={[
                            styles.manualEntryText,
                            isManualSubmitDisabled &&
                              styles.manualEntryTextDisabled,
                          ]}>
                          {isManualCancelMode ? '취소' : '입력 완료'}
                        </CustomText>
                      </Pressable>
                      {isManualAddressOver && (
                        <CustomText style={styles.manualErrorText}>
                          매장 주소는 최대 80자까지 입력 가능합니다.
                        </CustomText>
                      )}
                    </View>
                  ) : displayedItems.length === 0 ? (
                    <View style={styles.manualEntryWrap}>
                      <CustomText style={styles.manualEntryHint}>
                        찾는 매장이 없다면 직접 입력해보세요.
                      </CustomText>
                      <Pressable
                        style={styles.manualEntryButton}
                        onPress={handleManualPress}>
                        <CustomText style={styles.manualEntryText}>
                          매장 직접 입력
                        </CustomText>
                      </Pressable>
                    </View>
                  ) : (
                    <View style={styles.manualEntryWrap}>
                      <CustomText style={styles.manualEntryHint}>
                        찾는 매장이 없다면 직접 입력해보세요.
                      </CustomText>
                      <Pressable
                        style={styles.manualEntryButton}
                        onPress={handleManualPress}>
                        <CustomText style={styles.manualEntryText}>
                          매장 직접 입력
                        </CustomText>
                      </Pressable>
                    </View>
                  )}
                </>
              }
            />
          ) : (
            <BottomSheetScrollView
              ref={sheetScrollRef}
              contentContainerStyle={[
                styles.bottomSheetContent,
                {paddingBottom: Math.max(insets.bottom, 20) + keyboardPadding},
              ]}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="always"
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
                      최근 본 매장
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
                      저장한 매장
                    </CustomText>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.chip,
                      activeChip === 'manualStore' && styles.chipActive,
                    ]}
                    onPress={() => handleChipPress('manualStore')}
                    hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                    <CustomText
                      style={[
                        styles.chipText,
                        activeChip === 'manualStore' && styles.chipActiveText,
                      ]}>
                      매장 직접 입력
                    </CustomText>
                  </Pressable>

                  <Pressable
                    style={[
                      styles.chip,
                      activeChip === 'place' && styles.chipActive,
                    ]}
                    onPress={() => handleChipPress('place')}
                    hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}>
                    <CustomText
                      style={[
                        styles.chipText,
                        activeChip === 'place' && styles.chipActiveText,
                      ]}>
                      매장 외 장소
                    </CustomText>
                  </Pressable>
                </View>
              )}
              {(isSearching ||
                (activeChip !== 'place' && activeChip !== 'manualStore')) && (
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
              {activeChip === 'place' && !isSearching && (
                <View style={styles.manualForm}>
                  <CustomText style={styles.manualEntryHint}>
                    매장이 아니라면 장소를 직접 입력해보세요.
                  </CustomText>
                  <CustomText style={styles.manualLabel}>장소 이름</CustomText>
                  <CustomTextInput
                    ref={placeNameInputRef}
                    style={[
                      styles.manualInput,
                      isPlaceFocused && styles.manualInputFocused,
                      placeNameInput.length > 0 && styles.manualInputFilled,
                    ]}
                    value={placeNameInput}
                    onChangeText={text => {
                      const maxChars = 50;
                      if (text.length > maxChars) {
                        setIsPlaceNameOver(true);
                        return;
                      }
                      setIsPlaceNameOver(false);
                      setPlaceNameInput(text);
                    }}
                    placeholder="우리집, 한강"
                    placeholderTextColor="#9B9B9B"
                    onFocus={() => {
                      setIsPlaceFocused(true);
                      focusedInputRef.current = placeNameInputRef;
                      bottomSheetRef.current?.snapToIndex(2);
                      scrollSheetToInput(placeNameInputRef);
                    }}
                    onBlur={() => {
                      setIsPlaceFocused(false);
                      if (focusedInputRef.current === placeNameInputRef) {
                        focusedInputRef.current = null;
                      }
                    }}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      if (!isPlaceSubmitDisabled) {
                        handlePlaceSubmit();
                      }
                    }}
                  />
                  {isPlaceNameOver && (
                    <CustomText style={styles.manualErrorText}>
                      장소 이름은 최대 50자까지 입력 가능합니다.
                    </CustomText>
                  )}
                  <Pressable
                    style={[
                      styles.manualEntryButton,
                      {marginTop: 20},
                      isPlaceSubmitDisabled && styles.manualEntryButtonDisabled,
                    ]}
                    disabled={isPlaceSubmitDisabled}
                    onPress={handlePlaceSubmit}>
                    <CustomText
                      style={[
                        styles.manualEntryText,
                        isPlaceSubmitDisabled && styles.manualEntryTextDisabled,
                      ]}>
                      입력 완료
                    </CustomText>
                  </Pressable>
                </View>
              )}
              {isSearching && displayedItems.length !== 0 && !isManual && (
                <View style={styles.manualEntryWrap}>
                  <CustomText style={styles.manualEntryHint}>
                    찾는 매장이 없다면 직접 입력해보세요.
                  </CustomText>
                  <Pressable
                    style={styles.manualEntryButton}
                    onPress={handleManualPress}>
                    <CustomText style={styles.manualEntryText}>
                      매장 직접 입력
                    </CustomText>
                  </Pressable>
                </View>
              )}
              {isManual && !isSearching && (
                <View style={styles.manualForm}>
                  <CustomText style={styles.manualLabel}>매장 이름</CustomText>
                  <CustomTextInput
                    ref={manualNameInputRef}
                    style={[
                      styles.manualInput,
                      isManualNameFocused && styles.manualInputFocused,
                      manualStoreName.length > 0 && styles.manualInputFilled,
                    ]}
                    value={manualStoreName}
                    onChangeText={text => {
                      const maxChars = 50;
                      if (text.length > maxChars) {
                        setIsManualNameOver(true);
                        return;
                      }
                      setIsManualNameOver(false);
                      setManualStoreName(text);
                    }}
                    placeholder="매장 이름을 입력하세요."
                    placeholderTextColor="#9B9B9B"
                    onFocus={() => {
                      setIsManualNameFocused(true);
                      focusedInputRef.current = manualNameInputRef;
                      bottomSheetRef.current?.snapToIndex(2);
                      scrollSheetToInput(manualNameInputRef);
                    }}
                    onBlur={() => {
                      setIsManualNameFocused(false);
                      if (focusedInputRef.current === manualNameInputRef) {
                        focusedInputRef.current = null;
                      }
                    }}
                    returnKeyType="next"
                    onSubmitEditing={() =>
                      manualAddressInputRef.current?.focus?.()
                    }
                  />
                  {isManualNameOver && (
                    <CustomText style={styles.manualErrorText}>
                      매장 이름은 최대 50자까지 입력 가능합니다.
                    </CustomText>
                  )}
                  <View style={styles.labelView}>
                    <CustomText style={styles.manualLabel}>
                      매장 주소
                    </CustomText>

                    <CustomText maxScale={1.1} style={styles.subLabel}>
                      · 대략적인 위치만 알려주셔도 괜찮아요
                    </CustomText>
                  </View>
                  <View style={styles.manualAddressInputWrapper}>
                    <CustomTextInput
                      ref={manualAddressInputRef}
                      style={[
                        styles.manualInput,
                        styles.manualAddressInput,
                        isManualAddressFocused && styles.manualInputFocused,
                        manualStoreAddress.length > 0 &&
                          styles.manualInputFilled,
                      ]}
                      value={manualStoreAddress}
                      onChangeText={text => {
                        const maxChars = 80;
                        if (text.length > maxChars) {
                          setIsManualAddressOver(true);
                          return;
                        }
                        setIsManualAddressOver(false);
                        setManualStoreAddress(text);
                      }}
                      placeholder="신논현역 인근 또는 강남구 봉은사로 102"
                      placeholderTextColor="#9B9B9B"
                      onFocus={() => {
                        setIsManualAddressFocused(true);
                        focusedInputRef.current = manualAddressInputRef;
                        bottomSheetRef.current?.snapToIndex(2);
                        scrollSheetToInput(manualAddressInputRef);
                      }}
                      onBlur={() => {
                        setIsManualAddressFocused(false);
                        if (focusedInputRef.current === manualAddressInputRef) {
                          focusedInputRef.current = null;
                        }
                      }}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('StoreAddMapScreen', {
                          location,
                          onAddressSelect: handleManualAddressSelect,
                          detailedAddress: '',
                        })
                      }
                      style={styles.manualMapButton}>
                      <Ionicons name="map-outline" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                  <Pressable
                    style={[
                      styles.manualEntryButton,
                      {marginTop: 20},
                      isManualSubmitDisabled &&
                        styles.manualEntryButtonDisabled,
                    ]}
                    disabled={isManualSubmitDisabled}
                    onPress={
                      isManualCancelMode
                        ? handleManualCancel
                        : handleManualSubmit
                    }>
                    <CustomText
                      style={[
                        styles.manualEntryText,
                        isManualSubmitDisabled &&
                          styles.manualEntryTextDisabled,
                      ]}>
                      {isManualCancelMode ? '취소' : '입력 완료'}
                    </CustomText>
                  </Pressable>
                  {isManualAddressOver && (
                    <CustomText style={styles.manualErrorText}>
                      매장 주소는 최대 80자까지 입력 가능합니다.
                    </CustomText>
                  )}
                </View>
              )}
            </BottomSheetScrollView>
          )}
        </BottomSheet>
      ) : null}
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
  nextTextDisabled: {
    color: ColorUtil.mainDisable,
  },
  previewItem: {
    position: 'relative',
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
    borderRadius: 9,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#DDE2E6',
  },
  previewRemoveButton: {
    position: 'absolute',
    top: 10,
    right: 18,
    width: 28,
    height: 28,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    elevation: 2,
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
    marginBottom: 10,
    position: 'relative',
    height: 48,
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
    padding: 10,
  },
  selectedStoreText: {
    flex: 1,
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  selectedStoreTextSingle: {
    flex: 0,
    lineHeight: 20,
  },
  selectedStoreInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedStoreAddress: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  selectedStorePlaceholder: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#9CA3AF',
    lineHeight: 20,
  },
  selectedStorePlaceholderWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  selectedAddressPlaceholder: {
    flex: 1,
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
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
  manualEntryButtonDisabled: {
    backgroundColor: '#F1F1F1',
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
    textAlign: 'center',
    marginTop: 25,
  },
  manualEntryText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    color: '#4AA3FF',
  },
  manualEntryTextDisabled: {
    color: '#B0B0B0',
  },
  manualForm: {
    marginTop: 0,
    paddingHorizontal: 6,
    borderRadius: 12,
    paddingBottom: 30,
  },
  manualLabel: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 15,
    marginTop: 20,

    marginRight: 6,
  },

  labelView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    // marginBottom: 12,
  },

  subLabel: {
    fontFamily: 'Pretendard-Regular',
    color: '#999',
    fontSize: 14,
    marginRight: 4,
    paddingBottom: 1,
  },
  manualInput: {
    flex: 1,
    height: 52,
    borderColor: ColorUtil.placeholderBorder,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingRight: 42,
    marginTop: 12,
  },
  manualAddressInputWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  manualAddressInput: {
    paddingRight: 44,
  },
  manualMapButton: {
    position: 'absolute',
    right: 10,
    top: 24,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    // padding: 6,
    width: 28,
    height: 28,
    borderRadius: 50,
    backgroundColor: '#F8F8F8',
  },
  manualInputFocused: {
    borderColor: '#333',
  },
  manualInputFilled: {
    color: '#333',
  },
  manualErrorText: {
    color: '#FF4816',
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
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
