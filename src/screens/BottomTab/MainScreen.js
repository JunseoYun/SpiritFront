import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
  BackHandler,
  ToastAndroid,
  Animated,
  Platform,
  Dimensions,
  StatusBar,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {getLocation, getAddress} from '../../storage/locationStorage';
import useRecommendation from '../../hooks/useRecommendation';
import {Store_getby_main_banner, Store_getby_popular} from '../../api/storeApi';
import Loading from '../../hooks/Loading';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import RejectModal from '../../components/Reject/RejectModal';
import useHandlePendingNotification from '../../hooks/notification/useHandlePendingNotification';
import {useNotification} from '../../context/NotificationContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {has_unread_notification} from '../../api/notificationApi';
import {useDeepLink} from '../../context/DeepLinkContext';
import MainScreenLayout from '../../components/MainScreen/MainScreenLayout';
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

  const [populartext, setPopulartext] = useState(0);

  return (
    <>
      <MainScreenLayout
        insets={insets}
        showTopView2={showTopView2}
        scrollY={scrollY}
        scrollRef={scrollRef}
        showLocation={showLocation}
        address={address}
        formatAddress={formatAddress}
        setLocationHandle={setLocationHandle}
        handleSearchPress={handleSearchPress}
        unreadNotification={unreadNotification}
        mainSectionData={mainSectionData}
        popularstores={popularstores}
        loading={loading}
        popularloading={popularloading}
        popularempty={popularempty}
        setPopulartext={setPopulartext}
        showScrollToTop={showScrollToTop}
        scrollToTopBottom={scrollToTopBottom}
        handleScrollToTop={handleScrollToTop}
        onRefresh={onRefresh}
        isRefreshing={isRefreshing}
        drinkType={drinkType}
        setDrinkType={setDrinkType}
        priceOrder={priceOrder}
        setPriceOrder={setPriceOrder}
        loadMoreData={loadMoreData}
        screenWidth={screenWidth}
        stableLocation={stableLocation}
        stableNavigation={stableNavigation}
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

export default MainScreen;
