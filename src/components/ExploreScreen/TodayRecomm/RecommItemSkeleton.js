import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import SkeletonBox from '../../../hooks/SkeletonBox';

const {width: screenWidth} = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = 200;
const DOT_COUNT = 3;

const RecommItemSkeleton = () => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.titleRow}>
        <View style={styles.titleGroup}>
          <SkeletonBox style={styles.titlePill} />
          <SkeletonBox style={styles.titleSuffix} />
        </View>
        <View style={styles.moreRow}>
          <SkeletonBox style={styles.moreTextSkeleton} />
        </View>
      </View>

      <View style={styles.carouselWrap}>
        <View style={styles.cardContainer}>
          <SkeletonBox style={styles.card} />
          <SkeletonBox style={styles.verifyBadge} />
          <View style={styles.cardBottomRow}>
            <SkeletonBox style={styles.storeName} />
            <SkeletonBox style={styles.priceBox} />
          </View>
        </View>

        <View style={styles.pagination}>
          {Array.from({length: DOT_COUNT}).map((_, index) => (
            <SkeletonBox
              key={`dot-skeleton-${index}`}
              style={[styles.dot, index === 0 && styles.dotActive]}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titlePill: {
    width: 44,
    height: 18,
    borderRadius: 9,
  },
  titleSuffix: {
    width: 86,
    height: 18,
    borderRadius: 6,
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreTextSkeleton: {
    width: 46,
    height: 12,
    borderRadius: 5,
  },
  carouselWrap: {
    marginTop: 4,
  },
  cardContainer: {
    width: '100%',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
  },
  verifyBadge: {
    position: 'absolute',
    top: 12,
    right: (screenWidth - CARD_WIDTH) / 2 + 12,
    width: 44,
    height: 16,
    borderRadius: 8,
  },
  cardBottomRow: {
    position: 'absolute',
    left: (screenWidth - CARD_WIDTH) / 2 + 15,
    right: (screenWidth - CARD_WIDTH) / 2 + 15,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  storeName: {
    width: '55%',
    height: 14,
    borderRadius: 6,
  },
  priceBox: {
    width: 92,
    height: 22,
    borderRadius: 8,
  },
  pagination: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginHorizontal: 3,
  },
  dotActive: {
    width: 16,
    height: 5,
    borderRadius: 3,
  },
});

export default RecommItemSkeleton;
