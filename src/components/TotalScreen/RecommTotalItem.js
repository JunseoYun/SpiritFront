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

const RecommTotalItem = ({store, navigation, location}) => {
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

  const statusColor = statusText === '영업 중' ? '#3CBFFF' : '#6B7280';
  return (
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

          {mainMenu && (
            <CustomText style={styles.menuName} numberOfLines={1}>
              1병
            </CustomText>
          )}
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <CustomText style={[styles.metaText, {color: statusColor}]}>
              {statusText}
            </CustomText>

            <FontAwesomeIcon
              name="star"
              size={fontScale >= 1.5 ? 20 : 14}
              color="#FED348"
              style={{marginLeft: 6, marginRight: 4}}
            />

            <CustomText style={styles.metaText}>
              {store?.storeRate ?? 0}
            </CustomText>

            <CustomText style={styles.metaText}>
              {' '}
              · 리뷰 {store?.postCount ?? 0}
            </CustomText>

            {distance != null && (
              <CustomText style={styles.metaText}>
                {' '}
                · {`${distance}${unit}`}
              </CustomText>
            )}
          </View>

          {mainMenu && (
            <CustomText style={styles.price}>
              {toMenuPriceText(mainMenu.price)}
            </CustomText>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
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
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#111',
    flex: 1,
    marginRight: 10,
  },

  menuName: {
    fontSize: 13,
    color: '#9CA3AF',
    fontFamily: 'Pretendard-Medium',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  metaText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Pretendard-SemiBold',
  },

  price: {
    fontSize: 20,
    color: '#3cbbff',
    fontFamily: 'Pretendard-Bold',
  },
});

export default RecommTotalItem;
