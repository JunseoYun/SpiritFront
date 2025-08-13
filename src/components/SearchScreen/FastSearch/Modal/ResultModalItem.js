import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../../hooks/useCategoryTranslation';
import useStoreStatus from '../../../../hooks/useStoreStatus';
import useDistance from '../../../../hooks/useDistance';
import {useAuth} from '../../../../context/AuthContext';
import {useToast} from '../../../../context/ToastContext';
import useTranslateAlcohol from '../../../../hooks/useTranslateAlcohol';
import FastImage from 'react-native-fast-image';
const ResultModalItem = ({store, navigation, location}) => {
  const {translateCategory} = useCategoryTranslation();
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

  const {token} = useAuth();
  const {showToast} = useToast();
  const handlePress = () => {
    if (!token) {
      showToast('로그인 후 이용할 수 있어요!', 'center');
      return;
    }

    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId: store.id},
    });
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
  return (
    <Pressable onPress={handlePress}>
      <View style={styles.fastSearchStoreInfo}>
        <ImageBackground
          source={
            store.mainImgUrl
              ? {uri: store.mainImgUrl} // ✅ 네트워크 이미지
              : require('../../../../assets/default_store.png') // ✅ 로컬 이미지
          }
          style={styles.backimage}
          imageStyle={styles.backimagestyle}>
          {/* ✅ 영업 종료 표시 */}
          {!isOpen && !nextclosed && !closed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                영업 종료 {starttime ? `\n${starttime} 오픈` : ''}
              </Text>
            </View>
          )}
          {!isOpen && nextclosed && !closed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>영업 종료 익일 휴무</Text>
            </View>
          )}
          {!isOpen && !nextclosed && closed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>금일 휴무</Text>
            </View>
          )}
          {/* ✅ 브레이크 타임 표시 */}
          {isOpen && isBreak && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                브레이크 타임 {breakend ? `\n${breakend} 종료` : ''}
              </Text>
            </View>
          )}
        </ImageBackground>
        <View style={styles.fastStoreText}>
          <View>
            <View style={styles.fastSearchStoreView}>
              <View
                style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                {store.isCertified === true && (
                  <FastImage
                    source={require('../../../../assets/verifyMaker.png')}
                    style={styles.imageStyle}
                  />
                )}
                <Text
                  style={styles.fastStoreTitle}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {store.name}
                </Text>
              </View>

              <View style={styles.fastStorescore}>
                <FontAwesomeIcon name="star" size={15} color="#FCC104" />
                <Text style={styles.fastScoretext}>{store.storeRate}</Text>
              </View>
            </View>

            <View style={styles.StoreScore}>
              {store.categories.slice(0, 3).map((category, index) => (
                <Text key={index} style={styles.StoreCategory}>
                  {translateCategory(category)}
                </Text>
              ))}
            </View>
          </View>

          <View style={styles.StoreAlcoholList}>
            <Text
              style={styles.StoreAlcohol}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.mainDrinkDtos && store.mainDrinkDtos.length > 0
                ? store.mainDrinkDtos
                    .map(
                      drink => `${translateAlcohol(drink.type)} ${drink.price}`,
                    ) // 데이터 형식화
                    .join('  ') // 아이템 간 간격 추가
                : '메인주류가 없습니다.'}
            </Text>
          </View>
          <View style={styles.subView}>
            {store?.isAlwaysOpen == true ? (
              <Text style={styles.StoreClose}>24시간 영업</Text>
            ) : store?.isAlwaysOpen == false && closed ? (
              <Text style={styles.StoreClose}>금일 휴무</Text>
            ) : (
              <Text style={styles.StoreClose}>
                영업 종료 {endtime || '정보 없음'}
              </Text>
            )}
            <Text style={styles.StoreClose}>
              {distance} {unit}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fastSearchStoreInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 16,
    marginHorizontal: 18,
    marginVertical: 7,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },

  backimage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  backimagestyle: {
    borderRadius: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
    lineHeight: 22,
  },
  fastStoreText: {
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    flex: 1,
    marginVertical: 3,
  },
  fastSearchStoreView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 1,
  },
  fastStoreTitle: {
    maxWidth: '90%',
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#111',
  },
  fastStorescore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fastScoretext: {
    marginLeft: 3,
    fontSize: 15,
    color: '333',
    fontFamily: 'Pretendard-Regular',
  },
  StoreScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  StoreCategory: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#767676',
    marginRight: 5,
  },
  StoreAlcoholList: {
    flexDirection: 'row',
    marginRight: 5,
    alignItems: 'center',
  },
  StoreAlcohol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
    fontFamily: 'Pretendard-Medium',
  },
  subView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  StoreClose: {
    fontSize: 13,
    color: '#999',
    marginRight: 5,
    fontFamily: 'Pretendard-Medium',
  },
  imageStyle: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    marginRight: 3,
  },
});

export default ResultModalItem;
