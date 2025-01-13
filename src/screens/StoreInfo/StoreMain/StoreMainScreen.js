import React, { useEffect, useState } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImageSlider from '../../../components/StoreScreen/ImageSlider';
import { ScrollView } from 'react-native-gesture-handler';
import StoreMainInfo from '../../../components/StoreScreen/StoreMainInfo';
import StoreTabs from '../../../components/StoreScreen/StoreTabs';
import { useRoute } from '@react-navigation/native';
import { StoreMainget } from '../../../api/storeApi';
import StoreMenuScreen from '../StoreMenu/StoreMenuScreen';
import StoreReviewScreen from '../StoreReview/StoreReviewScreen';
import StoreMapScreen from '../StoreMap/StoreMapScreen';

const { width } = Dimensions.get('window');

const StoreMainScreen = ({ navigation }) => {
  const route = useRoute();
  const { storeId, innerlatitude, innerlongitude } = route.params;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [storedata, setStoredata] = useState('');
  const [scrollY] = useState(new Animated.Value(0)); // 스크롤 위치 추적

  const [longitude, setLongitude] = useState(127.1320999);
  const [latitude, setLatitude] = useState(37.274125);
  const [currentPage, setCurrentPage] = useState('StoreMenuScreen');

  const onPressModalOpen = () => {
    setIsModalVisible(true);
  };

  const onPressModalClose = () => {
    setIsModalVisible(false);
  };

  const getStoreData = async () => {
    try {
      // const storeData = await StoreMainget(
      //   storeId,
      //   innerlatitude,
      //   innerlongitude,
      // );
      // console.log(storeData);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    getStoreData();
  }, [storeId]);

  const tempImages = [
    { imageUrl: 'https://www.ghibli.jp/gallery/chihiro036.jpg' },
    { imageUrl: 'https://www.ghibli.jp/gallery/chihiro021.jpg' },
    { imageUrl: 'https://www.ghibli.jp/gallery/chihiro042.jpg' },
    { imageUrl: 'https://www.ghibli.jp/gallery/chihiro001.jpg' },
    { imageUrl: 'https://www.ghibli.jp/gallery/chihiro012.jpg' },
  ];

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
      <Animated.View
        style={[
          styles.navigateView,
          { backgroundColor: headerBackgroundColor },
        ]}
      >
        <Pressable onPress={() => navigation.goBack()}>
          <Animated.Text style={{ color: iconColor }}>
            <Ionicons name="arrow-back-outline" size={25} />
          </Animated.Text>
        </Pressable>
        <Animated.Text style={[styles.headerTitle, { opacity: titleOpacity }]}>
          {storedata?.name || '친구포차'}
        </Animated.Text>
        <Pressable onPress={() => navigation.navigate('MainBtmbar')}>
          <Animated.Text style={{ color: iconColor }}>
            <Ionicons name="home-outline" size={25} />
          </Animated.Text>
        </Pressable>
      </Animated.View>

      {/* 이미지 슬라이더 및 콘텐츠 */}
      <ScrollView
        style={{ backgroundColor: '#E7E7E&' }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* 이미지 슬라이더 */}

        <ImageSlider images={tempImages} interval={4000} />


        {/* 추가 콘텐츠 */}
        <StoreMainInfo
          storedata={storedata}
          onModalOpen={() => setIsModalVisible(true)}
          navigation={navigation}
        />
        <StoreTabs
          changePage={setCurrentPage}
        />

        <View>
          {currentPage === 'StoreMenuScreen' && (
            <StoreMenuScreen
              navigation={navigation}
              storeId={storeId}
              innerlatitude={innerlatitude}
              innerlongitude={innerlongitude}
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
        <View style={styles.contentContainer}>
          <View style={styles.contentBox}>
            <Text>스크롤 가능한 콘텐츠 1</Text>
          </View>
          <View style={styles.contentBox}>
            <Text>스크롤 가능한 콘텐츠 2</Text>
          </View>

          <View style={styles.contentBox}>
            <Text>스크롤 가능한 콘텐츠 3</Text>
          </View>
          <View style={styles.contentBox}>
            <Text>스크롤 가능한 콘텐츠 3</Text>
          </View>
          <View style={styles.contentBox}>
            <Text>스크롤 가능한 콘텐츠 3</Text>
          </View>
          <View style={styles.contentBox}>
            <Text>스크롤 가능한 콘텐츠 3</Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  navigateView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === 'ios' ? 100 : 70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    zIndex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,

  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  contentContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
    backgroundColor: 'white',
  },
  contentBox: {
    height: 150,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});

export default StoreMainScreen;
