import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  SafeAreaView,
  Pressable,
  BackHandler,
  ToastAndroid,
  Animated,
  Platform,
  StatusBar,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
// import Feather from 'react-native-vector-icons/Feather';

import TodayRecomm from '../../components/MainScreen/TodayRecomm/TodayRecomm';
import CategoryGrid from '../../components/MainScreen/Category/CategoryGrid';
import StoreRegister from '../../components/MainScreen/StoreRegister';
import OpenStoreList from '../../components/MainScreen/CurrentOpenStore/OpenStoreList';
import NearStoreList from '../../components/MainScreen/NearStore/NearStoreList';
import OptionsSection from '../../components/MainScreen/OptionSection';
import AppInfo from '../../components/MainScreen/AppInfo';
import {getLocation, getAddress} from '../../storage/locationStorage';
import useRecommendation from '../../hooks/useRecommendation';
import {Store_getby_main_banner} from '../../api/storeApi';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';
import Loading from '../../hooks/Loading';
import MainHeader from '../../components/MainScreen/Header/MainHeader';
import LottieView from 'lottie-react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Dimensions} from 'react-native';
import RejectModal from '../../components/Reject/RejectModal';
import useHandlePendingNotification from '../../hooks/notification/useHandlePendingNotification';
import {useNotification} from '../../context/NotificationContext';
const screenHeight = Dimensions.get('window').height;

const MainScreen = ({navigation}) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
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
  useEffect(() => {
    const listener = scrollY.addListener(({value}) => {
      const iosThreshold = insets.top + 30;
      const androidThreshold = insets.top + 90; // 좀 더 스크롤해야 보이게

      const threshold = Platform.OS === 'ios' ? iosThreshold : androidThreshold;

      if (value >= threshold && !showTopView2) {
        setShowTopView2(true);
      } else if (value < threshold && showTopView2) {
        setShowTopView2(false);
      }
      const locationHhreshold =
        Platform.OS === 'ios' ? insets.top - 20 : insets.top + 40;
      if (value >= locationHhreshold && !showLocation) {
        setShowLocation(true);
      } else if (value < locationHhreshold && showLocation) {
        setShowLocation(false);
      }
    });

    return () => scrollY.removeListener(listener);
  }, [insets.top, showTopView2, showLocation]);

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
      navigation.navigate('StoreSearchScreen', {index: 1});
    } else if (index === 2) {
      navigation.navigate('MapScreen');
    } else if (index === 3) {
      navigation.navigate('RandomChoiceScreen');
    }
  };

  const setLocationHandle = () => {
    navigation.navigate('SetLocationScreen');
  };

  const formatAddress = address => {
    if (address === '강남역') {
      return address;
    }
    return address;
  };

  const handleAgreeScreen = screen => {
    if (screen === 'terms') {
      navigation.navigate('OAuthStack', {
        screen: 'TermsAgreeScreen',
      });
    } else if (screen === 'privacy') {
      navigation.navigate('OAuthStack', {
        screen: 'PrivacyAgreeScreen',
      });
    } else if (screen === 'location') {
      navigation.navigate('OAuthStack', {
        screen: 'LocationAgreeScreen',
      });
    }
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
              hitSlop={15}
              style={{zIndex: 1, position: 'relative'}}
              onPress={setLocationHandle}>
              <Feather name="chevron-right" size={23} color="#fff" />
            </Pressable>
          )}
        </View>
      </View>

      {showTopView2 && (
        <View style={[styles.topView2, {paddingTop: insets.top}]}>
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
      <Animated.ScrollView
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}
        contentContainerStyle={{
          marginTop:
            Platform.OS === 'android' ? insets.top + 120 : insets.top + 110,
          paddingBottom: Platform.OS === 'ios' ? 30 : 120,
        }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
        <View style={styles.innerContainer}>
          <TodayRecomm
            recommCategory={recommCategory}
            recommReason={recommReason}
            recommStores={recommStores}
            location={location}
            refresh={isRefreshing}
            navigation={navigation}
          />

          <CategoryGrid onPress={catagoryClick} />

          <StoreRegister
            storeactiveIndex={storeactiveIndex}
            handlestoreItemClick={handlestoreItemClick}
          />

          <View style={styles.division} />

          <OpenStoreList
            location={location}
            navigation={navigation}
            refresh={isRefreshing}
            setRefresh={setIsRefreshing}
          />

          <View style={styles.division} />

          <View
            onLayout={event => (recentRef.current = event.nativeEvent.layout)}>
            <NearStoreList
              navigation={navigation}
              location={location}
              refresh={isRefreshing}
              setRefresh={onRefresh}
            />
          </View>
          <View style={styles.division} />
          <OptionsSection
            storeactiveIndex={storeactiveIndex}
            handlestoreItemClick={handlestoreItemClick}
          />
          <AppInfo handleAgreeScreen={handleAgreeScreen} />
        </View>
      </Animated.ScrollView>
      {rejectModalData && !loading && (
        <RejectModal
          data={rejectModalData}
          onClose={() => setRejectModalData(null)}
        />
      )}
      <Loading loading={isRefreshing || loading} />
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
  innerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 27,
    borderTopRightRadius: 27,
    paddingTop: 24,
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
    zIndex: 20,
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
  },
  todayAddress2: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
    paddingLeft: 4,
  },
  topbar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 25,
    alignItems: 'center',
    marginVertical: 5,
  },
  topimage: {
    width: 120,
    resizeMode: 'contain',
    height: 70,
  },
  division: {
    width: '100%',
    height: 10,
    backgroundColor: '#F5F5F5',
    marginTop: 30,
  },
});

export default MainScreen;
