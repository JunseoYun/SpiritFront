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
import FastImage from 'react-native-fast-image';
const ResultModalItem = ({store, navigation, location}) => {
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
          <View style={styles.fastSearchStoreView}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
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
          <View style={styles.fastStoreCategoryList}>
            <Text style={styles.fastStoreCategory} ellipsizeMode="tail">
              {Array.isArray(store.categories) && store.categories.length > 0
                ? store.categories
                    .map(category => translateCategory(category))
                    .join(' ')
                : '카테고리 미설정'}
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
    marginVertical: 10,
    marginHorizontal: 18,
    padding: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    alignSelf: 'flex-start',
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
    fontWeight: 'bold',
    fontSize: 17,
    color: 'black',
    maxWidth: '85%',
  },
  fastStorescore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fastScoretext: {
    marginLeft: 3,
    fontSize: 15,
    color: 'black',
  },
  fastStoreCategoryList: {
    flexDirection: 'row',
    marginRight: 5,
  },
  fastStoreCategory: {
    fontWeight: 'bold',
    fontSize: 14,
    color: 'black',
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
  imageStyle: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    marginRight: 3,
  },
});

export default ResultModalItem;
