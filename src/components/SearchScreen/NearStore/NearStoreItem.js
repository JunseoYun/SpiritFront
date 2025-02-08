import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ImageBackground, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useDistance from '../../../hooks/useDistance';
import useStoreStatus from '../../../hooks/useStoreStatus';

const NearStoreItem = ({store, navigation, location}) => {
  const [distance, setDistance] = useState(0);
  const [unit, setUnit] = useState('m');
  const calculateDistance = useDistance();
  const isStoreOpen = useStoreStatus(
    store?.businessHoursDto?.openTime,
    store?.businessHoursDto?.closeTime,
    store?.closedDays,
  );
  const isStoreBreak =
    store?.businessHoursDto?.breakStartTime &&
    store?.businessHoursDto?.breakEndTime
      ? useStoreStatus(
          store.businessHoursDto.breakStartTime,
          store.businessHoursDto.breakEndTime,
        )
      : null;

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
      }>
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
            {!isStoreOpen && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  영업 종료{' '}
                  {store.businessHoursDto?.openTime
                    ? `${store.businessHoursDto.openTime.slice(0, 5)} 오픈`
                    : ''}
                </Text>
              </View>
            )}
            {/* ✅ 브레이크 타임 표시 */}
            {isStoreOpen && isStoreBreak && (
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>
                  브레이크 타임{' '}
                  {store.businessHoursDto?.breakEndTime
                    ? `${store.businessHoursDto.breakEndTime.slice(0, 5)} 종료`
                    : ''}
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
          <View style={styles.storeViewInfo}>
            <FontAwesomeIcon name="star" size={15} color="#FCC104" />
            <Text style={styles.storRate}> {store.storeRate}</Text>
          </View>
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

        {/* ✅ 영업 종료 시간 & 거리 표시 */}
        <View style={styles.storeViewInfo}>
          <Text style={styles.storeSubInfo}>
            영업 종료{' '}
            {store.businessHoursDto?.closeTime?.slice(0, 5) || '정보 없음'}
          </Text>
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
    paddingLeft: 18,
  },
  backimageview: {
    width: 170,
    height: 120,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
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
    borderRadius: 12,
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
    fontWeight: 'bold',
  },
  storeViewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
    marginBottom: 2,
    marginLeft: 3,
    marginRight: 3,
    paddingHorizontal: 1,
  },
  storMainInfo: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    width: 110,
  },
  storRate: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FCC104',
  },
  storRateInfo: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#999',
  },

  StoreCategory: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
  storeSubInfo: {
    fontSize: 14,
    color: '#999',
    fontWeight: '500',
  },
});

export default NearStoreItem;
