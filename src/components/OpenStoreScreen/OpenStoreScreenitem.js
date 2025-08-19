import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useDistance from '../../hooks/useDistance';
import useStoreStatus from '../../hooks/useStoreStatus';
import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';
import FastImage from 'react-native-fast-image';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth - 40;

const OpenStoreScreenitem = ({store, location, navigation}) => {
  const {translateAlcohol} = useTranslateAlcohol();
  const {translateCategory} = useCategoryTranslation();
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
      if (!location || !store?.locationDto) return;

      let tempDistance = calculateDistance(
        location.latitude,
        location.longitude,
        store.locationDto.latitude,
        store.locationDto.longitude,
      );
      if (tempDistance < 1) {
        tempDistance *= 1000;
        setDistance(tempDistance.toFixed(0));
        setUnit('m');
      } else {
        setDistance(tempDistance.toFixed(2));
        setUnit('km');
      }
    };
    fetchDistance();
  }, [store, location]);

  return (
    <Pressable
      onPress={handlePress}
      style={{paddingTop: 10, paddingBottom: 40, backgroundColor: '#fff'}}>
      {/* 이미지 + 술 배지 */}
      <ImageBackground
        source={
          store.mainImgUrl
            ? {uri: store.mainImgUrl}
            : require('../../assets/default_store.png')
        }
        style={{
          width: imageWidth,
          aspectRatio: 4 / 3,
          alignSelf: 'center',
        }}
        imageStyle={styles.backimagestyle}>
        <View style={styles.drinkBadgeContainer}>
          {store.mainDrinkDtos?.slice(0, 3).map((drink, index) => (
            <View key={index} style={styles.drinkBadge}>
              <Text style={styles.drinkBadgeText}>
                {translateAlcohol(drink.type)}
              </Text>
            </View>
          ))}
        </View>
        {isOpen && isBreak && (
          <View style={styles.overlay}>
            <Text style={styles.overlayText}>
              브레이크 타임 {breakend ? `${breakend} 종료` : ''}
            </Text>
          </View>
        )}
      </ImageBackground>

      {/* 정보 영역 */}
      <View style={styles.infoview}>
        {/* 상단: 이름 + 평점 */}
        <View style={styles.titleview}>
          <Text style={styles.titletext}>{store.name}</Text>
          <Text style={styles.ratetext}>5.0</Text>
        </View>

        {/* 카테고리 */}
        <Text style={styles.categorytext}>
          {store.categories?.map(cat => translateCategory(cat)).join(' · ')}
        </Text>

        {/* 영업시간 + 거리 */}
        <View style={styles.timeview}>
          {store?.isAlwaysOpen == true ? (
            <Text style={styles.timetext}>24시간 영업</Text>
          ) : (
            <Text style={styles.timetext}>
              영업 종료 {endtime || '정보 없음'}
            </Text>
          )}
          <Text style={styles.distancetext}>
            {distance} {unit}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  backimagestyle: {
    borderRadius: 15,
  },
  drinkBadgeContainer: {
    position: 'absolute',
    top: 8,
    left: 10,
    flexDirection: 'row',
    zIndex: 3,
  },
  drinkBadge: {
    borderWidth: 0.4,
    borderColor: '#666',
    backgroundColor: '#777',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
    marginRight: 10, // 배지 간 간격
  },
  drinkBadgeText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    zIndex: 2,
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Pretendard-Bold',
  },
  infoview: {paddingHorizontal: 20, marginTop: 10},
  titleview: {flexDirection: 'row', marginBottom: 4, alignItems: 'center'},
  titletext: {flex: 1, fontSize: 18, fontFamily: 'Pretendard-Bold'},
  ratetext: {textAlign: 'right', fontSize: 16, fontFamily: 'Pretendard-Medium'},
  categorytext: {
    marginBottom: 4,
    color: '#666',
    fontFamily: 'Pretendard-SemiBold',
  },
  timeview: {flexDirection: 'row'},
  timetext: {
    flex: 1,
    color: '#555',
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  distancetext: {
    textAlign: 'right',
    color: '#666',
    fontFamily: 'Pretendard-Regular',
  },
});

export default OpenStoreScreenitem;
