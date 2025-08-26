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
import useCustomAlert from '../../hooks/useCustomAlert';
import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';
import Loading from '../../hooks/Loading';
import MainHeader from '../../components/MainScreen/Header/MainHeader';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import RejectModal from '../../components/Reject/RejectModal';
import useHandlePendingNotification from '../../hooks/notification/useHandlePendingNotification';
import {useNotification} from '../../context/NotificationContext';
import MainSection from '../../components/MainScreen/MainSection';
import FilterHeader from '../../components/MainScreen/FilterHeader';
import StoreItem from '../../components/CategoryTapScreen/StoreItem';
import StoreItemSkeleton from '../../components/CategoryTapScreen/StoreItemSkeleton';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const MainScreen = ({navigation}) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const insets = useSafeAreaInsets();

  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const [showTopView2, setShowTopView2] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const [recommStores, setRecommStores] = useState([]);
  const [recommCategory, setRecommCategory] = useState(null);
  const [recommReason, setRecommReason] = useState(null);
  // const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();
  const [storeactiveIndex, setStoreActiveIndex] = useState(null);
  const recentRef = useRef(null);
  const {recommendCategory} = useRecommendation();
  const {token} = useAuth();
  const {showToast} = useToast();
  const [topView2Height, setTopView2Height] = useState(0);
  const MemoPopularstoreItem = React.memo(StoreItem);
  useEffect(() => {
    // SectionList가 렌더된 후에 ref가 존재하면 바로 등록
    if (scrollRef.current) {
      navigation.setParams({
        scrollToTop: () => {
          scrollRef.current?.scrollToLocation({
            sectionIndex: 0,
            itemIndex: 0,
            animated: true,
          });
        },
      });
    }
  }, [navigation]);

  const scrollListener = useRef(null);

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
    });

    return () => {
      if (scrollListener.current)
        scrollY.removeListener(scrollListener.current);
    };
  }, [insets.top]);

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
  }, []);

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
    setStoreActiveIndex(index);
    if (index === 0) {
      if (!token) {
        showToast('로그인 후 이용할 수 있어요!', 'center');
        return;
      }
      navigation.navigate('StoreSearchScreen', {index: 0, location: location});
    } else if (index === 1) {
      navigation.navigate('StoreSearchScreen', {index: 1, location: location});
    }
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
  const [popularstores, setPopularstores] = useState([]);
  const [popularpage, setPopularpage] = useState(0);
  const [totalpage, setTotalpage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [drinkType, setDrinkType] = useState(null);
  const [priceOrder, setPriceOrder] = useState('');
  const [popularloading, setPopularloading] = useState(false);

  const PopularStores = async (currentPage, reset = false, location) => {
    setPopularloading(true);
    if (location) {
      if (loading || (!hasMore && !reset)) return;

      if (reset) {
        setPopularpage(0);
      }
      try {
        const data = await Store_getby_popular(
          currentPage,
          location.latitude,
          location.longitude,
        );
        setTotalpage(data.totalPages);

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
    PopularStores(0, true, location);
    if (!popularloading && popularstores.length > 0) {
      setTimeout(() => {
        scrollRef.current.scrollToLocation({
          sectionIndex: 1,
          itemIndex: 1,
        });
      }, 100);
    }
  }, [drinkType, priceOrder]);

  const loadMoreData = () => {
    if (!loading && hasMore && popularpage < totalpage - 1) {
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
      storeactiveIndex,
      handlestoreItemClick,
      setIsRefreshing,
      catagoryClick,
    }),
    [
      recommCategory,
      recommReason,
      recommStores,
      location,
      isRefreshing,
      storeactiveIndex,
      loading,
      navigation,
    ],
  );

  const sectionsData = useMemo(
    () => [
      {
        key: 'mainSection',
        data: [mainSectionData],
        renderItem: ({item}) => <MainSection {...item} />,
      },
      {
        key: 'popularStores',
        data: popularstores,
        renderItem: ({item}) => (
          <MemoPopularstoreItem
            store={item}
            location={stableLocation}
            navigation={stableNavigation}
          />
        ),
      },
    ],
    [popularstores, mainSectionData, stableLocation, stableNavigation],
  );
  return (
    <>
      <View
        style={[
          styles.absoluteTop,
          {
            paddingTop:
              Platform.OS === 'android' ? insets.top + 10 : insets.top,
            backgroundColor: showTopView2 ? '#F5F5F5' : '#45C9FF', // 🎯 여기 조건부 배경색 추가
          },
        ]}>
        <MainHeader />

        <View style={styles.topView}>
          <Text
            style={styles.todayAddress}
            numberOfLines={1}
            ellipsizeMode="tail">
            {formatAddress(address)}
          </Text>
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

      {showTopView2 && (
        <View
          style={[
            styles.topView2,
            {paddingTop: insets.top},
            insets.top === 0 && {height: 50}, // 조건부 스타일
          ]}
          onLayout={event => {
            const {height} = event.nativeEvent.layout;
            setTopView2Height(height);
          }}>
          <Pressable hitSlop={10} onPress={setLocationHandle}>
            <Text
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
        </View>
      )}
      <Animated.SectionList
        ref={scrollRef}
        scrollEnabled={!(isRefreshing || loading)}
        sections={sectionsData}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        renderItem={({item, section}) => section.renderItem({item})}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: true},
        )}
        renderSectionHeader={({section}) => {
          if (section.key === 'popularStores') {
            return (
              <FilterHeader
                topView2Height={topView2Height}
                navigation={navigation}
                drinkType={drinkType}
                setDrinkType={setDrinkType}
                priceOrder={priceOrder}
                setPriceOrder={setPriceOrder}
                screenWidth={screenWidth}
              />
            );
          }
          return null;
        }}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.4}
        contentContainerStyle={{
          paddingTop:
            Platform.OS === 'android' ? insets.top + 120 : insets.top + 110,
        }}
        ListFooterComponent={
          loading || popularloading ? (
            <View style={{backgroundColor: '#fff'}}>
              {[1, 2, 3, 4].map(i => (
                <StoreItemSkeleton key={i} />
              ))}
            </View>
          ) : null
        }
        initialNumToRender={4}
        maxToRenderPerBatch={7}
        windowSize={4}
        removeClippedSubviews={true}
      />

      {rejectModalData && !loading && (
        <RejectModal
          data={rejectModalData}
          onClose={() => setRejectModalData(null)}
        />
      )}
      <Loading loading={isRefreshing || loading || popularloading} />
      <AlertComponent />
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
});

export default MainScreen;
