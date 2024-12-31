import React from 'react';
import {View, ImageBackground, StyleSheet, Text} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation ';

const TodayRecommItem = ({store, category}) => {
  const {translateCategory} = useCategoryTranslation();
  return (
    <View style={styles.container}>
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
          {/* 태그 */}
          <View>
            <Text style={styles.tag}>{category}</Text>
          </View>
          <View style={styles.storeContainer}>
            <View style={styles.storeInfoContainer}>
              <Text style={styles.storeName}>{store.storeName}</Text>
              <View style={styles.categoriesContainer}>
                <Text style={styles.categoryText}>{translateCategory(store.categories)}</Text>
              </View>
            </View>
            <View style={styles.storeSubInfoContainer}>
              <Text style={styles.storeSubInfo}>소주 5000원 · 맥주 3500원</Text>
            </View>
          </View>

          {/* 가게 정보 */}
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 370, // 카드 너비
    height: 170, // 카드 높이
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
    backgroundColor: 'rgba(16, 190, 251, 0.7)', // 반투명 배경
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 17,
  },
  storeContainer: {
    flexDirection: 'row', // 카테고리 가로 정렬
    justifyContent: 'space-between',
  },
  storeInfoContainer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // 반투명 배경
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  storeSubInfoContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 10,
  },
  storeName: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  storeSubInfo: {
    color: '#10BEFB',
    fontSize: 11,
    fontWeight: 'bold',
    marginTop: 35,
    textShadowColor: 'rgba(16, 190, 251, 0.4)',
    textShadowOffset: {width: 1, height: 1},
    textShadowRadius: 2,
    elevation: 3, // 안드로이드에서 입체감 강화
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

export default TodayRecommItem;
