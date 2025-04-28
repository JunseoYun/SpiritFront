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
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
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
const MainScreen = ({navigation}) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');

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
      // navigation.navigate('StoreSearchScreen', {index: 1});
      showAlert({
        title: '서비스 준비 중입니다.',
      });
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

  return (
    <SafeAreaView style={styles.container}>
      <Loading loading={isRefreshing || loading} />
      <View style={styles.topView}>
        <Text
          style={styles.todayAddress}
          numberOfLines={1}
          ellipsizeMode="tail">
          {formatAddress(address)}
        </Text>
        <Pressable onPress={setLocationHandle}>
          <Feather name="chevron-right" size={23} color="#181a1a" />
        </Pressable>
      </View>
      <ScrollView
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
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

        <OpenStoreList
          location={location}
          navigation={navigation}
          refresh={isRefreshing}
          setRefresh={setIsRefreshing}
        />
        <View
          onLayout={event => (recentRef.current = event.nativeEvent.layout)}>
          <NearStoreList
            navigation={navigation}
            location={location}
            refresh={isRefreshing}
            setRefresh={onRefresh}
          />
        </View>
        <OptionsSection
          storeactiveIndex={storeactiveIndex}
          handlestoreItemClick={handlestoreItemClick}
        />
        <AppInfo handleAgreeScreen={handleAgreeScreen} />
      </ScrollView>
      <AlertComponent />
    </SafeAreaView>
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
  container: {
    backgroundColor: 'white',
    marginBottom: 30,
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: '90%',
    paddingVertical: 10,
  },
  todayAddress: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    paddingLeft: 4,
    width: '90%',
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
    height: 8,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },
});

export default MainScreen;
