import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ImageBackground,
  Dimensions,
  PixelRatio,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../../hooks/useStoreStatus';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../context/ToastContext';
import FastImage from 'react-native-fast-image';
import {normalizeFont} from '../../../hooks/normalizeFont';
const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const IMG_WIDTH = width * 0.3;
const SPACING = width * 0.05;

const MapStoreItem = ({
  item,
  index,
  selectedStoreIndex,
  setSelectedStore,
  moveCenterMap,
  navigation,
  onItemPress,
}) => {
  const {
    isOpen,
    isBreak,
    closed,
    nextclosed,
    starttime,
    endtime,
    breakstart,
    breakend,
  } = useStoreStatus(item?.operationInfoDtos, item?.isAlwaysOpen);

  const {token} = useAuth();
  const {showToast} = useToast();

  const handlePress = () => {
    setSelectedStore(item);
    moveCenterMap(item.locationDto.latitude, item.locationDto.longitude, 1);

    // optional: additional behavior (e.g., open detail)
    if (typeof onItemPress === 'function') {
      try {
        onItemPress(item);
      } catch (e) {}
    }

    if (!token) {
      showToast('로그인 후 이용할 수 있어요!', 'center');
      return;
    }
    // navigation.navigate('StoreStack', {
    //   screen: 'StoreMainScreen',
    //   params: {
    //     storeId: item.id,
    //   },
    // });
  };

  const {translateCategory} = useCategoryTranslation();
  const {translateAlcohol} = useTranslateAlcohol();
  return (
    <Pressable
      style={[
        styles.storeInfo,
        index === selectedStoreIndex ? styles.selectedStore : null,
      ]}
      onPress={handlePress}>
      <View style={styles.backimageview}>
        <ImageBackground
          source={
            item.mainImgUrl
              ? {uri: item.mainImgUrl} // ✅ 네트워크 이미지
              : require('../../../assets/default_store.png') // ✅ 로컬 이미지
          }
          style={styles.backimage}
          imageStyle={styles.backimagestyle}>
          {/* ✅ 영업 종료 표시 */}
          {!isOpen && !nextclosed && !closed && (
            <View style={styles.overlay}>
              <Text style={styles.overlayText}>
                영업 종료{'\n'}
                {starttime ? `${starttime} 오픈` : ''}
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
                브레이크 타임{'\n'}
                {breakend ? `${breakend} 종료` : ''}
              </Text>
            </View>
          )}
        </ImageBackground>
      </View>
      <View style={styles.titletopview}>
        <View>
          <View style={styles.category}>
            {Array.isArray(item.categories) && item.categories.length > 0 ? (
              item.categories.map((category, index) => (
                <Text key={index} style={styles.StoreCategory}>
                  {translateCategory(category)}
                </Text>
              ))
            ) : (
              <Text style={styles.StoreCategory}>카테고리 미설정</Text>
            )}
          </View>
          <View style={styles.titleview}>
            {item.isCertified == true && (
              <FastImage
                source={require('../../../assets/verifyMaker.png')}
                style={styles.imageStyle}
              />
            )}
            <Text
              style={styles.storeName}
              numberOfLines={1} // 한 줄로 제한
              ellipsizeMode="tail">
              {item.name}
            </Text>
          </View>
        </View>
        <Text style={styles.menutext} numberOfLines={1} ellipsizeMode="tail">
          {item.mainDrinkDtos && item.mainDrinkDtos.length > 0
            ? item.mainDrinkDtos
                .map(drink => {
                  const priceText =
                    drink.price != null
                      ? `${drink.price.toLocaleString()}원`
                      : '';
                  return `${translateAlcohol(drink.type)} ${priceText}`;
                })
                .join('  ') // 아이템 간 간격 추가
            : '메인주류가 없습니다.'}
        </Text>
        <View style={styles.timeview}>
          {item?.isAlwaysOpen == true ? (
            <Text style={styles.timeviewtext}>24시간 영업</Text>
          ) : item?.isAlwaysOpen == false && closed ? (
            <Text style={styles.timeviewtext}>금일 휴무</Text>
          ) : (
            <Text style={styles.timeviewtext}>
              영업 종료 {endtime || '정보 없음'}
            </Text>
          )}
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <FontAwesomeIcon name="star" size={15} color="#FCC104" />
            <Text style={styles.storeAddress}>
              {item.storeRate} ({item.reviewCount})
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  storeInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  backimageview: {
    width: IMG_WIDTH,
    height: IMG_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12, // ✅ 부모 컨테이너 둥글게
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
    resizeMode: 'cover', // ✅ 이미지가 꽉 차도록
  },
  backimagestyle: {
    borderRadius: 12, // ✅ borderRadius 적용
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // ✅ 반투명 배경 추가
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: 'white',
    fontSize: normalizeFont(14, 1.5),
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 22,
  },

  titletopview: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  titleview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  imageStyle: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    marginRight: 4,
  },
  storeName: {
    fontSize: normalizeFont(18, 1.5),
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    width: '90%',
  },
  storeAddress: {
    fontSize: normalizeFont(14, 1.5),
    fontFamily: 'Pretendard-Medium',
    color: '#666',
    marginRight: 5,
  },
  category: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'center',
  },
  StoreCategory: {
    fontSize: normalizeFont(14, 1.5),
    color: '#999',
    marginRight: 5,
    fontFamily: 'Pretendard-Medium',
    marginTop: 2,
  },
  timeview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeviewtext: {
    fontSize: normalizeFont(13, 1.5),
    fontFamily: 'Pretendard-Medium',
    color: '#999',
  },
  menutext: {
    fontSize: normalizeFont(14, 1.5),
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF',
  },
});

export default React.memo(MapStoreItem);
