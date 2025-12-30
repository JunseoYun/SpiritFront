import React, {memo} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import LinearGradient from 'react-native-linear-gradient';
import FastImage from 'react-native-fast-image';
import CustomText from '../../utils/CustomText';
import useStoreStatus from '../../hooks/useStoreStatus';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import ColorUtil from '../../utils/ColorUtil';

const LikedGridItem = ({store, width, onPress, style}) => {
  const {translateCategory} = useCategoryTranslation();
  const {translateAlcohol} = useTranslateAlcohol();
  const {isOpen, isBreak, closed, nextclosed, starttime, breakend} =
    useStoreStatus(store?.operationInfoDtos, store?.isAlwaysOpen);

  const handlePress = () => onPress?.(store);
  const imageSource = store?.mainImgUrl
    ? {uri: store.mainImgUrl}
    : require('../../assets/default_store6.png');
  const rateValue =
    typeof store?.storeRate === 'number'
      ? store.storeRate
      : Number(store?.storeRate ?? 0);
  const rateText = Number.isFinite(rateValue) ? rateValue.toFixed(1) : '0.0';
  const categoriesText = (store?.categories || [])
    .map(category => translateCategory(category) || category)
    .filter(Boolean)
    .join(' · ');
  const mainDrinkText = (store?.mainDrinkDtos || [])
    .slice(0, 3)
    .map(drink => {
      if (!drink) return '';
      if (typeof drink === 'string') {
        return translateAlcohol(drink) || drink;
      }
      const type = drink?.type || drink?.name;
      const label = translateAlcohol(type) || type || '';
      const price =
        drink?.price !== null &&
        drink?.price !== undefined &&
        drink?.price !== ''
          ? ` ${Number(drink.price).toLocaleString('ko-KR')}원`
          : '';
      return `${label}`.trim();
    })
    .filter(Boolean)
    .join(' · ');
  const imageHeight = Math.round(width * 0.68);

  const renderStatusChip = () => {
    if (isOpen && isBreak) {
      return (
        <View style={styles.chipBar} pointerEvents="none">
          <View style={[styles.chip, styles.chipWarn]}>
            <FontAwesomeIcon name="clock-o" size={11} style={styles.chipIcon} />
            <CustomText style={styles.chipText} numberOfLines={1}>
              브레이크 ~ {breakend || ''}
            </CustomText>
          </View>
        </View>
      );
    }

    if (!isOpen) {
      return (
        <View style={styles.chipBar} pointerEvents="none">
          <View style={[styles.chip, styles.chipWarn]}>
            <FontAwesomeIcon name="clock-o" size={11} style={styles.chipIcon} />
            <CustomText style={styles.chipText} numberOfLines={1}>
              {nextclosed
                ? '영업종료 · 익일 휴무'
                : closed
                ? '금일 휴무'
                : `영업종료 · ${starttime || ''} 오픈`}
            </CustomText>
          </View>
        </View>
      );
    }

    if (isOpen && !isBreak) {
      return (
        <View style={styles.chipBar} pointerEvents="none">
          <View style={[styles.chip, styles.chipWarn]}>
            <FontAwesomeIcon name="clock-o" size={11} style={styles.chipIcon} />
            <CustomText style={styles.chipText} numberOfLines={1}>
              영업중
            </CustomText>
          </View>
        </View>
      );
    }

    return null;
  };

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{color: 'rgba(0,0,0,0.06)'}}
      style={({pressed}) => [
        styles.container,
        {width},
        pressed && styles.cardPressed,
        style,
      ]}>
      <View style={[styles.imageWrap, {height: imageHeight}]}>
        <FastImage
          source={imageSource}
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />
        <LinearGradient
          colors={['rgba(0,0,0,0.35)', 'transparent']}
          style={styles.topGradient}
          pointerEvents="none"
        />
        <View style={styles.reviewRow} pointerEvents="none">
          <CustomText style={styles.reviewText} numberOfLines={1}>
            <FontAwesomeIcon name="star" size={12} color="#FED348" /> {rateText}
          </CustomText>
        </View>
        {renderStatusChip()}
        {(isOpen && isBreak) || !isOpen ? <View style={styles.dim} /> : null}
      </View>
      <View style={styles.info}>
        <CustomText style={styles.title} numberOfLines={1}>
          {store?.name || ''}
        </CustomText>
        {Boolean(categoriesText) && (
          <CustomText style={styles.category} numberOfLines={1}>
            {categoriesText}
          </CustomText>
        )}
        {Boolean(mainDrinkText) && (
          <CustomText
            style={styles.drinks}
            numberOfLines={2}
            ellipsizeMode="tail">
            {mainDrinkText}
          </CustomText>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  cardPressed: {
    opacity: 0.92,
  },
  imageWrap: {
    width: '100%',

    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    position: 'relative',
    borderWidth: 0.5,
    borderColor: ColorUtil.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  reviewRow: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 3,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
    zIndex: 2,
  },
  reviewText: {
    fontSize: 11,
    color: '#fff',
    fontFamily: 'Pretendard-SemiBold',
  },
  chipBar: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    zIndex: 3,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    marginLeft: 6,
  },
  chipWarn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  chipIcon: {
    marginRight: 5,
    color: '#fff',
  },
  chipText: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'Pretendard-SemiBold',
    includeFontPadding: false,
    maxWidth: 140,
  },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.22)',
    zIndex: 1,
  },
  info: {
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 2,
  },
  title: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Pretendard-SemiBold',
  },
  category: {
    marginTop: 4,
    fontSize: 12,
    color: '#6b7280',
    fontFamily: 'Pretendard-Regular',
  },
  drinks: {
    marginTop: 4,
    fontSize: 12,
    color: '#374151',
    fontFamily: 'Pretendard-Medium',
  },
});

export default memo(LikedGridItem);
