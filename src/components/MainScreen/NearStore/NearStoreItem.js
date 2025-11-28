import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, StyleSheet, PixelRatio} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useDistance from '../../../hooks/useDistance';
import useStoreStatus from '../../../hooks/useStoreStatus';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../context/ToastContext';
import FastImage from 'react-native-fast-image';
import CustomText from '../../../utils/CustomText';
import ColorUtil from '../../../utils/ColorUtil';

let fontScale = PixelRatio.getFontScale();

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
          <FastImage
            resizeMode={FastImage.resizeMode.cover}
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
                <CustomText style={styles.overlayText}>
                  영업 종료{'\n'}
                  {starttime ? `${starttime} 오픈` : ''}
                </CustomText>
              </View>
            )}
            {!isOpen && nextclosed && !closed && (
              <View style={styles.overlay}>
                <CustomText style={styles.overlayText}>
                  영업 종료{'\n'}익일 휴무
                </CustomText>
              </View>
            )}
            {!isOpen && !nextclosed && closed && (
              <View style={styles.overlay}>
                <CustomText style={styles.overlayText}>금일 휴무</CustomText>
              </View>
            )}
            {/* ✅ 브레이크 타임 표시 */}
            {isOpen && isBreak && (
              <View style={styles.overlay}>
                <CustomText style={styles.overlayText}>
                  브레이크 타임{'\n'}
                  {breakend ? `${breakend} 종료` : ''}
                </CustomText>
              </View>
            )}
          </FastImage>
        </View>

        {/* ✅ 가게 기본 정보 */}
        <View style={styles.storeViewInfo}>
          {store.isCertified == true && (
            <FastImage
              source={require('../../../assets/verifyMaker.png')}
              style={styles.imageStyle}
            />
          )}
          <CustomText
            style={styles.storMainInfo}
            numberOfLines={1} // 한 줄로 제한
            ellipsizeMode="tail">
            {store.name}
          </CustomText>
        </View>

        {/* ✅ 가게 카테고리 */}
        <View style={styles.storeViewInfo}>
          <CustomText
            style={styles.StoreCategory}
            numberOfLines={1} // 한 줄로 제한
            ellipsizeMode="tail">
            {store.categories && store.categories.length > 0
              ? store.categories
                  .map(category => translateCategory(category))
                  .join('  ')
              : '카테고리 미설정'}
          </CustomText>
        </View>

        {/* ✅ 영업 종료 시간 & 거리 표시 */}
        <View
          style={[
            styles.storeViewInfo,
            fontScale > 1.5 && {
              flexDirection: 'column',
              alignItems: 'flex-start',
            },
          ]}>
          {store?.isAlwaysOpen == true ? (
            <CustomText style={styles.storeSubInfo}>24시간</CustomText>
          ) : store?.isAlwaysOpen == false && closed ? (
            <CustomText style={styles.storeSubInfo}>금일 휴무</CustomText>
          ) : (
            <CustomText style={styles.storeSubInfo}>
              {endtime || '정보 없음'} 종료
            </CustomText>
          )}

          <CustomText style={styles.storeSubInfo}>
            {distance}
            {unit}
          </CustomText>
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
    borderWidth: 0.5,
    borderColor: ColorUtil.border,

    borderRadius: 7,
    overflow: 'hidden', // ✅ overlay가 이미지 밖으로 나가지 않도록 처리
  },
  backimage: {
    width: '100%',
    height: '100%',
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
    textAlign: 'center',
  },
  storeViewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 2,
    maxWidth: 160,
  },
  storMainInfo: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },

  StoreCategory: {
    fontSize: 14,
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
  },
  storeSubInfo: {
    fontSize: 14,
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
  },
  imageStyle: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    marginRight: 3,
  },
});

export default NearStoreItem;
