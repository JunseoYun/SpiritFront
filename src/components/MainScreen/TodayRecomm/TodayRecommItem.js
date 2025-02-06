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
        source={
          store.mainImgUrl
            ? {uri: store.mainImgUrl} // URL이 있는 경우
            : require('../../../assets/default_store.png') // URL이 없으면 로컬 이미지 사용
        }
        style={styles.imageBackground}
        imageStyle={styles.imageStyle}>
        <View style={styles.overlay}>
          <View style={styles.storeContainer}>
            <View style={styles.storeNameView}>
              <Text
                style={styles.storeName}
                numberOfLines={1}
                ellipsizeMode="tail">
                {store.name}
              </Text>
            </View>
          </View>

          {/* 가게 정보 */}
        </View>
      </ImageBackground>
    </Pressable>
  );
};
const styles = StyleSheet.create({
  container: {
    width: '100%', // 카드 너비
    height: 200, // 카드 높이
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden', // 경계선 밖 숨김
    borderWidth: 1,
    borderColor: '#E0E0E0',
    flexDirection: 'row',
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
    flexDirection: 'row', // 카테고리 가로 정렬
  },
  storeContainer: {
    width: '100%',
    borderRadius: 10,
    alignSelf: 'flex-end',
  },
  storeNameView: {
    backgroundColor: '#fff',
    alignSelf: 'flex-end', // 👉 텍스트 크기에 맞춰 배경 크기 자동 조절
    borderRadius: 10,
    paddingHorizontal: 5, // 내부 패딩 조정
    paddingVertical: 2,
    marginBottom: 10,
    marginRight: 10,
    shadowColor: '#000', // 그림자 색상
    shadowOffset: {width: 2, height: 2}, // X, Y 방향 그림자 위치
    shadowOpacity: 0.3, // 그림자 투명도
    shadowRadius: 3, // 그림자 퍼짐 정도

    // ✅ Android 그림자 설정
    elevation: 3, // Android의 그림자 효과
    backgroundColor: '#fff', // elevation 사용 시 배경색이 필요함
  },
  storeName: {
    color: '#333',
    fontSize: 15,
    fontWeight: 'bold',
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
});

export default TodayRecommItem;
