import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
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
    if (scrollRef.current) {
      scrollRef.current.scrollTo({x: width, animated: false}); // 두 번째 이미지(실제 첫 번째 이미지)로 이동
    }
  }, []);

  // 자동 슬라이드 구현
  useEffect(() => {
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
  }, [currentIndex, interval]);

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
    <View style={[styles.container, isUpdate && styles.updateContainer]}>
      {/* 이미지 슬라이더 */}
      {isUpdate && (
        <Ionicons
          name="images-sharp"
          size={50}
          color="#fff"
          style={styles.icon}
          onPress={() => handleEdit('images', images)}
        />
      )}

      <ScrollView
        ref={scrollRef}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd} // 스크롤이 끝날 때 호출
        scrollEventThrottle={16}>
        {imagesWithLoop.map((item, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image source={{uri: item.imageUrl}} style={styles.image} />
          </View>
        ))}
        {isUpdate && (
          <TouchableOpacity
            style={styles.overlay}
            onPress={() => handleEdit('images', images)}></TouchableOpacity>
        )}
      </ScrollView>

      {/* 인디케이터 */}
      <View style={styles.indicatorContainer}>
        {images.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              currentIndex === index + 1 && styles.activeIndicator, // +1로 조정
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  updateContainer: {
    backgroundColor: '#black',
  },
  imageContainer: {
    width: width,
    height: 300,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject, // 이미지 위를 덮는 스타일
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
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
});

export default ImageSlider;
