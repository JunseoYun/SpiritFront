import React from 'react';
import { View, ImageBackground, StyleSheet, Text } from 'react-native';
import MapCategory from '../../../hooks/MapCategory';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation ';

const LivehotStoreItem = ({ store }) => {
  const { translateCategory } = useCategoryTranslation();
  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../../assets/MainPagetodayimg.png')}
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}>
        <View style={styles.overlay}>
          {/* 태그 */}
          <Text style={styles.tag}>LIVE HOT</Text>

          {/* 가게 정보 */}
          <View style={styles.storeInfo}>
            <Text style={styles.storeName}>{store.storeName}</Text>
            <View style={styles.categoriesContainer}>
              <Text style={styles.categoryText}>{translateCategory(store.categories)}</Text>
            </View>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 360, // 카드 너비
    height: 170, // 카드 높이
    marginHorizontal: 10,
    marginVertical: 10,
    borderRadius: 17,
    overflow: 'hidden', // 경계선 밖 숨김
    elevation: 5, // Android 그림자
  },
  imageBackground: {
    flex: 1,
    justifyContent: 'space-between', // 위아래로 요소 배치
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 12,
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF3753',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  storeInfo: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // 반투명 배경
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  storeName: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  categoriesContainer: {
    flexDirection: 'row', // 카테고리 가로 정렬
    flexWrap: 'nowrap', // 줄바꿈 방지
    marginTop: 5,
  },
  categoryText: {
    color: '#f9c74f',
    fontSize: 11,
    fontWeight: 'bold',
    marginRight: 8, // 카테고리 간 간격
  },
});

export default LivehotStoreItem;
