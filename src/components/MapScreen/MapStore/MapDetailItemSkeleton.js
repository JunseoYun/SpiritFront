import React, {useMemo} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import SkeletonBox from '../../../hooks/SkeletonBox';

const {width} = Dimensions.get('window');
const H_PADDING = 16;
const CONTENT_WIDTH = width - H_PADDING * 2;

// 이미지 모자이크 크기 계산
const leftW = Math.round(CONTENT_WIDTH * 0.66) - 6;
const rightW = CONTENT_WIDTH - leftW - 6;
const leftH = 168;
const rightH = Math.floor((leftH - 6) / 2);

const MapDetailItemSkeleton = () => {
  return (
    <View style={[styles.wrap, {paddingHorizontal: H_PADDING}]}>
      {/* ---------------- HEADER ---------------- */}
      <View style={styles.section}>
        {/* 첫 줄: 가게명 + 별점 */}
        <View style={styles.headerRow}>
          <SkeletonBox style={styles.storeName} />
          <View style={styles.ratingRow}>
            <SkeletonBox style={styles.star} />
            <SkeletonBox style={styles.ratingText} />
          </View>
        </View>

        {/* 카테고리 */}
        <SkeletonBox style={styles.categories} />

        {/* 영업상태 + 시간 */}
        <View style={styles.timeRow}>
          <SkeletonBox style={styles.timeNow} />
          <SkeletonBox style={styles.timeText} />
        </View>
      </View>

      {/* ---------------- ADDRESS ---------------- */}
      <View style={styles.section}>
        <SkeletonBox style={styles.address} />
      </View>

      {/* ---------------- IMAGE MOSAIC ---------------- */}
      <View style={styles.section}>
        <View style={styles.mosaicRow}>
          {/* Left big image */}
          <SkeletonBox
            style={{
              width: leftW,
              height: leftH,
              borderRadius: 6,
            }}
          />

          <View style={{width: rightW, marginLeft: 6}}>
            {/* Right top */}
            <SkeletonBox
              style={{
                width: rightW,
                height: rightH,
                borderRadius: 6,
                marginBottom: 6,
              }}
            />
            {/* Right bottom */}
            <SkeletonBox
              style={{
                width: rightW,
                height: rightH,
                borderRadius: 6,
              }}
            />
          </View>
        </View>
      </View>

      {/* ---------------- DRINK LIST ---------------- */}
      <View style={styles.section}>
        {Array.from({length: 4}).map((_, i) => (
          <View key={i} style={styles.drinkRow}>
            <SkeletonBox style={styles.drinkLabel} />
            <SkeletonBox style={styles.dots} />
            <SkeletonBox style={styles.drinkPrice} />
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 16,
  },
  section: {
    marginBottom: 12,
  },

  /* Header */
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    width: '60%',
    height: 20,
    borderRadius: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 6,
  },
  ratingText: {
    width: 50,
    height: 14,
    borderRadius: 4,
  },
  categories: {
    marginTop: 4,
    width: '70%',
    height: 16,
    borderRadius: 4,
  },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  timeNow: {
    width: 60,
    height: 14,
    borderRadius: 4,
    marginRight: 8,
  },
  timeText: {
    width: 100,
    height: 14,
    borderRadius: 4,
  },

  /* Address */
  address: {
    width: '85%',
    height: 16,
    borderRadius: 4,
  },

  /* Mosaic */
  mosaicRow: {flexDirection: 'row', justifyContent: 'space-between'},

  /* Drinks */
  drinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  drinkLabel: {
    width: 60,
    height: 14,
    borderRadius: 4,
  },
  dots: {
    flex: 1,
    height: 1,
    backgroundColor: 'transparent',
    marginHorizontal: 8,
  },
  drinkPrice: {
    width: 70,
    height: 14,
    borderRadius: 4,
  },
});

export default MapDetailItemSkeleton;
