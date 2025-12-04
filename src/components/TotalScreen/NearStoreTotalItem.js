import React, {useState, useEffect, memo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';

import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useDistance from '../../hooks/useDistance';
import useStoreStatus from '../../hooks/useStoreStatus';
import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';
import FastImage from 'react-native-fast-image';
import CustomText from '../../utils/CustomText';

const windowWidth = Dimensions.get('window').width;
const H_MARGIN = 18;
const CARD_RADIUS = 16;
const imageWidth = windowWidth - H_MARGIN * 2;

const NearStoreTotalItem = ({store, location, navigation}) => {
  const {translateAlcohol} = useTranslateAlcohol();
  const {translateCategory} = useCategoryTranslation();
  const [distance, setDistance] = useState(''); // "320 m" or "1.24 km"
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
    if (!location || !store?.locationDto) return;
    let d = calculateDistance(
      location.latitude,
      location.longitude,
      store.locationDto.latitude,
      store.locationDto.longitude,
    );
    if (d < 1) {
      setDistance(`${(d * 1000).toFixed(0)} m`);
    } else {
      setDistance(`${d.toFixed(2)} km`);
    }
  }, [store, location]);

  const getStatus = () => {
    if (store?.isAlwaysOpen) return {text: '24시간 영업', bg: '#16a34a'};
    if (isOpen && isBreak)
      return {text: `브레이크 ~ ${breakend || ''}`, bg: '#f59e0b'};
    if (isOpen)
      return {
        text: endtime ? `영업중 · ${endtime} 마감` : '영업중',
        bg: '#16a34a',
      };
    return {
      text: starttime ? `영업종료 · ${starttime} 오픈` : '영업종료',
      bg: '#ef4444',
    };
  };
  const status = getStatus();

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{color: 'rgba(0,0,0,0.08)'}}
      style={({pressed}) => [
        styles.card,
        pressed && {transform: [{scale: 0.98}]},
      ]}>
      {/* 이미지 영역 (모서리 클리핑) */}
      <View style={styles.imageWrap}>
        <FastImage
          source={
            store?.mainImgUrl
              ? {uri: store.mainImgUrl}
              : require('../../assets/default_store2.png')
          }
          style={styles.image}
          resizeMode={FastImage.resizeMode.cover}
        />

        {/* 인증 배지 (우상단) */}
        {store?.isCertified && (
          <View style={styles.verifyBadge} pointerEvents="none">
            <FastImage
              source={require('../../assets/verifyMaker.png')}
              style={styles.verifyIcon}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        )}

        {/* 우하단: 상태 배지 */}
        {isOpen && isBreak ? (
          <View style={styles.chipBar} pointerEvents="none">
            {!!distance && (
              <View style={[styles.chip, styles.chipDark]}>
                <FontAwesomeIcon
                  name="map-marker"
                  size={12}
                  style={styles.chipIcon}
                />
                <CustomText style={styles.chipText} numberOfLines={1}>
                  {distance}
                </CustomText>
              </View>
            )}
            {isOpen && isBreak && (
              <View style={[styles.chip, styles.chipWarn]}>
                <FontAwesomeIcon
                  name="clock-o"
                  size={12}
                  style={styles.chipIcon}
                />
                <CustomText style={styles.chipText} numberOfLines={1}>
                  브레이크 ~ {breakend || ''}
                </CustomText>
              </View>
            )}
          </View>
        ) : (
          !!distance && (
            <View style={styles.statusChip}>
              <FontAwesomeIcon
                name="map-marker"
                size={12}
                style={styles.chipIcon}
              />
              <CustomText style={styles.statusChipText}>{distance}</CustomText>
            </View>
          )
        )}

        {!isOpen && (
          <View style={styles.chipBar} pointerEvents="none">
            {!!distance && (
              <View style={[styles.chip, styles.chipDark]}>
                <FontAwesomeIcon
                  name="map-marker"
                  size={12}
                  style={styles.chipIcon}
                />
                <CustomText style={styles.chipText} numberOfLines={1}>
                  {distance}
                </CustomText>
              </View>
            )}

            <View style={[styles.chip, styles.chipWarn]}>
              <FontAwesomeIcon
                name="clock-o"
                size={12}
                style={styles.chipIcon}
              />
              <CustomText style={styles.chipText} numberOfLines={1}>
                영업종료 · {starttime} 오픈
              </CustomText>
            </View>
          </View>
        )}

        {/* 브레이크 타임일 때 살짝 어둡게 */}
        {isOpen && isBreak && <View style={styles.dimOverlay} />}
        {!isOpen && <View style={styles.dimOverlay} />}
      </View>

      {/* 정보 영역 */}
      <View style={styles.info}>
        {/* 카테고리 */}
        {!!store?.categories?.length && (
          <CustomText style={styles.category} numberOfLines={1}>
            {store.categories.map(c => translateCategory(c)).join(', ')}
          </CustomText>
        )}
        {/* 상단: 이름 + 평점 */}
        <View style={styles.titleRow}>
          <CustomText style={styles.title} numberOfLines={1}>
            {store?.name || '가게 이름'}
          </CustomText>
          <CustomText style={styles.rate} numberOfLines={1}>
            <FontAwesomeIcon name="star" size={16} color="#FED348" />{' '}
            {typeof store?.storeRate === 'number'
              ? store.storeRate.toFixed(1)
              : '0'}
          </CustomText>
        </View>

        {/* 영업시간 간단 표기(24시간은 위 배지로 대체, 여기엔 보조 정보) */}
        {store?.isAlwaysOpen ? (
          <CustomText style={styles.timeText} numberOfLines={1}>
            24시간 영업
          </CustomText>
        ) : (
          <CustomText style={styles.timeText} numberOfLines={1}>
            {isOpen && endtime && `${endtime} 마감`}
            {!isOpen && starttime && `${starttime} ~ ${endtime}`}
          </CustomText>
        )}

        <View style={styles.mainDrinkView}>
          {store?.mainDrinkDtos?.slice(0, 3)?.map((drink, idx, arr) => {
            const isLast = idx === arr.length - 1;

            return (
              <View
                key={idx}
                style={[
                  styles.drinkBadge,
                  isLast ? {flexShrink: 1} : {}, // 마지막만 줄어들게
                ]}>
                <CustomText
                  style={styles.drinkBadgeText}
                  {...(isLast
                    ? {numberOfLines: 1, ellipsizeMode: 'tail'}
                    : {})}>
                  {translateAlcohol(drink.type)} {drink.price}
                </CustomText>
              </View>
            );
          })}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: H_MARGIN,
    marginTop: 20,
    marginBottom: 5,
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    // Android shadow
    elevation: 2,
  },
  imageWrap: {
    width: imageWidth,
    aspectRatio: 8 / 5,
    alignSelf: 'center',
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f2f2f2',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  verifyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 3,
    padding: 4,
    borderRadius: 30,
  },
  verifyIcon: {
    width: 24,
    height: 24,
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    marginLeft: 8,
  },
  chipDark: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  chipWarn: {
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  chipIcon: {
    marginRight: 6,
    color: '#fff',
  },
  chipText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Pretendard-SemiBold',
    maxWidth: imageWidth * 0.6, // 길 때 말줄임
    includeFontPadding: false,
  },
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 1, // 칩(3)보다 뒤에 오도록
  },

  statusChip: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    zIndex: 3,
    backgroundColor: 'rgba(0,0,0,0.4)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusChipText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Pretendard-SemiBold',
    maxWidth: imageWidth * 0.65,
  },
  info: {
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  category: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 6,
    fontFamily: 'Pretendard-SemiBold',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#111827',
  },
  rate: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#111827',
  },
  star: {
    color: '#f59e0b',
  },
  mainDrinkView: {
    flexDirection: 'row',
    marginTop: 12,
  },
  drinkBadge: {
    marginRight: 7,
    backgroundColor: 'rgba(0,0,0,0.05)', // 필요 없으면 제거
    borderRadius: 3,
  },
  drinkBadgeText: {
    color: '#121212',
    fontSize: 12,
    fontFamily: 'Pretendard-SemiBold',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },

  timeText: {
    fontSize: 14,
    color: '#4b5563',
    fontFamily: 'Pretendard-Regular',
  },
});

export default memo(NearStoreTotalItem);
