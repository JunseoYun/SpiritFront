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
import StoreHeader from '../../../components/StoreScreen/StoreHeader';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const StoreMainScreen = ({ navigation }) => {
  const route = useRoute();
  const { storeId, innerlatitude, innerlongitude } = route.params;
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [storedata, setStoredata] = useState('');
  const [scrollY] = useState(new Animated.Value(0)); // 스크롤 위치 추적

  const onPressModalOpen = () => {
    setIsModalVisible(true);
  };

  const onPressModalClose = () => {
    setIsModalVisible(false);
  };

  const getStoreData = async () => {
    try {
      // 데이터를 가져오는 API 호출 코드
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
          {storedata?.name || '가게 이름'}
        </Animated.Text>
        <Pressable onPress={() => navigation.navigate('MainScreen')}>
          <Animated.Text style={{ color: iconColor }}>
            <Ionicons name="home-outline" size={25} />
          </Animated.Text>
        </Pressable>
      </Animated.View>

      {/* 이미지 슬라이더 및 콘텐츠 */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* 이미지 슬라이더 */}
        <View style={styles.sliderContainer}>
          <ImageSlider images={tempImages} interval={4000} />
        </View>

        {/* 추가 콘텐츠 */}
        <StoreHeader
          storedata={storedata}
          onModalOpen={() => setIsModalVisible(true)}
          navigation={navigation}
        />
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
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    height: 300,
    zIndex: -1,
  },
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContent: {},
  contentContainer: {
    paddingHorizontal: 15,
    paddingTop: 10,
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
