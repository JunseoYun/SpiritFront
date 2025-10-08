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
import MainHeader from '../../components/MainScreen/Header/MainHeader';
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
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;

const MainScreen = ({navigation}) => {
  const {pendingStoreId} = useDeepLink();
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const insets = useSafeAreaInsets();

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
        Platform.OS === 'ios' ? insets.top - 20 : insets.top + 40;
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
        StatusBar.setBackgroundColor(showTopView2 ? 'white' : '#45C9FF');
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

  const [mainSectionHeight, setMainSectionHeight] = useState(0);
  const [populartext, setPopulartext] = useState(0);
  const [filterHeight, FilterHeight] = useState(0);

  const sectionsData = useMemo(
    () => [
      {
        key: 'mainSection',
        data: [mainSectionData],
        renderItem: ({item}) => (
          <View
            onLayout={e => {
              const {height} = e.nativeEvent.layout;
              setMainSectionHeight(height); // 높이값 저장
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

  const stickyThreshold = useMemo(() => {
    return (
      mainSectionHeight +
      filterHeight * 2 +
      insets.top +
      filterHeight / 2 +
      populartext
    ); // 원하는 offset 추가 가능
  }, [
    mainSectionHeight,
    topView2Height,
    insets.top,
    filterHeight,
    populartext,
  ]);

  const stickyTranslateY = scrollY.interpolate({
    inputRange: [stickyThreshold - 80, stickyThreshold],
    outputRange: [-80, 0], // 위에서 부드럽게 내려옴
    extrapolate: 'clamp',
  });

  // 리스트 내부 필터헤더와 고정 헤더를 자연스럽게 전환하기 위한 진행도
  // 원래 필터헤더가 리스트 상단 위치에 도달하는 시점에 맞춰 발동
  const filterHeaderThreshold = useMemo(() => {
    if (!mainSectionHeight || !populartext) return 100000; // wait until measured
    // 너무 일찍 붙는 현상을 방지하기 위해 약간 늦춤
    const androidOffset = Platform.OS === 'android' ? 6 : 0;
    const offset = insets.top === 0 ? -10 : 0;
    return Math.max(
      0,
      mainSectionHeight + populartext + 36 + androidOffset + offset,
    );
  }, [mainSectionHeight, populartext, insets]);
  const filterHeaderProgress = scrollY.interpolate({
    inputRange: [filterHeaderThreshold, filterHeaderThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  const fixedFilterOpacity = filterHeaderProgress;
  const listFilterOpacity = Animated.subtract(1, filterHeaderProgress);
  // 슬라이드 없이 제자리에서 즉시 표시
  const fixedFilterTranslateY = 0;

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

  // 👉 그림자 강도를 opacity에 따라 보간
  const shadowOpacity = fixedFilterOpacity.interpolate({
    inputRange: [0, 0.1],
    outputRange: [0.1, 0], // 0일 때 그림자 있음, 1일 때 그림자 없음
    extrapolate: 'clamp',
  });

  const elevation = fixedFilterOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0], // Android: 0일 때 elevation 4, 1일 때 0
    extrapolate: 'clamp',
  });

  const [touchable, setTouchable] = useState(false);

  useEffect(() => {
    const id = fixedFilterOpacity.addListener(({value}) => {
      setTouchable(value > 0.01);
    });
    return () => fixedFilterOpacity.removeListener(id);
  }, [fixedFilterOpacity]);

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[
          styles.absoluteTop,
          {
            paddingTop:
              Platform.OS === 'android' ? insets.top + 10 : insets.top,
            backgroundColor: showTopView2 ? '#F5F5F5' : '#45C9FF', // 🎯 여기 조건부 배경색 추가
          },
        ]}>
        <MainHeader />
        <NotificationButton unreadNotification={unreadNotification} />
        <View style={styles.topView}>
          <Animated.Text
            style={[styles.todayAddress, {opacity: topViewAddressOpacity}]}
            numberOfLines={1}
            allowFontScaling={false}
            ellipsizeMode="tail">
            {formatAddress(address)}
          </Animated.Text>
          {!showLocation && (
            <Pressable
              hitSlop={{
                left: screenWidth,
                right: 15,
                top: 15,
                bottom: 15,
              }}
              style={{zIndex: 1, position: 'relative'}}
              onPress={setLocationHandle}>
              <Feather name="chevron-right" size={23} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>

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
                shadowOpacity, // Animated 값 바로 적용
                shadowRadius: 1,
              },
              android: {
                elevation, // Animated 값 바로 적용
              },
            }),
          },
        ]}
        onLayout={event => {
          const {height} = event.nativeEvent.layout;
          setTopView2Height(height);
        }}>
        <Pressable hitSlop={10} onPress={setLocationHandle}>
          <Text
            allowFontScaling={false}
            style={[styles.todayAddress2, {color: '#333', marginTop: 10}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {formatAddress(address)}
          </Text>
        </Pressable>
        <Pressable
          hitSlop={10}
          style={{marginTop: 10, marginLeft: 5}}
          onPress={setLocationHandle}>
          <Feather name="chevron-right" size={23} color="#181a1a" />
        </Pressable>
      </Animated.View>
      {/* 주소 바 바로 아래에 고정된 필터 헤더 */}
      <Animated.View
        pointerEvents={touchable ? 'auto' : 'none'}
        style={[
          styles.fixedFilterHeader,
          {
            top: topView2Height,
            opacity: fixedFilterOpacity,
            transform: [{translateY: fixedFilterTranslateY}],
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
                onLayout={event => {
                  const {height} = event.nativeEvent.layout;
                  FilterHeight(height);
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
          paddingTop:
            Platform.OS === 'android' ? insets.top + 120 : insets.top + 110,
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
    marginVertical: 15,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 18,
    borderRadius: 14,
    width: '100%',
    justifyContent: 'space-between',
  },
  todayAddress: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
  topView2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    zIndex: 40,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  todayAddress2: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
    paddingLeft: 4,
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
