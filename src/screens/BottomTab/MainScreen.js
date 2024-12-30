import React, { useState, useEffect, useRef } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
  Image,
  FlatList,
  Dimensions,
  RefreshControl,
  SafeAreaView
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import MainStack from '../../navigation/MainStack';
import TodayRecomm from '../../components/MainScreen/TodayRecomm/TodayRecomm';
import CategoryGrid from '../../components/MainScreen/Category/CategoryGrid';
import InnerCategoryModal from '../../components/MainScreen/Category/InnerCategoryModal';
import StoreRegister from '../../components/MainScreen/StoreRegister';
import OpenStoreList from '../../components/MainScreen/CurrentOpenStore/OpenStoreList';
import RecentStoreList from '../../components/MainScreen/RecentStore/RecentStoreList';
import OptionsSection from '../../components/MainScreen/OptionSection';

import { getLocation, getAddress } from '../../storage/locationStorage';



const MainScreen = ({ navigation }) => {



  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState("경기도 용인시");
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
  // const {recommendCategory} = useRecommendation();



  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const currentLocation = await getLocation();
        if(currentLocation) {
          setLocation(currentLocation);
        } 
        const currentAddress = await getAddress();
        if(currentAddress) {
          setAddress(currentAddress);
        } 

        // if (currentLocation) {
        //   const weatherData = await getWeatherData(currentLocation);
        //   setWeather(weatherData); // 날씨 정보 업데이트
        //   const {category, reason} = recommendCategory(
        //     weatherData.condition,
        //     weatherData.temp,
        //     weatherData.rain_probability,
        //   );
        //   setRecommCategory(category);
        //   setRecommReason(reason);
        //   const recommStoreData = await getByCategoryStore(
        //     category,
        //     currentLocation,
        //   );
        //   setRecommStores(recommStoreData);
        //   const storeData = await getByDistanceStore(currentLocation);
        //   setStores(storeData);
        // }

        // setLocation(currentLocation);
        // setAddress(currentAddress);
      } catch (error) {
        console.error('초기 로드 오류:', error);
      }
    };

    fetchLocation();
  }, []);

  const onScroll = async ({ nativeEvent }) => {
    try {
      const currentLocation = await getLocation();
      if(currentLocation) {
        setLocation(currentLocation);
      } 
      const currentAddress = await getAddress();
      if(currentAddress) {
        setAddress(currentAddress);
      } 
    } catch (error) {
      console.error('초기 로드 오류:', error);
    }

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
    // setIsRefreshing(true); // 새로 고침 시작

    // try {
    //   const {location: currentLocation, address: currentAddress} =
    //     await useLocation(); // 위치와 주소 가져오기
    //   if (
    //     location &&
    //     location.latitude === currentLocation.latitude &&
    //     location.longitude === currentLocation.longitude
    //   ) {
    //     return;
    //   }
    //   console.log('새로 가져온 위치:', currentLocation);
    //   console.log('새로 가져온 주소:', currentAddress);
    //   // 로드 상태 초기화
    //   setLiveHotLoaded(false);
    //   setRecentLoaded(false);
    //   setLocation(currentLocation);
    //   setAddress(currentAddress);

    //   // 날씨 정보 가져오기
    //   if (currentLocation) {
    //     const weatherData = await getWeatherData(currentLocation);
    //     console.log('새로 가져온 날씨 정보:', weatherData);
    //     setWeather(weatherData); // 날씨 정보 업데이트
    //     const {category, reason} = recommendCategory(
    //       weatherData.condition,
    //       weatherData.temp,
    //       weatherData.rain_probability,
    //     );
    //     setRecommCategory(category);
    //     setRecommReason(reason);
    //     const recommStoreData = await getByCategoryStore(
    //       category,
    //       currentLocation,
    //     );
    //     setRecommStores(recommStoreData);
    //     const storeData = await getByDistanceStore(currentLocation);
    //     setStores(storeData);
    //     setRecentStores(null);
    //     setLiveHotStores(null);
    //   }
    // } catch (error) {
    //   console.error('새로 고침 중 오류:', error);
    // } finally {
    //   setIsRefreshing(false); // 새로 고침 종료
    // }
  };

  const onPressModalOpen = () => {
    setIsModalVisible(true);
  };

  const onPressModalClose = () => {
    setIsModalVisible(false);
  };

  const catagoryClick = index => {
    if (index >= 0 && index < 9) {
      // navigation.navigate('StoreListTabbar', {
      //   screen: screens[index],
      // });
    } else if (index === 9) {
      onPressModalOpen();
    }
  };

  const innercatagory = indexinner => {
    // if (indexinner >= 0 && indexinner < screens.length) {
    //   console.log(location);
    //   navigation.navigate('StoreListTabbar', {
    //     screen: screens[indexinner],
    //   });
    // }
    // setIsModalVisible(false);
  };

  const handlestoreItemClick = index => {
    setStoreActiveIndex(index);
    if (index === 0) {
      // navigation.navigate(StoreaddPage);
    }
    if (index === 2) {
      // navigation.navigate('MapPage');
    }
  };

  const handlestoreItemOut = () => {
    // setStoreActiveIndex(null);
  };

  const setLocationHandle = () => {
    navigation.navigate('SetLocationScreen');
  };


  return (
    <SafeAreaView style={styles.container}>

      {/* 실시간 위치 */}
      <View style={styles.topView}>
        <Text style={styles.todayAddress}>오늘은 {address} </Text>
        <Feather
          onPress={setLocationHandle} name="crosshair" size={25} color="black" />
      </View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }>


        {/*술집 추천 추천 주점 변경 해야함 카테고리 스토어로*/}
        <TodayRecomm
          weather={weather}
          recommStores={stores}
          recommCategory={recommCategory}
          recommReason={recommReason}
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
        <OpenStoreList stores={stores} />

        {/* 실시간 인기 주점 데이터 필요 */}
        {/* <View onLayout={event => (liveHotRef.current = event.nativeEvent.layout)}>
        <LivehotStoreList stores={liveHotStores || []} />
      </View> */}

        <View onLayout={event => (recentRef.current = event.nativeEvent.layout)}>
          <RecentStoreList stores={recentStores || []} />
        </View>

        <OptionsSection
          storeactiveIndex={storeactiveIndex}
          handlestoreItemClick={handlestoreItemClick}
        />
      </ScrollView>
    </SafeAreaView>


  );
};


const styles = StyleSheet.create({
  container: {

    backgroundColor: 'white',
  },
  topView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignSelf: 'center',
    width: '90%',
    marginTop: 10,
  },
  todayAddress: {
    fontSize: 17,
    fontWeight: 'bold',
    color: 'black',
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