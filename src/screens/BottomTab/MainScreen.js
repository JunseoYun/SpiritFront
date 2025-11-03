import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
  StyleSheet,
  Text,
  View,
  RefreshControl,
  Pressable,
  BackHandler,
  ToastAndroid,
  Animated,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {getLocation, getAddress} from '../../storage/locationStorage';
import useRecommendation from '../../hooks/useRecommendation';
import {Store_getby_main_banner, Store_getby_popular} from '../../api/storeApi';
import Loading from '../../hooks/Loading';
import NotificationButton from '../../components/MainScreen/NotificationButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import RejectModal from '../../components/Reject/RejectModal';
import useHandlePendingNotification from '../../hooks/notification/useHandlePendingNotification';
import {useNotification} from '../../context/NotificationContext';
import MainSection from '../../components/MainScreen/MainSection';
import FilterHeader from '../../components/MainScreen/FilterHeader';
import PopularStoresSection from '../../components/MainScreen/PopularStroe/PopularStoresSection';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {has_unread_notification} from '../../api/notificationApi';
import {useDeepLink} from '../../context/DeepLinkContext';
import MainSearchBar from '../../components/MainScreen/MainSearchBar';
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const FILTER_STICKY_DELAY = 36;

const MainScreen = ({navigation}) => {
  const {pendingStoreId} = useDeepLink();
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const insets = useSafeAreaInsets();
  const contentTopPadding = useMemo(
    () => (Platform.OS === 'android' ? insets.top + 20 : insets.top + 10),
    [insets.top],
  );

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [showTopView2, setShowTopView2] = useState(false);

  const [showLocation, setShowLocation] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const [recommStores, setRecommStores] = useState([]);
  const [recommCategory, setRecommCategory] = useState(null);
  const [recommReason, setRecommReason] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const {recommendCategory} = useRecommendation();
  const [topView2Height, setTopView2Height] = useState(0);
  const defaultTopBarHeight = useMemo(
    () => (Platform.OS === 'android' ? insets.top + 64 : insets.top + 54),
    [insets.top],
  );
  const effectiveTopBarHeight = useMemo(
    () => (topView2Height > 0 ? topView2Height : defaultTopBarHeight),
    [topView2Height, defaultTopBarHeight],
  );
  const [unreadNotification, setUnreadNotification] = useState(false);
  // Popular stores section is extracted to its own component

  const handleScrollToTop = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
        viewPosition: 0,
        animated: true,
      });
    }
  }, []);

  useEffect(() => {
    navigation.setParams({
      scrollToTop: handleScrollToTop,
    });
  }, [navigation, handleScrollToTop]);

  const scrollListener = useRef(null);

  const scrollToTopThreshold = useMemo(
    () => (Platform.OS === 'ios' ? screenHeight * 0.25 : screenHeight * 0.3),
    [],
  );
  const scrollToTopBottom = useMemo(() => 18, []);

  useEffect(() => {
    scrollListener.current = scrollY.addListener(({value}) => {
      const iosThreshold = insets.top + 30;
      const androidThreshold = insets.top + 90;
      const threshold = Platform.OS === 'ios' ? iosThreshold : androidThreshold;

      // 상태 변경이 실제로 필요할 때만 setState
      setShowTopView2(prev => {
        if (value >= threshold && !prev) return true;
        if (value < threshold && prev) return false;
        return prev;
      });

      const locationThreshold =
        Platform.OS === 'ios' ? insets.top + 20 : insets.top + 40;
      setShowLocation(prev => {
        if (value >= locationThreshold && !prev) return true;
        if (value < locationThreshold && prev) return false;
        return prev;
      });

      setShowScrollToTop(prev => {
        if (value >= scrollToTopThreshold && !prev) return true;
        if (value < scrollToTopThreshold && prev) return false;
        return prev;
      });
    });

    return () => {
      if (scrollListener.current)
        scrollY.removeListener(scrollListener.current);
    };
  }, [insets.top, scrollToTopThreshold]);

  useFocusEffect(
    useCallback(() => {
      let lastBackPressed = 0;

      const onBackPress = () => {
        const now = Date.now();
        if (now - lastBackPressed < 2000) {
          BackHandler.exitApp(); // 앱 종료
          return true;
        }

        lastBackPressed = now;
        ToastAndroid.show('한 번 더 누르면 종료됩니다.', ToastAndroid.SHORT);
        return true; // 기본 동작 막기
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove(); // cleanup
    }, []),
  );

  useEffect(() => {
    if (pendingStoreId) return;
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const currentLocation = await getLocation();
        if (currentLocation) {
          setLocation(currentLocation);
          const recommStoreData = await Store_getby_main_banner(
            currentLocation.latitude,
            currentLocation.longitude,
          );
          const {reason} = recommendCategory(recommStoreData.category);
          setRecommCategory(recommStoreData.category);
          setRecommReason(reason);
          setRecommStores(recommStoreData.mainBannerStoreDtoList);
          PopularStores(0, true, currentLocation);
        }
        const currentAddress = await getAddress();
        if (currentAddress) {
          setAddress(currentAddress);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [pendingStoreId]);

  const onRefresh = async () => {
    setIsRefreshing(true); // 새로 고침 시작

    try {
      const currentLocation = await getLocation();
      if (currentLocation) {
        setLocation(currentLocation);

        const recommStoreData = await Store_getby_main_banner(
          currentLocation.latitude,
          currentLocation.longitude,
        );
        const {reason} = recommendCategory(recommStoreData.category);
        setRecommCategory(recommStoreData.category);
        setRecommReason(reason);
        setRecommStores(recommStoreData.mainBannerStoreDtoList);
        const unread = await has_unread_notification();
        setUnreadNotification(unread.hasUnread);
        PopularStores(0, true, currentLocation);
      }

      const currentAddress = await getAddress();
      if (currentAddress) {
        setAddress(currentAddress);
      }
    } catch (error) {
      console.error('초기 로드 오류:', error);
    } finally {
      setIsRefreshing(false); // 5초 끝나고 로딩 종료
    }
  };

  const catagoryClick = index => {
    if (index >= 0 && index < 10) {
      navigation.navigate('CategoryListTabbar', {
        screen: screens[index],
      });
    }
  };

  const handlestoreItemClick = index => {
    navigation.navigate('StoreSearchScreen', {index, location: location});
  };

  const handleSearchPress = useCallback(() => {
    console.log('Onpress handleSearchPress');
  }, [navigation, location]);

  const setLocationHandle = useCallback(() => {
    setTimeout(() => {
      navigation.navigate('SetLocationScreen');
    }, 50);
  }, [navigation]);

  const formatAddress = address => {
    if (address === '강남역') {
      return address;
    }
    return address;
  };

  const [rejectModalData, setRejectModalData] = useState(null);
  const {pendingNotification, setPendingNotification} = useNotification();
  useHandlePendingNotification(
    loading,
    pendingNotification,
    () => setPendingNotification(null),
    data => setRejectModalData(data), // 모달 데이터 설정
  );

  // ✅ Cold Start 시 AsyncStorage에 저장된 알림 처리
  useEffect(() => {
    const checkStoredNotification = async () => {
      const stored = await AsyncStorage.getItem('PENDING_NOTIFICATION');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setPendingNotification(data);
          await AsyncStorage.removeItem('PENDING_NOTIFICATION'); // 사용 후 삭제
        } catch (e) {
          console.warn('⚠️ 저장된 알림 파싱 실패', e);
        }
      }
    };

    checkStoredNotification();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(showTopView2 ? 'white' : '#3CBBFF');
      }

      return () => {
        // 블러(다른 탭으로 이동) 시 → white로 리셋
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('white');
        }
      };
    }, [showTopView2]),
  );

  useFocusEffect(
    useCallback(() => {
      if (pendingStoreId) return;
      const fetchUnread = async () => {
        try {
          const unread = await has_unread_notification();
          setUnreadNotification(unread.hasUnread);
        } catch (err) {
          console.error('데이터 불러오기 실패', err);
        }
      };

      fetchUnread();
    }, [pendingStoreId]),
  );

  const [popularstores, setPopularstores] = useState([]);
  const [popularpage, setPopularpage] = useState(0);
  const [totalpage, setTotalpage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [drinkType, setDrinkType] = useState(null);
  const [priceOrder, setPriceOrder] = useState('');
  const [popularloading, setPopularloading] = useState(false);
  const [popularempty, setPopularempty] = useState(false);
  const filterHeaderRef = useRef(null);

  const PopularStores = async (
    currentPage,
    reset = false,
    location,
    drinkType = null,
    priceOrder = '',
  ) => {
    setPopularloading(true);
    if (location) {
      // Use popularloading to guard duplicate fetches; don't block by global loading
      if (popularloading || (!hasMore && !reset)) return;

      if (reset) {
        setPopularpage(0);
      }
      try {
        const data = await Store_getby_popular(
          currentPage,
          location.latitude,
          location.longitude,
          drinkType,
          priceOrder,
        );

        setTotalpage(data.totalPages);
        setPopularempty(data.empty);

        if (data.content && data.content.length > 0) {
          setPopularstores(prevData => {
            const newData = reset
              ? data.content
              : [...prevData, ...data.content];
            const uniqueData = newData.filter(
              (item, index, self) =>
                index === self.findIndex(existing => existing.id === item.id),
            );
            return uniqueData;
          });
        } else {
          setHasMore(false); // 더 이상 데이터가 없으면 false로 설정
        }
      } catch (error) {
      } finally {
        setPopularloading(false);
      }
    }
  };

  useEffect(() => {
    setPopularstores([]);
    setPopularempty(false);
    PopularStores(0, true, location, drinkType, priceOrder);
    if (!popularloading && popularstores.length > 0) {
      setTimeout(() => {
        scrollRef.current.scrollToLocation({
          sectionIndex: 1, // popularStoresheader
          itemIndex: 1, // 해당 section의 첫 아이템
          viewPosition: 0, // 0이면 화면 맨 위에 위치
          viewOffset: insets.top + 40 + populartext,
          animated: true,
        });
      }, 300);
    }
  }, [drinkType, priceOrder]);

  const loadMoreData = () => {
    // Trigger next page earlier and avoid blocking by unrelated loading
    if (!popularloading && hasMore && popularpage < totalpage - 1) {
      setPopularpage(prevPage => {
        const nextPage = prevPage + 1; // 다음 페이지 번호
        PopularStores(nextPage, false, location); // 그 페이지 번호로 데이터 요청
        return nextPage; // 상태를 증가된 페이지 번호로 갱신
      });
    }
  };

  const stableNavigation = useMemo(() => navigation, [navigation]);
  const stableLocation = useMemo(() => location, [location]);

  const mainSectionData = useMemo(
    () => ({
      recommCategory,
      recommReason,
      recommStores,
      location,
      isRefreshing,
      navigation,
      loading,
      handlestoreItemClick,
      catagoryClick,
    }),
    [
      recommCategory,
      recommReason,
      recommStores,
      location,
      isRefreshing,
      loading,
      navigation,
    ],
  );

  const [addressHeight, setAddressHeight] = useState(0);
  const [searchBarHeight, setSearchBarHeight] = useState(0);
  const [mainSectionHeight, setMainSectionHeight] = useState(0);
  const [filterHeight, setFilterHeight] = useState(0);
  const [filterHeaderOffset, setFilterHeaderOffset] = useState(null);
  const [populartext, setPopulartext] = useState(0);

  const sectionsData = useMemo(
    () => [
      {
        key: 'address',
        data: [{}],
        renderItem: () => (
          <View
            onLayout={e => {
              const {height} = e.nativeEvent.layout;
              setAddressHeight(prev =>
                Math.abs(prev - height) > 1 ? height : prev,
              );
            }}>
            <View style={styles.topView}>
              <Animated.View
                style={[
                  styles.addressContainer,
                  {opacity: topViewAddressOpacity},
                ]}>
                <Pressable
                  hitSlop={{
                    left: 15,
                    right: 15,
                    top: 15,
                    bottom: 15,
                  }}
                  style={styles.addressPressable}
                  onPress={setLocationHandle}>
                  <Text
                    allowFontScaling={false}
                    style={styles.todayAddress}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {formatAddress(address)}
                  </Text>
                  {!showLocation && (
                    <Feather name="chevron-right" size={22} color="#fff" />
                  )}
                </Pressable>
              </Animated.View>
              <NotificationButton
                unreadNotification={unreadNotification}
                floating={false}
                iconColor="#fff"
              />
            </View>
          </View>
        ),
      },

      {
        key: 'searchBar',
        data: [{}],
        renderItem: () => (
          <View
            onLayout={e => {
              const {height} = e.nativeEvent.layout;
              setSearchBarHeight(prev =>
                Math.abs(prev - height) > 1 ? height : prev,
              );
            }}>
            <MainSearchBar handleSearchPress={handleSearchPress} />
          </View>
        ),
      },

      {
        key: 'mainSection',
        data: [mainSectionData],
        renderItem: ({item}) => (
          <View
            onLayout={e => {
              const {height} = e.nativeEvent.layout;
              setMainSectionHeight(prev =>
                Math.abs(prev - height) > 1 ? height : prev,
              );
            }}>
            <MainSection
              {...item}
              onHeaderLayout={height => setPopulartext(height)}
            />
          </View>
        ),
      },
      {
        key: 'popularStoresCombined',
        data: [{}],
        renderItem: () => (
          <PopularStoresSection
            popularstores={popularstores}
            location={stableLocation}
            navigation={stableNavigation}
            screenWidth={screenWidth}
            loading={loading}
            popularloading={popularloading}
            popularempty={popularempty}
            onHeaderLayout={height => setPopulartext(height)}
          />
        ),
      },
    ],
    [
      popularstores,
      mainSectionData,
      stableLocation,
      stableNavigation,
      loading,
      popularloading,
      popularempty,
    ],
  );

  const topContentHeight = useMemo(
    () =>
      contentTopPadding + addressHeight + searchBarHeight + mainSectionHeight,
    [contentTopPadding, addressHeight, searchBarHeight, mainSectionHeight],
  );

  const filterHeaderThreshold = useMemo(() => {
    if (filterHeaderOffset != null) {
      const headerHeight = filterHeight || 0;
      const extraSpacing =
        headerHeight > 0 ? Math.max(40, Math.min(headerHeight * 0.8, 120)) : 40;
      const threshold =
        filterHeaderOffset +
        headerHeight -
        effectiveTopBarHeight +
        extraSpacing +
        FILTER_STICKY_DELAY;
      return threshold > 0 ? threshold : 0;
    }
    if (topContentHeight === 0) {
      return 100000;
    }
    const overlayOffset =
      effectiveTopBarHeight + (Platform.OS === 'android' ? 12 : 6);
    const earlySpacing = filterHeight ? Math.min(filterHeight * 0.4, 28) : 6;
    const threshold =
      topContentHeight - overlayOffset - earlySpacing + FILTER_STICKY_DELAY;
    return threshold > 0 ? threshold : 0;
  }, [
    filterHeaderOffset,
    topContentHeight,
    effectiveTopBarHeight,
    filterHeight,
  ]);
  const [isFilterSticky, setIsFilterSticky] = useState(false);

  useEffect(() => {
    if (filterHeaderThreshold === 100000) {
      setIsFilterSticky(false);
      return undefined;
    }

    const detachThreshold = Math.max(filterHeaderThreshold, 10);
    const attachThreshold = filterHeaderThreshold;
    const listenerId = scrollY.addListener(({value}) => {
      setIsFilterSticky(prev => {
        if (prev) {
          if (value <= detachThreshold) {
            return false;
          }
          return true;
        }
        return value >= attachThreshold;
      });
    });

    return () => scrollY.removeListener(listenerId);
  }, [scrollY, filterHeaderThreshold]);

  const fixedFilterOpacity = isFilterSticky ? 1 : 0;
  const listFilterOpacity = isFilterSticky ? 0 : 1;

  // 주소 표시 전환을 부드럽게 처리
  // 원래 주소 영역이 가려지는 순간 스티키 주소가 나타나도록 설정
  const topBarThreshold = useMemo(
    () => (Platform.OS === 'ios' ? insets.top + 36 : insets.top + 96),
    [insets.top],
  );
  const topBarProgress = scrollY.interpolate({
    inputRange: [topBarThreshold - 10, topBarThreshold + 10],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const topViewAddressOpacity = Animated.subtract(1, topBarProgress);
  const topView2Opacity = topBarProgress;
  const topView2TranslateY = scrollY.interpolate({
    inputRange: [topBarThreshold - 10, topBarThreshold + 10],
    outputRange: [-6, 0],
    extrapolate: 'clamp',
  });
  return (
    <>
      <View
        pointerEvents="box-none"
        style={[
          styles.absoluteTop,
          {
            paddingTop:
              Platform.OS === 'android' ? insets.top + 20 : insets.top + 10,
            backgroundColor: showTopView2 ? '#F5F5F5' : '#3CBBFF', // 🎯 여기 조건부 배경색 추가
          },
        ]}></View>

      <Animated.View
        pointerEvents={topView2Opacity.__getValue() === 0 ? 'none' : 'auto'}
        style={[
          styles.topView2,
          {paddingTop: insets.top},
          insets.top === 0 && {height: 50},
          {
            opacity: topView2Opacity,
            transform: [{translateY: topView2TranslateY}],
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity: isFilterSticky ? 0 : 0.1,
                shadowRadius: 1,
              },
              android: {
                elevation: isFilterSticky ? 0 : 1,
              },
            }),
          },
        ]}
        onLayout={event => {
          const {height} = event.nativeEvent.layout;
          setTopView2Height(height);
        }}>
        <Pressable
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={styles.addressPressableCompact}
          onPress={setLocationHandle}>
          <Text
            allowFontScaling={false}
            style={styles.todayAddress2}
            numberOfLines={1}
            ellipsizeMode="tail">
            {formatAddress(address)}
          </Text>
          <Feather name="chevron-right" size={20} color="#181a1a" />
        </Pressable>
        <View style={styles.topView2Actions}>
          <Pressable
            hitSlop={10}
            style={{marginRight: 10}}
            onPress={handleSearchPress}>
            <Feather name="search" size={20} color="#181a1a" />
          </Pressable>
          <NotificationButton
            unreadNotification={unreadNotification}
            floating={false}
            iconColor="#181a1a"
            badgeColor="#3CBBFF"
          />
        </View>
      </Animated.View>
      {/* 주소 바 바로 아래에 고정된 필터 헤더 */}
      <Animated.View
        pointerEvents={isFilterSticky ? 'auto' : 'none'}
        style={[
          styles.fixedFilterHeader,
          {
            top: topView2Height,
            opacity: fixedFilterOpacity,
          },
        ]}>
        <FilterHeader
          ref={filterHeaderRef}
          navigation={navigation}
          drinkType={drinkType}
          setDrinkType={setDrinkType}
          screenWidth={screenWidth}
          priceOrder={priceOrder}
          setPriceOrder={setPriceOrder}
        />
      </Animated.View>

      <Animated.SectionList
        ref={scrollRef}
        sections={sectionsData}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        renderItem={({item, section}) => section.renderItem({item})}
        onScrollBeginDrag={() => filterHeaderRef.current?.closeDropdown(false)}
        onMomentumScrollBegin={() =>
          filterHeaderRef.current?.closeDropdown(false)
        }
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {
            // iOS에서 네이티브 드라이버 사용 시 당겨서 새로고침과 인셋 계산이 어긋나며 상단 공백이 남을 수 있어 비활성화
            useNativeDriver: Platform.OS === 'android',
          },
        )}
        renderSectionHeader={({section}) => {
          if (section.key === 'popularStoresCombined') {
            return (
              <Animated.View
                pointerEvents={isFilterSticky ? 'none' : 'auto'}
                onLayout={event => {
                  const {height, y} = event.nativeEvent.layout;
                  setFilterHeight(prev =>
                    Math.abs(prev - height) > 1 ? height : prev,
                  );
                  setFilterHeaderOffset(prev => {
                    if (y <= 0) return prev;
                    if (prev === null || Math.abs(prev - y) > 1) {
                      return y;
                    }
                    return prev;
                  });
                }}
                style={{
                  opacity: listFilterOpacity,
                  paddingTop: 10,
                  backgroundColor: '#fff',
                }}>
                <FilterHeader
                  ref={filterHeaderRef}
                  navigation={navigation}
                  drinkType={drinkType}
                  setDrinkType={setDrinkType}
                  screenWidth={screenWidth}
                  priceOrder={priceOrder}
                  setPriceOrder={setPriceOrder}
                />
              </Animated.View>
            );
          }
          return null;
        }}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          // iOS에서는 progressViewOffset 사용 시 스피너가 멈추지 않는 이슈가 있어 적용하지 않음
          // (Android만 필요 시 오프셋 지정)
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            {...(Platform.OS === 'android'
              ? {progressViewOffset: insets.top + 110}
              : {})}
          />
        }
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.7}
        contentContainerStyle={{
          paddingTop: contentTopPadding,
        }}
        // iOS가 자동으로 SafeArea 인셋을 더하지 않도록 비활성화 (상단 여백 잔상 방지)
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        // 스크롤 인디케이터도 별도 보정이 필요 없도록 초기화
        scrollIndicatorInsets={{top: 0, left: 0, bottom: 0, right: 0}}
        ListFooterComponent={null}
        initialNumToRender={4}
        maxToRenderPerBatch={7}
        windowSize={4}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      <ScrollToTopButton
        visible={showScrollToTop}
        bottom={scrollToTopBottom}
        onPress={handleScrollToTop}
      />

      {rejectModalData && !loading && (
        <RejectModal
          data={rejectModalData}
          onClose={() => setRejectModalData(null)}
        />
      )}
      <Loading loading={isRefreshing || loading || popularloading} />
    </>
  );
};

const screens = [
  'IZAKAYA',
  'KOREAN',
  'WESTERN',
  'CHINESE',
  'GAMSEONG',
  'GRILLED_STEW',
  'CHICKEN_HOF',
  'RAW_SEAFOOD',
  'PUB_BAR',
  'POCHA',
];

const styles = StyleSheet.create({
  absoluteTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: screenHeight,
    paddingHorizontal: 14,
  },
  topView: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
    marginHorizontal: 18,
    paddingHorizontal: 4,
  },
  todayAddress: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
    flexShrink: 1,
  },
  addressContainer: {
    flex: 1,
  },
  addressPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  addressPressableCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  topView2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 40,
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayAddress2: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#181a1a',
    flexShrink: 1,
    marginRight: 3,
  },
  topView2Actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },

  inlineNotificationButton: {
    marginLeft: 8,
  },
  fixedFilterHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  emptyText: {
    width: '100%',
    backgroundColor: '#fff',
    textAlign: 'center',
    paddingVertical: 60,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default MainScreen;
