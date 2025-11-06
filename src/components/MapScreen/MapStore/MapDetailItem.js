import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useStoreStatus from '../../../hooks/useStoreStatus';
import {normalizeFont} from '../../../hooks/normalizeFont';

const {width, height: SCREEN_HEIGHT} = Dimensions.get('window');
const CARD_WIDTH = Math.min(width * 0.92, 420);
const LARGE_IMG_WIDTH = CARD_WIDTH - 24; // card horizontal padding 고려
const DOT_SIZE = 8;

const MapDetailItem = ({
  item,
  index,
  selectedStoreIndex,
  setSelectedStore,
  moveCenterMap,
  onItemPress,
  sheetIndex = 1,
}) => {
  const {isOpen, closed, nextclosed, isBreak, starttime, endtime, breakend} =
    useStoreStatus(item?.operationInfoDtos, item?.isAlwaysOpen);

  const {translateCategory} = useCategoryTranslation();

  const getStatusText = () => {
    if (item?.isAlwaysOpen) return '24시간 영업';
    if (closed) return '금일 휴무';
    if (!isOpen && nextclosed) return '영업 종료 · 내일 휴무';
    if (!isOpen) return `영업 종료 · ${starttime} 오픈`;
    if (isOpen && isBreak) return `브레이크 타임 · ${breakend} 종료`;
    return `영업중 · ${endtime} 종료`;
  };

  const images = [item.mainImgUrl, item.mainImgUrl, item.mainImgUrl];

  const [activeImage, setActiveImage] = useState(0);
  const onMomentumScrollEnd = e => {
    const offsetX = e?.nativeEvent?.contentOffset?.x ?? 0;
    const index = Math.round(offsetX / LARGE_IMG_WIDTH);
    if (!Number.isNaN(index)) setActiveImage(index);
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.storeName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.ratingRow}>
          <FontAwesomeIcon name="star" size={14} color="#FFB400" />
          <Text style={styles.ratingText}>
            {item.storeRate} ({item.reviewCount})
          </Text>
        </View>
      </View>

      <Text style={styles.categories} numberOfLines={1}>
        {item.categories?.map(c => translateCategory(c)).join(', ') ||
          '카테고리 미설정'}
      </Text>

      <View style={styles.statusPill}>
        <Text style={styles.statusText}>{getStatusText()}</Text>
      </View>

      <Text style={styles.address} numberOfLines={1}>
        {item.locationDto?.address}
      </Text>

      <FlatList
        data={images}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumScrollEnd}
        snapToInterval={LARGE_IMG_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={styles.imageCarousel}
        renderItem={({item: img}) => (
          <Image
            source={
              img ? {uri: img} : require('../../../assets/default_store.png')
            }
            style={[styles.largeImage, {height: 200}]}
          />
        )}
      />

      <View style={styles.dotsRow}>
        {images.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeImage ? styles.dotActive : null]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginTop: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: {width: 0, height: 8},
    shadowRadius: 12,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    fontSize: normalizeFont(16, 1.5),
    fontFamily: 'Pretendard-Bold',
    color: '#111',
    maxWidth: '70%',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: normalizeFont(12, 1.5),
    fontFamily: 'Pretendard-Medium',
    color: '#666',
  },
  categories: {
    marginTop: 2,
    fontSize: normalizeFont(12, 1.5),
    fontFamily: 'Pretendard-Medium',
    color: '#777',
  },
  statusPill: {
    alignSelf: 'flex-start',
    marginTop: 6,
    backgroundColor: '#E8FFF3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: normalizeFont(12, 1.5),
    fontFamily: 'Pretendard-SemiBold',
    color: '#00A650',
  },
  address: {
    marginTop: 8,
    fontSize: normalizeFont(12, 1.5),
    fontFamily: 'Pretendard-Medium',
    color: '#666',
  },
  imageCarousel: {
    marginTop: 12,
  },
  largeImage: {
    width: LARGE_IMG_WIDTH,
    borderRadius: 10,
    marginRight: 8,
    backgroundColor: '#f2f2f2',
  },
  dotsRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    marginTop: 6,
    gap: 6,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: '#E5E7EB',
  },
  dotActive: {
    backgroundColor: '#111',
  },
});

export default MapDetailItem;
