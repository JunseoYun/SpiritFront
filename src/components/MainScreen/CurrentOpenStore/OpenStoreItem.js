import React, {useState} from 'react';
import {View, Text, ImageBackground, StyleSheet, Pressable} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation ';

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const OpenStoreItem = ({store, location, navigation}) => {
  const calculateWalkingTime = distance => {
    const walkingSpeed = 80; // 평균 보행 속도 (m/min)
    return Math.ceil(distance / walkingSpeed); // 소수점 올림
  };

  const [isBreak, setBreak] = useState(false);

  const walkingTime = calculateWalkingTime(store.distance);
  const {translateCategory} = useCategoryTranslation();
  return (
    <>
      <Pressable
        onPress={() =>
          navigation.navigate('StoreStack', {
            screen: 'StoreMainScreen',
            params: {
              storeId: store.id,
              innerlatitude: location.latitude,
              innerlongitude: location.longitude,
            },
          })
        }
        style={styles.container}>
        <View style={styles.imageContainer}>
          {store.mainImgUrl ? (
            <ImageBackground
              source={{uri: store.mainImgUrl}} // URL이 있는 경우
              style={styles.imageBackground}
              imageStyle={styles.imageStyle}>
              {isBreak ? (
                <View style={styles.breakView}>
                  <Text style={styles.breakText}>주점 쉬는 중</Text>
                  <Text style={styles.breakText}>
                    {store.businessHoursDto?.breakStartTime?.slice(0, 5)} ~{' '}
                    {store.businessHoursDto?.breakEndTime?.slice(0, 5)}
                  </Text>
                </View>
              ) : (
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>
                    영업 종료 {store.businessHoursDto.closeTime.slice(0, 5)}
                  </Text>
                </View>
              )}
            </ImageBackground>
          ) : (
            <View style={styles.imageBackground}>
              <Text
                style={{
                  color: 'black',
                  textAlign: 'center',
                  paddingBottom: 30,
                }}>
                이미지 없음
              </Text>
              {isBreak ? (
                <View style={styles.breakView}>
                  <Text style={styles.breakText}>주점 쉬는 중</Text>
                  <Text style={styles.breakText}>
                    {store.businessHoursDto?.breakStartTime?.slice(0, 5)} ~{' '}
                    {store.businessHoursDto?.breakEndTime?.slice(0, 5)}
                  </Text>
                </View>
              ) : (
                <View style={styles.overlay}>
                  <Text style={styles.overlayText}>
                    영업 종료 {store.businessHoursDto.closeTime.slice(0, 5)}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        <View style={styles.infoContainer}>
          <Text style={styles.storeName} numberOfLines={1} ellipsizeMode="tail">
            {store.name}
          </Text>
          <View style={styles.categoriesContainer}>
            {Array.isArray(store.categories) && store.categories.length > 0 ? (
              store.categories.map((category, index) => (
                <Text key={index} style={styles.categoryText}>
                  {translateCategory(category)}
                </Text>
              ))
            ) : (
              <Text style={styles.categoryText}>카테고리 미설정</Text>
            )}
          </View>
          <Text style={styles.menuTag} numberOfLines={2} ellipsizeMode="tail">
            {store.menuList && store.menuList.length > 0
              ? store.menuList
                  .map(
                    menu => `${menu.name}`, // 메뉴 항목 형식화
                  )
                  .join('  ') // 항목 간 간격 추가
              : '메뉴가 없습니다.'}
          </Text>
          <Text
            style={styles.alcoholTag}
            numberOfLines={2}
            ellipsizeMode="tail">
            {store.mainDrinkDtos && store.mainDrinkDtos.length > 0
              ? store.mainDrinkDtos
                  .map(
                    drink =>
                      `${translateAlcohol(
                        drink.type,
                      )} ${drink.price.toLocaleString()}원`,
                  )
                  .join('  ')
              : '메인주류가 없습니다.'}
          </Text>
        </View>
      </Pressable>
      <View style={styles.distanceContainer}>
        {/* <Text style={styles.distanceText}>{store.distance.toFixed(0)}m</Text> */}

        <Ionicons name="footsteps" size={20} color="#16BBFF" />
        <Text style={styles.walkingTimeText}>{walkingTime}분</Text>
      </View>
    </>
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
    shadowOffset: {width: 0, height: 4},
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
  breakView: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 16,
  },
  breakText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    marginBottom: 5,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 5,
    paddingHorizontal: 10,
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
    maxWidth: '100%',
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
  alcoholTag: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    marginBottom: 10,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -7,
    marginRight: 15,
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
    marginLeft: 5,
  },
});

export default OpenStoreItem;
