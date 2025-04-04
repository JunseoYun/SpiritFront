import React, {useState, useEffect} from 'react';
import {View, Text, ImageBackground, StyleSheet, Pressable} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import useDistance from '../../../hooks/useDistance';
import useStoreStatus from '../../../hooks/useStoreStatus';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const OpenStoreItem = ({store, location, navigation}) => {
  const {translateAlcohol} = useTranslateAlcohol();
  const [distance, setDistance] = useState(0);
  const [unit, setUnit] = useState('m');
  const calculateDistance = useDistance();

  const {
    isOpen,
    isBreak,
    closed,
    nextclosed,
    starttime,
    endtime,
    breakstart,
    breakend,
  } = useStoreStatus(store?.operationInfoDtos, store?.isAlwaysOpen);

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
            {isOpen && isBreak && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  브레이크 타임 {breakend ? `${breakend} 종료` : ''}
                </Text>
              </View>
            )}
          </ImageBackground>
        </View>
        <View style={styles.storeViewInfo}>
          <Text
            style={styles.storMainInfo}
            numberOfLines={1} // 한 줄로 제한
            ellipsizeMode="tail">
            {store.name}
          </Text>
        </View>
        {/* ✅ 가게 카테고리 */}
        <View style={styles.storeViewInfo}>
          <Text style={styles.StoreCategory}>
            {store.categories && store.categories.length > 0
              ? store.categories
                  .map(category => translateCategory(category))
                  .join('  ')
              : '카테고리 미설정'}
          </Text>
        </View>
        <View style={styles.storeViewInfo}>
          <Text
            style={styles.storeSubInfo}
            numberOfLines={1}
            ellipsizeMode="tail">
            {store.mainDrinkDtos && store.mainDrinkDtos.length > 0
              ? store.mainDrinkDtos
                  .map(drink => `${translateAlcohol(drink.type)}`)
                  .join(' ')
              : '메인주류 미설정'}
          </Text>
          <Text style={styles.storeSubInfo}>
            {distance} {unit}
          </Text>
        </View>
      </Pressable>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    marginTop: 15,
  },
  backimageview: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 7,
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
    borderRadius: 7,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Pretendard-Bold',
  },

  storeViewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
    marginLeft: 3,
    marginRight: 3,
  },
  storMainInfo: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    width: 140,
  },
  storRate: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#FCC104',
  },
  storRateInfo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
  },

  StoreCategory: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  storeSubInfo: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
});

export default OpenStoreItem;
