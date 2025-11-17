import React from 'react';
import {View, StyleSheet, Dimensions, ScrollView} from 'react-native';
import SkeletonBox from '../../../hooks/SkeletonBox';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const IMG_WIDTH = width * 0.3;
const SPACING = width * 0.05;

const MapStoreItemSkeleton = () => {
  return (
    <View style={styles.storeInfo}>
      {/* 이미지 자리 */}
      <SkeletonBox style={styles.backimageview} />

      {/* 텍스트 및 정보 영역 */}
      <View style={styles.titletopview}>
        {/* 카테고리 */}
        <View style={styles.category}>
          <SkeletonBox style={styles.categoryItem} />
          <SkeletonBox style={styles.categoryItem} />
          <SkeletonBox style={styles.categoryItem} />
        </View>

        {/* 인증 마크 + 가게 이름 */}
        <View style={styles.titleview}>
          <SkeletonBox style={styles.storeName} />
        </View>

        {/* 주류 리스트 (가로 스크롤 가능) */}
        <View style={{flexDirection: 'row', marginBottom: 5}}>
          {Array.from({length: 3}).map((_, i) => (
            <SkeletonBox key={i} style={styles.menuText} />
          ))}
        </View>

        {/* 하단 시간 및 별점 영역 */}
        <View style={styles.timeview}>
          <SkeletonBox style={styles.timeviewtext} />
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <SkeletonBox style={styles.star} />
            <SkeletonBox style={styles.storeAddress} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  storeInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    marginHorizontal: SPACING,
  },
  backimageview: {
    width: IMG_WIDTH,
    height: IMG_WIDTH,
    borderRadius: 12,
    marginRight: 12,
  },
  titletopview: {
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  category: {
    flexDirection: 'row',
    marginTop: 5,
    paddingRight: 30,
  },
  categoryItem: {
    flex: 1,
    height: 16,
    borderRadius: 4,
    marginRight: 8,
  },
  titleview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  certifyMark: {
    width: 15,
    height: 15,
    borderRadius: 4,
    marginRight: 6,
  },
  storeName: {
    flex: 1,
    height: 20,
    borderRadius: 4,
  },
  menuText: {
    flex: 1,
    height: 16,
    borderRadius: 6,
    marginRight: 10,
  },
  timeview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeviewtext: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  star: {
    width: 15,
    height: 14,
    borderRadius: 7.5,
    marginRight: 6,
  },
  storeAddress: {
    width: 40,
    height: 14,
    borderRadius: 4,
  },
});

export default MapStoreItemSkeleton;
