import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ImageBackground, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useDistance from '../../../hooks/useDistance';
import useStoreStatus from '../../../hooks/useStoreStatus';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../context/ToastContext';

const NearStoreItem = ({store, navigation, location}) => {
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

  const {translateCategory} = useCategoryTranslation();

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.storeInfoView}>
        {/* ✅ 가게 이미지 (영업 상태에 따라 안내 문구 추가) */}
        <View style={styles.backimageview}>
          <ImageBackground
            source={
              store.mainImgUrl
                ? {uri: store.mainImgUrl} // ✅ 네트워크 이미지
                : require('../../../assets/default_store.png') // ✅ 로컬 이미지
            }
            style={styles.backimage}
            imageStyle={styles.backimagestyle}>
            {/* ✅ 영업 종료 표시 */}
            {!isOpen && !nextclosed && !closed && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  영업 종료 {starttime ? `${starttime} 오픈` : ''}
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
                  브레이크 타임 {breakend ? `${breakend} 종료` : ''}
                </Text>
              </View>
            )}
          </ImageBackground>
        </View>

        {/* ✅ 가게 기본 정보 */}
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
          <Text
            style={styles.StoreCategory}
            numberOfLines={1} // 한 줄로 제한
            ellipsizeMode="tail">
            {store.categories && store.categories.length > 0
              ? store.categories
                  .map(category => translateCategory(category))
                  .join('  ')
              : '카테고리 미설정'}
          </Text>
        </View>

        {/* ✅ 영업 종료 시간 & 거리 표시 */}
        <View style={styles.storeViewInfo}>
          {store?.isAlwaysOpen == true ? (
            <Text style={styles.storeSubInfo}>24시간</Text>
          ) : store?.isAlwaysOpen == false && closed ? (
            <Text style={styles.storeSubInfo}>금일 휴무</Text>
          ) : (
            <Text style={styles.storeSubInfo}>
              {endtime || '정보 없음'} 종료
            </Text>
          )}

          <Text style={styles.storeSubInfo}>
            {distance} {unit}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  storeInfoView: {
    paddingHorizontal: 8,
  },
  backimageview: {
    width: 160,
    height: 160,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 7,
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
    marginTop: 3,
    paddingHorizontal: 1,
    maxWidth: 160,
  },
  storMainInfo: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#181A1A',
    width: '100%',
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

export default NearStoreItem;
