import React from 'react';
import {View, ImageBackground, StyleSheet, Text, Pressable} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';

const TodayRecommItem = ({store, category, location, navigation}) => {
  const {translateCategory} = useCategoryTranslation();
  return (
    <Pressable
      onPress={() =>
        navigation.navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {
            storeId: store.id,
          },
        })
      }
      style={styles.container}>
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
            <Text
              style={styles.storeName}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.name}
            </Text>
            <Text
              style={styles.storeSubInfo}
              numberOfLines={1}
              ellipsizeMode="tail">
              소주 5000원 · 맥주 3500원
            </Text>
          </View>

          {/* 가게 정보 */}
        </View>
      </ImageBackground>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 370, // 카드 너비
    height: 200, // 카드 높이
    marginVertical: 10,
    borderRadius: 10,
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
  },
  tag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(16, 190, 251, 0.7)', // 반투명 배경
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 17,
    marginTop: 12,
    marginLeft: 12,
  },
  storeContainer: {
    height: 40,
    flexDirection: 'row', // 카테고리 가로 정렬
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 190, 251, 0.4)', // 반투명 배경
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  storeName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 12,
    maxWidth: '50%',
  },
  storeSubInfo: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    marginRight: 12,
    maxWidth: '50%',
  },
});

export default TodayRecommItem;
