import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ColorUtil from '../../../utils/ColorUtil';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useStoreStatus from '../../../hooks/useStoreStatus';
import {normalizeFont} from '../../../hooks/normalizeFont';

const {width} = Dimensions.get('window');
const H_PADDING = 16;
const CONTENT_WIDTH = width - H_PADDING * 2;

const alcoholLabel = t =>
  ({
    SOJU: '소주',
    BEER: '맥주',
    MAKGEOLLI: '막걸리',
    TRADITIONAL: '전통주',
    HIGHBALL: '하이볼',
    WINE: '와인',
    COCKTAIL: '칵테일',
    SAKE: '사케',
    KAOLIANG: '고량주',
    WHISKEY: '위스키',
    VODKA: '보드카',
    TEQUILA: '데킬라',
  }[t] ||
  t ||
  '주류');

const MapDetailItem = ({item, moveCenterMap, onItemPress, navigation}) => {
  const {isOpen, closed, nextclosed, isBreak, starttime, endtime, breakend} =
    useStoreStatus(item?.operationInfoDtos, item?.isAlwaysOpen);
  const {translateCategory} = useCategoryTranslation();

  // Status color + text
  const {statusText, statusColor} = useMemo(() => {
    if (item?.isAlwaysOpen)
      return {statusText: '영업 중 - 연중무휴', statusColor: '#38BDF8'};
    if (closed) return {statusText: '금일 휴무', statusColor: '#F05650'};
    if (!isOpen && nextclosed)
      return {statusText: '영업 종료 · 내일 휴무', statusColor: '#F05650'};
    if (!isOpen)
      return {
        statusText: `영업 종료 · ${starttime} 오픈`,
        statusColor: '#A3A3A3',
      };
    if (isOpen && isBreak)
      return {
        statusText: `브레이크 타임 · ${breakend} 종료`,
        statusColor: '#F05650',
      };
    return {statusText: `영업중 · ${endtime} 종료`, statusColor: '#34D399'};
  }, [
    item?.isAlwaysOpen,
    closed,
    isOpen,
    nextclosed,
    starttime,
    endtime,
    breakend,
  ]);

  const categoriesText =
    item?.categories?.map(c => translateCategory(c)).join(', ') ||
    '카테고리 미설정';

  // Image mosaic sizes
  const leftW = Math.round(CONTENT_WIDTH * 0.66) - 6;
  const rightW = CONTENT_WIDTH - leftW - 6;
  const leftH = 168;
  const rightH = Math.floor((leftH - 6) / 2);
  const imgSrc = item?.mainImgUrl
    ? {uri: item.mainImgUrl}
    : require('../../../assets/default_store.png');

  return (
    <Pressable
      style={[styles.wrap, {paddingHorizontal: 16}]}
      onPress={() => {
        navigation.navigate('StoreStack', {
          screen: 'StoreMainScreen',
          params: {
            storeId: item.id,
          },
        });
      }}>
      {/* section: header */}
      <View style={styles.section}>
        <View style={styles.headerRow}>
          <Text style={styles.storeName} numberOfLines={1}>
            {item?.name}
          </Text>
          <View style={styles.ratingRow}>
            <FontAwesomeIcon name="star" size={14} color="#FFB400" />
            <Text style={styles.ratingText}>
              {item?.storeRate} ({item?.reviewCount})
            </Text>
          </View>
        </View>
        <Text style={styles.categories} numberOfLines={1}>
          {categoriesText}
        </Text>
        <View style={styles.timeRow}>
          {isOpen && !isBreak && item?.isAlwaysOpen === false && (
            <>
              <Text style={[styles.timeNow, {color: 'green'}]}>영업 중</Text>
              <Text style={styles.timeText}>
                영업 종료 - {endtime || '정보 없음'}
              </Text>
            </>
          )}
          {!isOpen &&
            !isBreak &&
            item?.isAlwaysOpen === false &&
            !closed &&
            !nextclosed && (
              <>
                <Text style={[styles.timeNow, {color: '#F05650'}]}>
                  영업 종료
                </Text>
                <Text style={styles.timeText}>
                  영업 시작 - {starttime || '정보 없음'}
                </Text>
              </>
            )}
          {!isOpen &&
            !isBreak &&
            item?.isAlwaysOpen === false &&
            !closed &&
            nextclosed && (
              <>
                <Text style={[styles.timeNow, {color: '#F05650'}]}>
                  영업 종료
                </Text>
                <Text style={styles.timeText}>내일 휴무</Text>
              </>
            )}
          {isOpen && isBreak && item?.isAlwaysOpen === false && (
            <>
              <Text style={[styles.timeNow, {color: '#F05650'}]}>
                브레이크 타임
              </Text>
              <Text style={styles.timeText}>
                영업 시작 - {breakend || '정보 없음'}
              </Text>
            </>
          )}
          {closed && !isOpen && !isBreak && item?.isAlwaysOpen === false && (
            <>
              <Text style={[styles.timeNow, {color: '#F05650'}]}>
                금일 휴무
              </Text>
            </>
          )}
          {item?.isAlwaysOpen === true && (
            <>
              <Text style={[styles.timeNow, {color: 'green'}]}>영업 중</Text>
              <Text style={styles.timeText}>- 연중무휴</Text>
            </>
          )}
        </View>
      </View>

      {/* section: address */}
      <View style={styles.section}>
        <Text style={styles.address} numberOfLines={1}>
          <FontAwesomeIcon name="map-marker" size={12} color="#6B7280" />{' '}
          {item?.locationDto?.address}
        </Text>
      </View>

      {/* section: image mosaic (left big + right two small) */}
      <View style={styles.section}>
        <View style={styles.mosaicRow}>
          <Image
            source={imgSrc}
            style={{
              width: leftW,
              height: leftH,
              borderRadius: 6,
              backgroundColor: '#F3F4F6',
            }}
          />
          <View style={{width: rightW, marginLeft: 6}}>
            <Image
              source={imgSrc}
              style={{
                width: rightW,
                height: rightH,
                borderRadius: 6,
                backgroundColor: '#F3F4F6',
                marginBottom: 6,
              }}
            />
            <Image
              source={imgSrc}
              style={{
                width: rightW,
                height: rightH,
                borderRadius: 6,
                backgroundColor: '#F3F4F6',
              }}
            />
          </View>
        </View>
      </View>

      {/* section: drinks (ladder layout) */}
      {!!item?.mainDrinkDtos?.length && (
        <View style={styles.section}>
          {item.mainDrinkDtos.slice(0, 4).map((d, i) => (
            <View key={`${d.type}-${i}`} style={styles.drinkRow}>
              <Text style={styles.drinkLabel} numberOfLines={1}>
                {alcoholLabel(d.type)}
              </Text>
              <View style={styles.dots} />
              <Text style={styles.drinkPrice}>
                {d.price?.toLocaleString()}원
              </Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 16,
  },
  section: {
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    fontSize: normalizeFont(18, 1.5),
    fontFamily: 'Pretendard-Bold',
    color: '#111827',
    maxWidth: '70%',
  },
  ratingRow: {flexDirection: 'row', alignItems: 'center'},
  ratingText: {
    marginLeft: 4,
    fontSize: normalizeFont(12, 1.5),
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
  },
  categories: {
    marginTop: 2,
    fontSize: normalizeFont(12, 1.5),
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
  },
  statusText: {
    marginTop: 6,
    fontSize: normalizeFont(12, 1.5),
    fontFamily: 'Pretendard-SemiBold',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeNow: {
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
  },
  timeText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: ColorUtil.subText,
    marginLeft: 5,
  },
  address: {
    fontSize: normalizeFont(12, 1.5),
    fontFamily: 'Pretendard-Medium',
    color: '#4B5563',
  },
  mosaicRow: {flexDirection: 'row', justifyContent: 'space-between'},
  drinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  drinkLabel: {
    minWidth: 56,
    fontSize: normalizeFont(13, 1.5),
    color: '#111827',
    fontFamily: 'Pretendard-SemiBold',
  },
  dots: {
    flex: 1,
    height: 1,
    marginHorizontal: 8,
    backgroundColor: '#E5E7EB',
  },
  drinkPrice: {
    width: 72,
    textAlign: 'right',
    fontSize: normalizeFont(13, 1.5),
    color: '#111827',
    fontFamily: 'Pretendard-Medium',
  },
  actionsRow: {display: 'none'},
});

export default MapDetailItem;
