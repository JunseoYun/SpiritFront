import React, {useEffect, useMemo, useState} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import CustomText from '../../utils/CustomText';
import useDistance from '../../hooks/useDistance';
import useStoreStatus from '../../hooks/useStoreStatus';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import ColorUtil from '../../utils/ColorUtil';

const AIResultCard = ({store, navigation, userLocation, searchConditions}) => {
  const calculateDistance = useDistance();
  const {translateCategory} = useCategoryTranslation();
  const {translateAlcohol} = useTranslateAlcohol();
  const {isOpen, isBreak, closed, nextclosed, starttime, endtime, breakend} =
    useStoreStatus(store?.operationInfoDtos, store?.isAlwaysOpen);
  const [distanceText, setDistanceText] = useState(null);

  useEffect(() => {
    if (!userLocation) {
      return;
    }
    const storeLocation = store?.locationDto;
    if (!storeLocation) {
      return;
    }

    const km = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      storeLocation.latitude,
      storeLocation.longitude,
    );
    if (!Number.isFinite(km)) {
      return;
    }
    setDistanceText(
      km < 1 ? `${(km * 1000).toFixed(0)}m` : `${km.toFixed(1)}km`,
    );
  }, [userLocation, store, calculateDistance]);

  const categories = Array.isArray(store?.categories)
    ? store.categories.map(category => translateCategory(category))
    : [];
  const mainDrinks = Array.isArray(store?.mainDrinkDtos)
    ? store.mainDrinkDtos
    : [];
  const translatedDrinks = mainDrinks
    .map(drink => translateAlcohol(drink?.type))
    .filter(Boolean)
    .slice(0, 3);
  const storeId = store?.id;

  let timeLabel = '정보 없음';
  if (store?.isAlwaysOpen) {
    timeLabel = '24시간';
  } else if (isOpen && isBreak && breakend) {
    timeLabel = `브레이크 ~ ${breakend}`;
  } else if (isOpen && !isBreak && endtime) {
    timeLabel = `영업중 · ${endtime} 마감`;
  } else if (!isOpen && nextclosed) {
    timeLabel = '영업 종료 · 익일 휴무';
  } else if (!isOpen && closed) {
    timeLabel = '금일 휴무';
  } else if (!isOpen && starttime) {
    timeLabel = `${starttime} 오픈 예정`;
  } else if (endtime) {
    timeLabel = `${endtime} 종료`;
  }

  // Prefer a concise time display for the compact card.
  const displayTime =
    endtime && !store?.isAlwaysOpen ? `${endtime} 종료` : timeLabel;

  const conditionText = useMemo(() => {
    const drinkType = searchConditions?.drinkType;
    if (!drinkType) {
      return null;
    }
    const translated = translateAlcohol(drinkType);
    const matchedDrink = mainDrinks.find(
      drink => drink?.type && drink.type === drinkType,
    );
    const price = matchedDrink?.price;

    let priceText = '';
    if (price === '변동') {
      priceText = ' 변동';
    } else if (typeof price === 'number' && price > 0) {
      priceText = ` ${price.toLocaleString()}원`;
    } else if (typeof price === 'string' && price) {
      const numeric = Number(price);
      if (!Number.isNaN(numeric) && numeric > 0) {
        priceText = ` ${numeric.toLocaleString()}원`;
      }
    }

    const text = `${translated || ''}${priceText}`;
    return text.trim() || null;
  }, [searchConditions?.drinkType, mainDrinks, translateAlcohol]);

  const handlePress = () => {
    if (!storeId) {
      return;
    }
    const storeLocation = store?.locationDto;
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {
        storeId,
        innerlatitude: storeLocation?.latitude,
        innerlongitude: storeLocation?.longitude,
      },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={!storeId}
      style={styles.resultCard}>
      <View style={styles.imageWrap}>
        <FastImage
          source={
            store?.mainImgUrl
              ? {uri: store?.mainImgUrl}
              : require('../../assets/default_store6.png')
          }
          style={styles.resultImage}
          imageStyle={styles.resultImageRadius}
          resizeMode={FastImage.resizeMode.cover}>
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
          {isOpen && isBreak && (
            <View style={styles.overlay}>
              <CustomText style={styles.overlayText}>
                브레이크 타임{'\n'}
                {breakend ? `${breakend} 종료` : ''}
              </CustomText>
            </View>
          )}
        </FastImage>
        {conditionText && (
          <View style={styles.badge}>
            <CustomText style={styles.badgeText}>{conditionText}</CustomText>
          </View>
        )}
      </View>

      <View style={styles.cardBody}>
        <View style={styles.nameRow}>
          {store?.isCertified === true && (
            <FastImage
              source={require('../../assets/verifyMaker.png')}
              style={styles.certIcon}
            />
          )}
          <CustomText style={styles.resultName} numberOfLines={1}>
            {store?.name || '가게 이름'}
          </CustomText>
        </View>

        <CustomText style={styles.subtitle} numberOfLines={1}>
          {categories.slice(0, 3).join('  ') || '카테고리 미설정'}
        </CustomText>

        <View style={styles.footerRow}>
          <CustomText style={styles.metaText} numberOfLines={1}>
            {displayTime}
          </CustomText>

          <CustomText style={styles.metaText} numberOfLines={1}>
            {distanceText || '거리 정보 없음'}
          </CustomText>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  resultCard: {
    width: 160,
    marginRight: 12,
    borderRadius: 7,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  imageWrap: {
    width: 160,
    height: 160,
    borderRadius: 9,
    backgroundColor: '#fff',
    borderWidth: 0.5,
    borderColor: ColorUtil.border,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: '100%',
  },
  resultImageRadius: {
    borderRadius: 7,
  },
  cardBody: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    maxWidth: '100%',
  },
  certIcon: {
    width: 15,
    height: 15,
    marginRight: 3,
  },
  resultName: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
    flex: 1,
  },
  subtitle: {
    fontSize: 14,
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
    marginBottom: 8,
  },

  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 2,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
    maxWidth: '48%',
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  overlayText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
  },

  badge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    maxWidth: '90%',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Pretendard-Medium',
  },
});

export default AIResultCard;
