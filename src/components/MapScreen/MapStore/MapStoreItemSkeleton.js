import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import SkeletonBox from '../../../hooks/SkeletonBox';
import ColorUtil from '../../../utils/ColorUtil';

const {width} = Dimensions.get('window');

const MapStoreItemSkeleton = () => {
  return (
    <View style={styles.storeInfo}>
      {/* 이미지 자리 */}
      <SkeletonBox style={styles.backimageview} />

      {/* 텍스트 및 정보 */}
      <View style={styles.titletopview}>
        {/* 카테고리 */}
        <View style={styles.category}>
          <SkeletonBox style={styles.categoryItem} />
          <SkeletonBox style={styles.categoryItem} />
          <SkeletonBox style={styles.categoryItem} />
        </View>

        {/* 가게명 영역 */}
        <View style={styles.titleview}>
          <SkeletonBox style={styles.storeName} />
        </View>

        {/* 메뉴 텍스트 */}
        <View style={{flexDirection: 'row', marginBottom: 6}}>
          <SkeletonBox style={styles.menuText} />
          <SkeletonBox style={styles.menuTextShort} />
        </View>

        {/* 별점 + 시간 */}
        <View style={styles.timeview}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <SkeletonBox style={styles.star} />
            <SkeletonBox style={styles.storeRateText} />
          </View>

          <SkeletonBox style={styles.timeviewtext} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  storeInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderColor: ColorUtil.border,
  },

  /* 이미지 */
  backimageview: {
    width: 100,
    height: 100,
    borderRadius: 9,
    marginRight: 12,
  },

  /* 우측 전체 */
  titletopview: {
    flex: 1,
    justifyContent: 'space-between',
  },

  /* 카테고리 영역 */
  category: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  categoryItem: {
    width: 50,
    height: 14,
    borderRadius: 4,
    marginRight: 6,
  },

  /* 가게명 */
  titleview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  storeName: {
    width: '85%',
    height: 18,
    borderRadius: 4,
  },

  /* 메뉴 텍스트 */
  menuText: {
    width: 120,
    height: 14,
    borderRadius: 4,
    marginRight: 10,
  },
  menuTextShort: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },

  /* 하단 영역 */
  timeview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  /* 별 + 점수 */
  star: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 5,
  },
  storeRateText: {
    width: 50,
    height: 13,
    borderRadius: 4,
  },

  /* 시간 텍스트 */
  timeviewtext: {
    width: 90,
    height: 13,
    borderRadius: 4,
  },
});

export default MapStoreItemSkeleton;
