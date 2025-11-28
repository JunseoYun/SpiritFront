import React from 'react';
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
    <View style={styles.container}>
      {/* 상단 카테고리 + 액션 */}
      <View style={styles.headerRow}>
        <SkeletonBox style={styles.categories} />
        <View style={styles.headerActions}>
          <SkeletonBox style={styles.topButton} />
          <SkeletonBox style={styles.topButton} />
        </View>
      </View>

      {/* 매장명 */}
      <View style={styles.titleRow}>
        <SkeletonBox style={styles.verifyIcon} />
        <SkeletonBox style={styles.storeName} />
      </View>

      {/* 별점 + 영업시간 */}
      <View style={styles.infoRow}>
        <View style={styles.ratingRow}>
          <SkeletonBox style={styles.starIcon} />
          <SkeletonBox style={styles.ratingText} />
        </View>
        <View style={styles.operationRow}>
          <SkeletonBox style={styles.operationBadge} />
          <SkeletonBox style={styles.operationTime} />
        </View>
      </View>

      {/* 거리 + 주소 */}
      <View style={styles.distanceRow}>
        <SkeletonBox style={styles.distanceText} />
        <View style={styles.dot} />
        <SkeletonBox style={styles.addressText} />
      </View>

      {/* 주류 정보 */}
      <View style={styles.alcoholRow}>
        {Array.from({length: 3}).map((_, idx) => (
          <SkeletonBox key={idx} style={styles.alcoholChip} />
        ))}
      </View>

      {/* 이미지 모자이크 */}
      <View style={styles.imageRow}>
        <SkeletonBox style={styles.mainImage} />
        <View style={styles.subImageColumn}>
          <SkeletonBox style={[styles.subImage, styles.subImageFirst]} />
          <SkeletonBox style={styles.subImage} />
        </View>
      </View>

      {/* 하단 버튼 */}
      <View style={styles.bottomButtonRow}>
        <View style={styles.bottomButtonGroup}>
          {Array.from({length: 3}).map((_, idx) => (
            <SkeletonBox key={idx} style={styles.iconButton} />
          ))}
        </View>
        <SkeletonBox style={styles.directionsButton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: H_PADDING,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  categories: {
    width: '55%',
    height: 16,
    borderRadius: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginLeft: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  verifyIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  storeName: {
    width: '70%',
    height: 22,
    borderRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  ratingText: {
    width: 70,
    height: 14,
    borderRadius: 4,
  },
  operationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  operationBadge: {
    width: 60,
    height: 16,
    borderRadius: 8,
    marginRight: 6,
  },
  operationTime: {
    width: 80,
    height: 12,
    borderRadius: 4,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  distanceText: {
    width: 50,
    height: 14,
    borderRadius: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 8,
    backgroundColor: '#E5E7EB',
  },
  addressText: {
    flex: 1,
    height: 14,
    borderRadius: 4,
  },
  alcoholRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alcoholChip: {
    width: 70,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  imageRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  mainImage: {
    width: leftW,
    height: leftH,
    borderRadius: 6,
  },
  subImageColumn: {
    width: rightW,
    marginLeft: 6,
    justifyContent: 'space-between',
  },
  subImage: {
    width: rightW,
    height: rightH,
    borderRadius: 6,
  },
  subImageFirst: {
    marginBottom: 6,
  },
  bottomButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomButtonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
  },
  directionsButton: {
    width: 100,
    height: 38,
    borderRadius: 19,
  },
});

export default MapDetailItemSkeleton;
