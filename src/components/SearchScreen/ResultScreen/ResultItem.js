import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ImageBackground, StyleSheet} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useStoreStatus from '../../../hooks/useStoreStatus';
import useDistance from '../../../hooks/useDistance';

const ResultItem = ({store, navigation, location}) => {
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
    <Pressable
      key={store.id}
      onPress={() => {
        navigation.navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {
            storeId: store.id,
            innerlatitude: store.locationDto.latitude,
            innerlongitude: store.locationDto.longitude,
          },
        });
      }}>
      <View style={styles.StoreInfo}>
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
        <View style={styles.StoreTextView}>
          <View style={styles.StoreTitleView}>
            <Text
              style={styles.StoreTitle}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.name}
            </Text>
            <View style={styles.StoreScore}>
              <FontAwesomeIcon name="star" size={15} color="#FCC104" />
              <Text style={styles.Scoretext}>
                {' '}
                {store.storeRate}
                {' ('}
                {store.reviewCount}
                {')'}
              </Text>
            </View>
          </View>

          <View style={styles.StoreCategoryList}>
            {store.categories.slice(0, 3).map((category, index) => (
              <Text key={index} style={styles.StoreCategory}>
                {translateCategory(category)}
              </Text>
            ))}
          </View>
          <Text style={styles.StoreAddressText}>
            {store.locationDto.address}, {store.locationDto.addressDetail}
          </Text>
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

      <View style={styles.horizontalDivider} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  StoreInfo: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignSelf: 'center',
    paddingHorizontal: 18,
  },
  backimage: {
    width: 120,
    height: 120,
    borderRadius: 10,
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
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 22,
  },
  StoreTextView: {
    marginLeft: 10,
    justifyContent: 'space-between',
    marginVertical: 3,
    flex: 1,
  },
  StoreTitleView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 5,
  },
  StoreTitle: {
    fontWeight: 'bold',
    fontSize: 17,
    color: '#333',
    maxWidth: 150,
  },
  StoreScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  Scoretext: {
    marginLeft: 3,
    fontSize: 15,
    color: '#333',
  },
  StoreCategoryList: {
    flexDirection: 'row',
    marginRight: 5,
    alignItems: 'center',
  },

  StoreAddressText: {
    color: '#999',
    fontSize: 14,
    fontWeight: 600,
  },
  StoreCategory: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
    marginRight: 5,
  },
  subView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  StoreClose: {
    fontSize: 13,
    color: '#333',
    marginRight: 5,
    fontWeight: '500',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 10,
    width: '100%',
    alignSelf: 'center',
  },
});

export default ResultItem;
