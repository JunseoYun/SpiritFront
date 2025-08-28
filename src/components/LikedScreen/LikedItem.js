import React, {memo} from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useStoreStatus from '../../hooks/useStoreStatus';
import FastImage from 'react-native-fast-image';

const windowWidth = Dimensions.get('window').width;
const H_MARGIN = 18;
const CARD_RADIUS = 16;
const imageWidth = windowWidth - H_MARGIN * 2;

const LikedItem = ({store, navigation}) => {
  const {translateCategory} = useCategoryTranslation();
  const {translateAlcohol} = useTranslateAlcohol();

  const {isOpen, isBreak, closed, nextclosed, starttime, endtime, breakend} =
    useStoreStatus(store?.operationInfoDtos, store?.isAlwaysOpen);

  const handlePress = () => {
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {
        storeId: store.id,
        innerlatitude: store?.locationDto?.latitude,
        innerlongitude: store?.locationDto?.longitude,
      },
    });
  };

  const rateText =
    typeof store?.storeRate === 'number'
      ? store.storeRate.toFixed(1)
      : Number(store?.storeRate ?? 0).toFixed(1);

  const reviewCountText = `(${Number(store?.reviewCount ?? 0).toLocaleString(
    'ko-KR',
  )})`;

  return (
    <Pressable
      onPress={handlePress}
      android_ripple={{color: 'rgba(0,0,0,0.08)'}}
      style={({pressed}) => [
        styles.card,
        pressed && {transform: [{scale: 0.98}]},
      ]}>
      {/* 이미지 영역 */}
      <View style={styles.imageWrap}>
        <FastImage
          source={
            store?.mainImgUrl
              ? {uri: store.mainImgUrl}
              : require('../../assets/default_store.png')
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

        {/* 상태 칩(우하단) */}
        {isOpen && isBreak ? (
          <View style={styles.chipBar} pointerEvents="none">
            <View style={[styles.chip, styles.chipWarn]}>
              <FontAwesomeIcon
                name="clock-o"
                size={12}
                style={styles.chipIcon}
              />
              <Text style={styles.chipText} numberOfLines={1}>
                브레이크 ~ {breakend || ''}
              </Text>
            </View>
          </View>
        ) : !isOpen ? (
          <View style={styles.chipBar} pointerEvents="none">
            <View style={[styles.chip, styles.chipWarn]}>
              <FontAwesomeIcon
                name="clock-o"
                size={12}
                style={styles.chipIcon}
              />
              <Text style={styles.chipText} numberOfLines={1}>
                {nextclosed
                  ? '영업종료 · 익일 휴무'
                  : closed
                  ? '금일 휴무'
                  : `영업종료 · ${starttime || ''} 오픈`}
              </Text>
            </View>
          </View>
        ) : null}

        {isOpen && !isBreak && (
          <View style={styles.chipBar} pointerEvents="none">
            <View style={[styles.chip, styles.chipWarn]}>
              <FontAwesomeIcon
                name="clock-o"
                size={12}
                style={styles.chipIcon}
              />
              <Text style={styles.chipText} numberOfLines={1}>
                영업중
              </Text>
            </View>
          </View>
        )}

        {/* 브레이크/미영업 시 딤 처리 */}
        {(isOpen && isBreak) || !isOpen ? (
          <View style={styles.dimOverlay} />
        ) : null}
      </View>

      {/* 정보 영역 */}
      <View style={styles.info}>
        {/* 카테고리 */}
        {!!store?.categories?.length && (
          <Text style={styles.category} numberOfLines={1}>
            {store.categories.map(c => translateCategory(c)).join(', ')}
          </Text>
        )}

        {/* 상단: 이름 + 평점/리뷰수 */}
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {store?.name || '가게 이름'}
          </Text>
          <Text style={styles.rate} numberOfLines={1}>
            <FontAwesomeIcon name="star" size={16} color="#FED348" /> {rateText}{' '}
            <Text style={styles.rateLight}>{reviewCountText}</Text>
          </Text>
        </View>

        {/* 영업시간(보조) */}
        {store?.isAlwaysOpen ? (
          <Text style={styles.timeText} numberOfLines={1}>
            24시간 영업
          </Text>
        ) : (
          <Text style={styles.timeText} numberOfLines={1}>
            {isOpen
              ? endtime
                ? `${endtime} 마감`
                : '영업중'
              : starttime && endtime
              ? `${starttime} ~ ${endtime}`
              : '영업 정보 없음'}
          </Text>
        )}

        {/* 메인 주류 배지 */}
        {!!store?.mainDrinkDtos?.length && (
          <View style={styles.mainDrinkView}>
            {store.mainDrinkDtos.slice(0, 3).map((drink, idx) => (
              <View key={idx} style={styles.drinkBadge}>
                <Text style={styles.drinkBadgeText}>
                  {translateAlcohol(drink.type)} {drink.price}
                </Text>
              </View>
            ))}
          </View>
        )}
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
    // Android
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

  // 딤
  dimOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    zIndex: 1,
  },

  // 인증 배지
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

  // 칩들
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
    includeFontPadding: false,
    maxWidth: imageWidth * 0.65,
  },

  // 정보
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
  rateLight: {
    color: '#6b7280',
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },

  timeText: {
    fontSize: 14,
    color: '#4b5563',
    fontFamily: 'Pretendard-Regular',
  },

  mainDrinkView: {
    flexDirection: 'row',
    marginTop: 12,
  },
  drinkBadge: {
    marginRight: 7,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 3,
  },
  drinkBadgeText: {
    color: '#121212',
    fontSize: 12,
    fontFamily: 'Pretendard-SemiBold',
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
});

// NearStoreTotalItem처럼 성능 위해 memo
export default memo(LikedItem);
