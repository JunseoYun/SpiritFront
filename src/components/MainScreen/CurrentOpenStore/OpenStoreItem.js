import React, {useState, useEffect} from 'react';
import {View, Text, ImageBackground, StyleSheet, Pressable} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation ';

import Ionicons from 'react-native-vector-icons/Ionicons';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import useDistance from '../../../hooks/useDistance';
import useStoreStatus from '../../../hooks/useStoreStatus';

const OpenStoreItem = ({store, location, navigation}) => {
  const {translateAlcohol} = useTranslateAlcohol();
  const [distance, setDistance] = useState(0);
  const [unit, setUnit] = useState('m');
  const calculateDistance = useDistance();

  const isStoreBreak = useStoreStatus(
    store?.businessHoursDto?.breakStartTime,
    store?.businessHoursDto?.breakEndTime,
  );
  const calculateWalkingTime = distance => {
    const walkingSpeed = 80; // 평균 보행 속도 (m/min)
    return Math.ceil(distance / walkingSpeed); // 소수점 올림
  };
  useEffect(() => {
    const fetchDistance = () => {
      let tempDistance = calculateDistance(
        location.latitude,
        location.longitude,
        store.locationDto.latitude,
        store.locationDto.longitude,
      );
      if (tempDistance < 1) {
        tempDistance *= 1000;
        setDistance(tempDistance.toFixed(0));
      } else {
        setDistance(tempDistance.toFixed(2));
        setUnit('km');
      }
    };
    fetchDistance();
  }, [store]);

  const walkingTime = calculateWalkingTime(distance);
  const {translateCategory} = useCategoryTranslation();
  return (
    <>
      <Pressable
        onPress={() =>
          navigation.navigate('StoreStack', {
            screen: 'StoreMainScreen',
            params: {
              storeId: store.id,
              innerlatitude: store.locationDto.latitude,
              innerlongitude: store.locationDto.longitude,
            },
          })
        }
        style={styles.container}>
        <View style={styles.backimageview}>
          <ImageBackground
            source={
              store.mainImgUrl
                ? {uri: store.mainImgUrl} // ✅ 네트워크 이미지
                : require('../../../assets/default_store.png') // ✅ 로컬 이미지
            }
            style={styles.backimage}
            imageStyle={styles.backimagestyle}>
            {/* ✅ 브레이크 타임 표시 */}
            {isStoreBreak && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  브레이크 타임{' '}
                  {store.businessHoursDto?.breakEndTime
                    ? `${store.businessHoursDto.breakEndTime.slice(0, 5)} 종료`
                    : ''}
                </Text>
              </View>
            )}
            {!isStoreBreak && (
              <View style={styles.openOverlay}>
                <Text style={styles.openOverlayText}>
                  영업 종료 {store.businessHoursDto.closeTime.slice(0, 5)}{' '}
                </Text>
              </View>
            )}
          </ImageBackground>
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

          <Text
            style={styles.alcoholTag}
            numberOfLines={2}
            ellipsizeMode="tail">
            {store.mainDrinkDtos && store.mainDrinkDtos.length > 0
              ? store.mainDrinkDtos
                  .map(
                    drink =>
                      `# ${translateAlcohol(
                        drink.type,
                      )} ${drink.price.toLocaleString()}원`,
                  )
                  .join('\n')
              : '메인주류가 없습니다.'}
          </Text>
        </View>
      </Pressable>
      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>
          {distance}
          {unit}
          {'  |  '}
          {walkingTime}분
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 160,
    height: 240,
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
  backimageview: {
    width: 160,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden', // ✅ overlay가 이미지 밖으로 나가지 않도록 처리
  },
  backimage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  backimagestyle: {
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
    borderTopRightRadius: 15,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  openOverlay: {
    position: 'absolute',
    bottom: 0, // 사진 안쪽 하단에 고정
    width: '100%', // 가로 전체 차지
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // ✅ 어두운 반투명 배경으로 가독성 향상
    paddingVertical: 5,
    paddingLeft: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  openOverlayText: {
    color: '#fff',
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
    fontSize: 12,
    color: '#fff',
    fontWeight: 'bold',
    marginHorizontal: 2,
    marginVertical: 2,
    backgroundColor: '#999',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    lineHeight: 14,
  },

  alcoholTag: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 10,
    lineHeight: 20,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: -7,
    marginHorizontal: 18,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#333',
  },
  walkingTimeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10BEFB',
  },
});

export default OpenStoreItem;
