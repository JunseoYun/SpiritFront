import React, {useState, useEffect, useRef} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import TodayRecomm from '../../components/MainScreen/TodayRecomm/TodayRecomm';
import CategoryGrid from '../../components/MainScreen/Category/CategoryGrid';
import InnerCategoryModal from '../../components/MainScreen/Category/InnerCategoryModal';
import StoreRegister from '../../components/MainScreen/StoreRegister';
import OpenStoreList from '../../components/MainScreen/CurrentOpenStore/OpenStoreList';
import RecentStoreList from '../../components/MainScreen/RecentStore/RecentStoreList';
import OptionsSection from '../../components/MainScreen/OptionSection';
import AppInfo from '../../components/MainScreen/AppInfo';
import {getLocation, getAddress} from '../../storage/locationStorage';
import {getWeatherData} from '../../api/weather';
import useRecommendation from '../../hooks/useRecommendation';

const MainScreen = ({navigation}) => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [stores, setStores] = useState([]);
  const [recommStores, setRecommStores] = useState([]);
  const [recommCategory, setRecommCategory] = useState(null);
  const [recommReason, setRecommReason] = useState(null);
  const [recentStores, setRecentStores] = useState([]);
  const [liveHotStores, setLiveHotStores] = useState([]);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [weather, setWeather] = useState({
    temp: 0,
    condition: '',
    rain_probability: 0,
  });
  const [storeactiveIndex, setStoreActiveIndex] = useState(null);
  const liveHotRef = useRef(null);
  const recentRef = useRef(null);
  const [liveHotLoaded, setLiveHotLoaded] = useState(false);
  const [recentLoaded, setRecentLoaded] = useState(false);
  const {recommendCategory} = useRecommendation();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const currentLocation = await getLocation();
        if (currentLocation) {
          setLocation(currentLocation);
          const weatherData = await getWeatherData(currentLocation);
          setWeather(weatherData);
          const {category, reason} = recommendCategory(
            weatherData.condition,
            weatherData.temp,
            weatherData.rain_probability,
          );
          setRecommCategory(category);
          setRecommReason(reason);
        }
        const currentAddress = await getAddress();
        if (currentAddress) {
          setAddress(currentAddress);
        }
      } catch (error) {}
    };

    fetchLocation();
  }, []);

  const onScroll = async ({nativeEvent}) => {
    // const {contentOffset, layoutMeasurement} = nativeEvent;
    // // LiveHotStoreList 스크롤 감지
    // if (
    //   liveHotRef.current &&
    //   liveHotRef.current.y - layoutMeasurement.height <= contentOffset.y
    // ) {
    //   if (!liveHotLoaded) {
    //     try {
    //       const liveHotData = await getByDistanceStore(location);
    //       setLiveHotStores(liveHotData);
    //       setLiveHotLoaded(true);
    //     } catch (error) {
    //       console.error('LiveHot 데이터 로드 오류:', error);
    //     }
    //   }
    // }
    // // RecentStoreList 스크롤 감지
    // if (
    //   recentRef.current &&
    //   recentRef.current.y - layoutMeasurement.height <= contentOffset.y
    // ) {
    //   if (!recentLoaded) {
    //     try {
    //       const recentData = await getByRecentStore();
    //       setRecentStores(recentData);
    //       setRecentLoaded(true);
    //     } catch (error) {
    //       console.error('Recent 데이터 로드 오류:', error);
    //     }
    //   }
    // }
  };

  const onRefresh = async () => {
    setIsRefreshing(true); // 새로 고침 시작
    try {
      const currentLocation = await getLocation();
      if (currentLocation) {
        setLocation(currentLocation);
        const weatherData = await getWeatherData(currentLocation);
        setWeather(weatherData);
      }
      const currentAddress = await getAddress();
      if (currentAddress) {
        setAddress(currentAddress);
      }
    } catch (error) {
      console.error('초기 로드 오류:', error);
    } finally {
      setIsRefreshing(false); // 새로 고침 종료
    }
  };

  const onPressModalOpen = () => {
    setIsModalVisible(true);
  };

  const onPressModalClose = () => {
    setIsModalVisible(false);
  };

  const catagoryClick = index => {
    if (index >= 0 && index < 9) {
      navigation.navigate('CategoryListTabbar', {
        screen: screens[index],
      });
    } else if (index === 9) {
      onPressModalOpen();
    }
  };

  const innercatagory = indexinner => {
    if (indexinner >= 0 && indexinner < screens.length) {
      console.log(location);
      navigation.navigate('CategoryListTabbar', {
        screen: screens[indexinner],
      });
    }
    setIsModalVisible(false);
  };

  const handlestoreItemClick = index => {
    setStoreActiveIndex(index);
    if (index === 0) {
      navigation.navigate('StoreAddScreen');
    } else if (index === 1) {
      // navigation.navigate('StoreAuthorityScreen');
      Alert.alert('서비스 준비중 입니다.');
    } else if (index === 2) {
      navigation.navigate('MapScreen');
    } else if (index === 3) {
      navigation.navigate('RandomChoiceScreen');
    }
  };

  const handlestoreItemOut = () => {
    // setStoreActiveIndex(null);
  };

  const setLocationHandle = () => {
    navigation.navigate('SetLocationScreen');
  };

  const formatAddress = address => {
    if (address === '강남대학교') {
      return address;
    }
    // 공백 기준으로 문자열 분리
    const parts = address.split(' ');
    return parts.slice(1, 4).join(' ');
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
      {/* 실시간 위치 */}
      <View style={styles.topView}>
        <Text style={styles.todayAddress}>
          오늘은 {formatAddress(address)}{' '}
        </Text>
        <Feather
          onPress={setLocationHandle}
          name="crosshair"
          size={25}
          color="black"
        />
      </View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>
        {/*술집 추천 추천 주점 변경 해야함 카테고리 스토어로*/}
        <TodayRecomm
          weather={weather}
          recommStores={stores}
          recommCategory={recommCategory}
          recommReason={recommReason}
          location={location}
          navigation={navigation}
        />

        {/*카테고리*/}
        <CategoryGrid onPress={catagoryClick} />
        <InnerCategoryModal
          isVisible={isModalVisible}
          onPressInnerCategory={innercatagory}
          onClose={onPressModalClose}
        />
        <StoreRegister
          storeactiveIndex={storeactiveIndex}
          handlestoreItemClick={handlestoreItemClick}
          handlestoreItemOut={handlestoreItemOut}
        />

        {/* 현재 영업 중 주점 데이터 필요 */}
        <OpenStoreList // 상위에서 내려온 데이터
          location={location}
          navigation={navigation}
          refresh={isRefreshing} // MainScreen의 새로고침 상태 전달
          setRefresh={onRefresh}
        />
        {/* 실시간 인기 주점 데이터 필요 */}
        {/* <View onLayout={event => (liveHotRef.current = event.nativeEvent.layout)}>
        <LivehotStoreList stores={liveHotStores || []} />
      </View> */}

        <View
          onLayout={event => (recentRef.current = event.nativeEvent.layout)}>
          <RecentStoreList
            refresh={isRefreshing} // MainScreen의 새로고침 상태 전달
            setRefresh={onRefresh} // MainScreen의 새로고침 함수 전달
          />
        </View>
        <OptionsSection
          storeactiveIndex={storeactiveIndex}
          handlestoreItemClick={handlestoreItemClick}
        />
        <AppInfo handleAgreeScreen={handleAgreeScreen} />
      </ScrollView>
    </SafeAreaView>
  );
};

const screens = [
  'Izakaya',
  'Koreafood',
  'Westernfood',
  'Chinesefood',
  'Emotional',
  'Jokbal',
  'Steamedfood',
  'Grilled',
  'Chicken',
  'Pancake',
  'Dried',
  'Seafood',
  'Room',
  'Group',
  'Yajang',
  'Pocha',
  'Hope',
  'Winebar',
  'Cocktail',
  'Pupbar',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
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
});

export default MainScreen;
