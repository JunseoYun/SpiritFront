import React from 'react';
import { View, Text, ImageBackground, StyleSheet } from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation ';

const OpenStoreItem = ({ store }) => {
  const calculateWalkingTime = distance => {
    const walkingSpeed = 80; // 평균 보행 속도 (m/min)
    return Math.ceil(distance / walkingSpeed); // 소수점 올림
  };

  const walkingTime = calculateWalkingTime(store.distance);
  const {translateCategory} = useCategoryTranslation();
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <ImageBackground
          source={require('../../../assets/MainPagetodayimg.png')}
          // source={
          //   store.imgUrl
          //     ? {uri: store.imgUrl} // URL이 있는 경우
          //     : require('../../../assets/MainPagetodayimg.png') // URL이 없으면 로컬 이미지 사용
          // }
          style={styles.imageBackground}
          imageStyle={styles.imageStyle}>
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>
              영업종료 {store.closeHour.slice(0, 5)}
            </Text>
          </View>
        </ImageBackground>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.storeName}>{store.storeName}</Text>
        <View style={styles.categoriesContainer}>
                          <Text style={styles.categoryText}>
                            {Array.isArray(store.categories) && store.categories.length > 0
                              ? store.categories.map((category) => translateCategory(category)).join(' ')
                              : '카테고리 미설정'}
                          </Text>
        </View>
        <Text style={styles.menuTag}>#대표메뉴</Text>
        <View style={styles.distanceContainer}>
          {/* <Text style={styles.distanceText}>{store.distance.toFixed(0)}m</Text> */}
          <Text style={styles.walkingTimeText}>{walkingTime}분</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    marginHorizontal: 10,
    marginVertical: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5, // Android 그림자 효과
  },
  imageContainer: {
    height: 120,
    width: '100%',
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageStyle: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  overlayText: {
    color: '#f9c74f',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 10,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
    marginHorizontal: 2,
    marginVertical: 2,
    backgroundColor: '#6c757d',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  menuTag: {
    fontSize: 12,
    color: '#888',
    fontWeight: '500',
    marginBottom: 10,
  },
  distanceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  walkingTimeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#10BEFB',
  },
});

export default OpenStoreItem;
