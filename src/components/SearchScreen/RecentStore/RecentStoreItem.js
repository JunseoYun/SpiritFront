import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ImageBackground, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useDistance from '../../../hooks/useDistance';
import useStoreStatus from '../../../hooks/useStoreStatus';
import FastImage from 'react-native-fast-image';

const RecentStoreItem = ({store, navigation, location}) => {
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
      style={styles.recentView}>
      {/* 이미지 */}
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
        </FastImage>
      </View>
      {/* 매장 정보 */}
      <View style={styles.infoContainer}>
        <View style={styles.headerView}>
          {store.isCertified == true && (
            <FastImage
              source={require('../../../assets/verifyMaker.png')}
              style={styles.imageStyle}
            />
          )}
          <Text
            style={styles.storeName}
            numberOfLines={1} // 한 줄로 제한
            ellipsizeMode="tail">
            {store.name}
          </Text>
        </View>
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
          {store?.isAlwaysOpen == true ? (
            <Text style={styles.store24TimeInfo}>24시간 영업</Text>
          ) : store?.isAlwaysOpen == false && closed ? (
            <Text style={styles.storeTimeInfo}>금일 휴무</Text>
          ) : (
            <Text style={styles.storeTimeInfo}>
              영업 종료 {endtime || '정보 없음'}
            </Text>
          )}
          <Text style={styles.storeSubInfo}>
            {distance}
            {unit}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  recentView: {
    width: 170,
    marginHorizontal: 7,
    marginBottom: 20,
  },
  backimageview: {
    width: 170,
    height: 120,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 10, // ✅ 부모 컨테이너 둥글게
    overflow: 'hidden', // ✅ 넘치는 부분 숨기기
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  backimage: {
    width: '100%',
    height: '100%',
  },
  backimagestyle: {
    borderRadius: 15, // ✅ borderRadius 적용
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    lineHeight: 22,
  },

  infoContainer: {
    marginTop: 8,
    paddingHorizontal: 2,
  },
  headerView: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  storeName: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#121212',
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  storeViewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  StoreCategory: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Pretendard-Medium',
  },
  storeTimeInfo: {
    marginTop: 5,
    fontSize: 13,
    color: '#4b5563',
    fontFamily: 'Pretendard-Medium',
  },
  store24TimeInfo: {
    marginTop: 5,
    fontSize: 13,
    color: '#28a745',
    fontFamily: 'Pretendard-Medium',
  },
  storeSubInfo: {
    marginTop: 5,
    fontSize: 13,
    color: '#4b5563',
    fontFamily: 'Pretendard-Medium',
  },
  imageStyle: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    marginRight: 3,
  },
});

export default RecentStoreItem;
