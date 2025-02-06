import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const {width} = Dimensions.get('window');

const ImageSlider = ({
  images,
  interval = 3000,
  isUpdate = false,
  handleBottomOpen,
  onEditKey,
  onEditValue,
}) => {
  const scrollRef = useRef(null); // ScrollView 참조
  const [currentIndex, setCurrentIndex] = useState(1); // 현재 페이지 (첫 번째 실제 이미지로 초기화)

  const handleEdit = (key, value) => {
    onEditKey(key); // 수정 키와 값을 부모 컴포넌트로 전달
    onEditValue(value);
    handleBottomOpen(); // 바텀 시트 열기
  };

  // 이미지 배열 확장: 첫 번째와 마지막 이미지를 복제
  const imagesWithLoop = [
    images[images.length - 1], // 마지막 이미지
    ...images, // 원본 이미지
    images[0], // 첫 번째 이미지
  ];

  // 초기 위치 설정
  useEffect(() => {
    if (scrollRef.current && images.length > 1) {
      scrollRef.current.scrollTo({x: width, animated: false}); // 두 번째 이미지(실제 첫 번째 이미지)로 이동
    }
  }, [images]);

  // 자동 슬라이드 구현
  useEffect(() => {
    if (images.length > 1) {
      const autoSlide = setInterval(() => {
        if (scrollRef.current) {
          const nextIndex = currentIndex + 1;
          scrollRef.current.scrollTo({
            x: nextIndex * width,
            animated: true,
          });
          setCurrentIndex(nextIndex);
        }
      }, interval); // 사용자 정의 간격 (기본값: 3000ms)

      return () => clearInterval(autoSlide); // 컴포넌트 언마운트 시 인터벌 제거
    }
  }, [currentIndex, interval, images]);

  // 스크롤이 끝날 때 실행 (무한 슬라이드 처리)
  const handleScrollEnd = event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);

    if (index === 0) {
      // 마지막 이미지에서 실제 마지막으로 점프
      scrollRef.current.scrollTo({
        x: width * (imagesWithLoop.length - 2),
        animated: false,
      });
      setCurrentIndex(imagesWithLoop.length - 2);
    } else if (index === imagesWithLoop.length - 1) {
      // 첫 번째 이미지에서 실제 첫 번째로 점프
      scrollRef.current.scrollTo({x: width, animated: false});
      setCurrentIndex(1);
    } else {
      setCurrentIndex(index);
    }
  };

  return (
    <View style={styles.container}>
      {isUpdate && (
        <Ionicons
          name="images-sharp"
          size={50}
          color="#fff"
          style={styles.icon}
          onPress={() => handleEdit('images', images)}
        />
      )}

      {images.length > 0 ? (
        <View style={styles.sliderContainer}>
          {images.length > 1 ? (
            <ScrollView
              ref={scrollRef}
              pagingEnabled
              horizontal
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEnd}
              scrollEventThrottle={16}>
              {imagesWithLoop.map((item, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{uri: item.imageUrl}} style={styles.image} />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.imageContainer}>
              <Image source={{uri: images[0].imageUrl}} style={styles.image} />
            </View>
          )}

          {images.length > 1 && (
            <View style={styles.indicatorContainer}>
              {images.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    currentIndex === index + 1 && styles.activeIndicator,
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>이미지 없음</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: 300,
  },
  icon: {
    position: 'absolute',
    top: 120,
    left: (width - 50) / 2, // 아이콘 크기를 고려한 가운데 정렬
    zIndex: 10, // 다른 요소 위에 표시
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  indicatorContainer: {
    position: 'absolute',
    top: 280,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  indicator: {
    width: 7,
    height: 7,
    borderRadius: 10,
    backgroundColor: '#E7E7E7',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: 'rgb(16, 188, 251)',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: width,
    height: 300,
  },
  emptyText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ImageSlider;
