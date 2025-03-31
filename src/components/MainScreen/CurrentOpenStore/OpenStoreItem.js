import React, {useState, useEffect} from 'react';
import {View, Text, ImageBackground, StyleSheet, Pressable} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import useDistance from '../../../hooks/useDistance';
import useStoreStatus from '../../../hooks/useStoreStatus';

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
            {/* ✅ 브레이크 타임 표시 */}
            {isBreak && isOpen && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  브레이크 타임{'\n'}
                  {breakend ? `${breakend} 종료` : ''}
                </Text>
                <Text
                  style={styles.overlayNameText}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {store.name}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {Array.isArray(store.categories) &&
                  store.categories.length > 0 ? (
                    store.categories.map((category, index) => (
                      <Text key={index} style={styles.overlayNameCategory}>
                        {translateCategory(category)}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.overlayNameCategory}>
                      카테고리 미설정
                    </Text>
                  )}
                </View>
              </View>
            )}

            {!isBreak && !isOpen && closed && !nextclosed && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>금일 휴무</Text>
                <Text
                  style={styles.overlayNameText}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {store.name}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {Array.isArray(store.categories) &&
                  store.categories.length > 0 ? (
                    store.categories.map((category, index) => (
                      <Text key={index} style={styles.overlayNameCategory}>
                        {translateCategory(category)}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.overlayNameCategory}>
                      카테고리 미설정
                    </Text>
                  )}
                </View>
              </View>
            )}

            {!isBreak && !isOpen && !closed && !nextclosed && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  영업 종료{'\n'}
                  {starttime ? `${starttime} 시작` : ''}
                </Text>
                <Text
                  style={styles.overlayNameText}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {store.name}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {Array.isArray(store.categories) &&
                  store.categories.length > 0 ? (
                    store.categories.map((category, index) => (
                      <Text key={index} style={styles.overlayNameCategory}>
                        {translateCategory(category)}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.overlayNameCategory}>
                      카테고리 미설정
                    </Text>
                  )}
                </View>
              </View>
            )}

            {!isBreak && !isOpen && !closed && nextclosed && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  영업 종료{'\n'}
                  익일 휴무
                </Text>
                <Text
                  style={styles.overlayNameText}
                  numberOfLines={1}
                  ellipsizeMode="tail">
                  {store.name}
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  {Array.isArray(store.categories) &&
                  store.categories.length > 0 ? (
                    store.categories.map((category, index) => (
                      <Text key={index} style={styles.overlayNameCategory}>
                        {translateCategory(category)}
                      </Text>
                    ))
                  ) : (
                    <Text style={styles.overlayNameCategory}>
                      카테고리 미설정
                    </Text>
                  )}
                </View>
              </View>
            )}

            {isOpen && !isBreak && (
              <>
                {store?.isAlwaysOpen == true ? (
                  <Text style={styles.openOverlayText}>24시간 영업</Text>
                ) : (
                  <Text style={styles.openOverlayText}>
                    영업 종료 {endtime || '정보 없음'}
                  </Text>
                )}
                <View style={styles.openOverlay}>
                  <Text
                    style={styles.overlayNameOpenText}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {store.name}
                  </Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    {Array.isArray(store.categories) &&
                    store.categories.length > 0 ? (
                      store.categories.map((category, index) => (
                        <Text
                          key={index}
                          style={styles.overlayNameOpenCategory}>
                          {translateCategory(category)}
                        </Text>
                      ))
                    ) : (
                      <Text style={styles.overlayNameOpenCategory}>
                        카테고리 미설정
                      </Text>
                    )}
                  </View>
                  <Text
                    style={styles.overlayNameOpenDrink}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {store.mainDrinkDtos && store.mainDrinkDtos.length > 0
                      ? store.mainDrinkDtos
                          .map(drink => `#${translateAlcohol(drink.type)}`)
                          .join(' ')
                      : '메인주류 미설정'}
                  </Text>
                </View>
              </>
            )}
          </ImageBackground>
        </View>
      </Pressable>
      <View style={styles.distanceContainer}>
        <Text style={styles.distanceText}>
          {distance}
          {unit}
        </Text>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 180,
    height: 180,
    marginHorizontal: 10,
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.4,
    shadowRadius: 5,
    borderRadius: 15,
    elevation: 5, // Android 그림자 효과
  },
  backimageview: {
    width: 180,
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayNameText: {
    color: 'white',
    width: '95%',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    marginTop: 15,
  },
  overlayNameOpenText: {
    color: 'white',
    width: '95%',
    textAlign: 'center',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
  },
  overlayNameCategory: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Pretendard-Bold',
    marginHorizontal: 3,
    marginTop: 5,
    textAlign: 'center',
    alignItems: 'center',
  },
  overlayNameOpenCategory: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Pretendard-Bold',
    marginHorizontal: 3,
    marginTop: 5,
    textAlign: 'center',
    alignItems: 'center',
  },
  overlayNameOpenDrink: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    marginHorizontal: 3,
    marginTop: 5,
    textAlign: 'center',
    alignItems: 'center',
    width: '90%',
  },

  overlayText: {
    color: 'white',
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Pretendard-Bold',
    lineHeight: 18,
  },
  openOverlay: {
    position: 'absolute',
    height: '45%',
    bottom: 0, // 사진 안쪽 하단에 고정
    width: '100%', // 가로 전체 차지
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // ✅ 어두운 반투명 배경으로 가독성 향상
    paddingVertical: 5,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  openOverlayText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Pretendard-Bold',
    alignSelf: 'flex-end',
    marginTop: 7,
    marginRight: 5,
  },

  distanceText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    alignSelf: 'flex-end',
    marginRight: 15,
    marginTop: 7,
    marginBottom: 15,
  },
});

export default OpenStoreItem;
