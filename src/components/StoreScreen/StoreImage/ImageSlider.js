import React, {useEffect, useRef, useState} from 'react';
import {View, ScrollView, StyleSheet, Dimensions, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import ImageActionModal from './ImageActionModal';

const {width} = Dimensions.get('window');

const ImageSlider = ({
  storeId,
  images,
  interval = 3000,
  isUpdate = false,
  handleBottomOpen,
  onEditKey,
  onEditValue,
  navigation,
}) => {
  const scrollRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [isModalVisible, setModalVisible] = useState(false);
  const [localImages, setLocalImages] = useState(images); // 내부 상태로 복사

  // 외부에서 images 변경되면 내부 반영
  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  // 무한루프용 이미지 배열
  const imagesWithLoop =
    localImages.length > 1
      ? [localImages[localImages.length - 1], ...localImages, localImages[0]]
      : localImages;

  // 초기 위치 설정
  useEffect(() => {
    if (scrollRef.current && localImages.length > 1) {
      scrollRef.current.scrollTo({x: width, animated: false});
    }
  }, [localImages]);
  // 자동 슬라이드
  useEffect(() => {
    if (localImages.length > 1) {
      const autoSlide = setInterval(() => {
        if (scrollRef.current) {
          const nextIndex = currentIndex + 1;
          scrollRef.current.scrollTo({
            x: nextIndex * width,
            animated: true,
          });
          setCurrentIndex(nextIndex);
        }
      }, interval);
      return () => clearInterval(autoSlide);
    }
  }, [currentIndex, interval, localImages]);

  // 무한 슬라이드 처리
  const handleScrollEnd = event => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / width);

    if (index === 0) {
      scrollRef.current.scrollTo({
        x: width * (imagesWithLoop.length - 2),
        animated: false,
      });
      setCurrentIndex(imagesWithLoop.length - 2);
    } else if (index === imagesWithLoop.length - 1) {
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
          onPress={() => setModalVisible(true)}
        />
      )}
      <ImageActionModal
        visible={isModalVisible}
        navigation={navigation}
        onClose={() => setModalVisible(false)}
        onEdit={() => {
          setModalVisible(false);
          handleBottomOpen();
          onEditKey('images');
          onEditValue(localImages);
        }}
        onSort={() => {
          setModalVisible(false);
          navigation.navigate('ImageReorderScreen', {
            images: localImages,
            storeId,
            onSave: updatedImages => {
              setLocalImages(updatedImages); // ✅ 슬라이더 즉시 반영
            },
          });
        }}
      />

      {localImages.length > 0 ? (
        <View style={styles.sliderContainer}>
          {localImages.length > 1 ? (
            <ScrollView
              ref={scrollRef}
              pagingEnabled
              horizontal
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScrollEnd}
              scrollEventThrottle={16}>
              {imagesWithLoop.map((item, index) => (
                <View key={index} style={styles.imageContainer}>
                  <FastImage
                    source={{
                      uri: item.imageUrl,
                      priority: FastImage.priority.normal,
                    }}
                    style={styles.image}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                </View>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.imageContainer}>
              <FastImage
                source={{
                  uri: localImages[0]?.imageUrl,
                  priority: FastImage.priority.normal,
                }}
                style={styles.image}
                resizeMode={FastImage.resizeMode.cover}
              />
            </View>
          )}

          {localImages.length > 1 && (
            <View style={styles.indicatorContainer}>
              {localImages.map((_, index) => (
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
        <View style={styles.noneImageContainer}>
          <FastImage
            style={[styles.noneImage, {opacity: 0.7}]}
            source={require('../../../assets/store.png')}
            resizeMode={FastImage.resizeMode.cover}
          />
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
    height: 270,
  },
  noneImageContainer: {
    width: width,
    height: 270,
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
  },
  icon: {
    position: 'absolute',
    top: 120,
    left: (width - 50) / 2,
    zIndex: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  noneImage: {
    width: 197,
    height: 155,
    alignSelf: 'center',
  },
  indicatorContainer: {
    position: 'absolute',
    top: 250,
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
    width: 14,
    height: 7,
  },
});

export default ImageSlider;
