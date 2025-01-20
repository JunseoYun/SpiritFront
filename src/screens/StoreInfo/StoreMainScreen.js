import React, {useEffect, useState} from 'react';
import {View, Dimensions, Animated, Text} from 'react-native';
import ImageSlider from '../../components/StoreScreen/ImageSlider';
import {ScrollView} from 'react-native-gesture-handler';
import StoreMainInfo from '../../components/StoreScreen/StoreMainInfo';
import StoreTabs from '../../components/StoreScreen/StoreTabs';
import {useRoute} from '@react-navigation/native';
import {StoreMainget} from '../../api/storeApi';
import StoreMenuScreen from './StoreMenuScreen';
import StoreAlcoholScreen from './StoreAlcoholScreen';
import StoreReviewScreen from './StoreReviewScreen';
import StoreMapScreen from './StoreMapScreen';
import StoreHeader from '../../components/StoreScreen/StoreHeader';
import {StoreMenuget} from '../../api/menuApi';

const {width} = Dimensions.get('window');

const StoreMainScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, innerlatitude, innerlongitude} = route.params;
  const [menus, setMenus] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [storedata, setStoredata] = useState('');
  const [scrollY] = useState(new Animated.Value(0)); // 스크롤 위치 추적

  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [currentPage, setCurrentPage] = useState('StoreMenuScreen');

  const getStoreData = async () => {
    try {
      const storeData = await StoreMainget(storeId);
      setStoredata(storeData);
      setLongitude(storeData.locationDto.longitude);
      setLatitude(storeData.locationDto.latitude);
      // const Menus = await StoreMenuget(storeId);
      // setMenus(Menus);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getStoreData();
  }, [storeId]);
  const imageSliderData =
    storedata.imgUrlList?.map(url => ({imageUrl: url})) || [];

  // 헤더 스타일 동적 변경
  const headerBackgroundColor = scrollY.interpolate({
    inputRange: [150, 250],
    outputRange: ['transparent', '#fff'],
    extrapolate: 'clamp',
  });

  const iconColor = scrollY.interpolate({
    inputRange: [150, 250],
    outputRange: ['#fff', '#333'],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [100, 250],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  return (
    <>
      {/* 네비게이션 헤더 */}
      <StoreHeader
        navigation={navigation}
        headerBackgroundColor={headerBackgroundColor}
        iconColor={iconColor}
        titleOpacity={titleOpacity}
        title={storedata.storeName}
      />

      {/* 이미지 슬라이더 및 콘텐츠 */}
      <ScrollView
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {useNativeDriver: false},
        )}
        scrollEventThrottle={16}
        style={{backgroundColor: 'white'}}>
        {/* 이미지 슬라이더 */}

        <View
          style={{
            height: '300',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {/* <ImageSlider images={tempImages} interval={4000} /> */}
          {imageSliderData.length > 0 ? (
            <ImageSlider images={imageSliderData} interval={4000} />
          ) : (
            <View>
              <Text>이미지 없음</Text>
            </View>
          )}
        </View>

        {/* 추가 콘텐츠 */}
        <StoreMainInfo
          storedata={storedata}
          onModalOpen={() => setIsModalVisible(true)}
          navigation={navigation}
        />
        <View style={{backgroundColor: '#F2F2F2', height: 20}} />
        <StoreTabs changePage={setCurrentPage} />
        <View>
          {currentPage === 'StoreMenuScreen' && (
            <StoreMenuScreen
              navigation={navigation}
              storeId={storeId}
              menus={menus}
            />
          )}
          {currentPage === 'StoreAlcoholScreen' && (
            <StoreAlcoholScreen
              navigation={navigation}
              storeId={storeId}
              menus={menus}
            />
          )}
          {currentPage === 'StoreReviewScreen' && (
            <StoreReviewScreen navigation={navigation} storeId={storeId} />
          )}
          {currentPage === 'StoreMapScreen' && (
            <StoreMapScreen
              navigation={navigation}
              storeId={storeId}
              storeLatitude={latitude}
              storeLongitude={longitude}
              innerlatitude={innerlatitude}
              innerlongitude={innerlongitude}
            />
          )}
        </View>
      </ScrollView>
    </>
  );
};

export default StoreMainScreen;
