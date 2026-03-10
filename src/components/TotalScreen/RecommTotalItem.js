import React, {useEffect, useState} from 'react';
import {PixelRatio, Pressable, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';
import useDistance from '../../hooks/useDistance';
import useStoreStatus from '../../hooks/useStoreStatus';
import CustomText from '../../utils/CustomText';

const fontScale = PixelRatio.getFontScale();

const toMenuPriceText = price => {
  if (price == null) return '';
  const text = String(price);

  if (/^\d+$/.test(text)) {
    return `${Number(text).toLocaleString('ko-KR')}원`;
  }

  return text;
};

const RecommTotalItem = ({store, navigation, location, drinkType}) => {
  const {token} = useAuth();
  const {showToast} = useToast();
  const calculateDistance = useDistance();
  const [distance, setDistance] = useState(null);
  const [unit, setUnit] = useState('km');

  const {isOpen, closed, nextclosed, starttime} = useStoreStatus(
    store?.operationInfoDtos,
    store?.isAlwaysOpen,
  );

  const handleStorePress = () => {
    if (!token) {
      showToast('로그인 후 이용할 수 있어요!', 'center');
      return;
    }

    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId: store.id},
    });
  };

  const mainMenu = store?.menuList?.[0];
  const selectedDrink = Array.isArray(store?.mainDrinkDtos)
    ? store.mainDrinkDtos.find(drink => drink?.type === drinkType)
    : null;
  const displayPrice = selectedDrink?.price ?? mainMenu?.price;

  useEffect(() => {
    const latitude = location?.latitude;
    const longitude = location?.longitude;
    const storeLatitude = store?.locationDto?.latitude;
    const storeLongitude = store?.locationDto?.longitude;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      typeof storeLatitude !== 'number' ||
      typeof storeLongitude !== 'number'
    ) {
      setDistance(null);
      setUnit('km');
      return;
    }

    let tempDistance = calculateDistance(
      latitude,
      longitude,
      storeLatitude,
      storeLongitude,
    );

    if (!Number.isFinite(tempDistance)) {
      setDistance(null);
      setUnit('km');
      return;
    }

    if (tempDistance < 1) {
      tempDistance *= 1000;
      setDistance(tempDistance.toFixed(0));
      setUnit('m');
      return;
    }

    setDistance(tempDistance.toFixed(2));
    setUnit('km');
  }, [
    calculateDistance,
    location?.latitude,
    location?.longitude,
    store?.locationDto?.latitude,
    store?.locationDto?.longitude,
  ]);

  const isStatusReady = store?.isAlwaysOpen || closed || starttime != null;

  const statusText = (() => {
    if (!isStatusReady) return '';
    if (store?.isAlwaysOpen) return '영업 중';
    if (closed) return '금일 휴무';
    if (!isOpen && nextclosed) return '영업 종료';
    if (!isOpen) return `영업 종료`;
    return '영업 중';
  })();

  const statusStyle =
    statusText === '영업 중' ? styles.openTag : styles.closeTag;
  return (
    <View style={styles.cardShadow}>
      <Pressable style={styles.card} onPress={handleStorePress}>
        <View style={styles.imageWrap}>
          <FastImage
            resizeMode={FastImage.resizeMode.cover}
            source={
              store?.mainImgUrl
                ? {uri: store.mainImgUrl}
                : require('../../assets/default_store6.png')
            }
            style={styles.image}
          />
          {store?.isCertified && (
            <FastImage
              source={require('../../assets/verifyMaker.png')}
              style={styles.verifyIcon}
              resizeMode={FastImage.resizeMode.contain}
            />
          )}
        </View>

        <View style={styles.infoBox}>
          <View style={styles.topRow}>
            <CustomText style={styles.storeName} numberOfLines={1}>
              {store?.name}
            </CustomText>
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.metaRow}>
              {!!statusText && (
                <>
                  <CustomText maxScale={1.1} style={statusStyle}>
                    {statusText}
                  </CustomText>
                  <View style={styles.sepDot} />
                </>
              )}

              <View style={styles.rateRow}>
                <FontAwesomeIcon
                  name="star"
                  size={fontScale >= 1.5 ? 18 : 12}
                  color="#FFB800"
                  style={styles.starIcon}
                />
                <CustomText maxScale={1.1} style={styles.rateText}>
                  {store?.storeRate ?? 0}
                </CustomText>
              </View>

              <View style={styles.sepDot} />
              <CustomText maxScale={1.1} style={styles.metaText}>
                리뷰 {store?.postCount ?? 0}
              </CustomText>

              {distance != null && (
                <>
                  <View style={styles.sepDot} />
                  <CustomText maxScale={1.1} style={styles.metaText}>
                    {`${distance}${unit}`}
                  </CustomText>
                </>
              )}
            </View>

            {displayPrice != null && (
              <View style={styles.priceBlock}>
                <CustomText maxScale={1.1} style={styles.priceValue}>
                  {toMenuPriceText(displayPrice)}
                </CustomText>
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#111',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },

  image: {
    width: '100%',
    height: 180,
  },
  imageWrap: {
    position: 'relative',
  },
  verifyIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    zIndex: 2,
  },

  infoBox: {
    backgroundColor: '#Fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },

  storeName: {
    fontSize: 16,
    fontFamily: 'Pretendard-ExtraBold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  metaText: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  openTag: {
    fontSize: 13,
    fontFamily: 'Pretendard-Bold',
    color: '#3CBFFF',
  },
  closeTag: {
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
    color: '#ccc',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 4,
  },
  rateText: {
    fontSize: 13,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },
  sepDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#ddd',
    marginHorizontal: 6,
  },
  priceBlock: {
    alignItems: 'flex-end',
  },
  priceValue: {
    fontSize: 18,
    color: '#3CBFFF',
    fontFamily: 'Pretendard-ExtraBold',
    letterSpacing: -0.7,
  },
});

export default RecommTotalItem;
