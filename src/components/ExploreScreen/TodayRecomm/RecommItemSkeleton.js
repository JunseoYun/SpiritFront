import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import SkeletonBox from '../../../hooks/SkeletonBox';

const {width: screenWidth} = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = 210;
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
          <View style={styles.cardBottomRow}>
            <View style={styles.cardStoreNameRow}>
              <SkeletonBox style={styles.verifyIcon} />
              <SkeletonBox style={styles.storeName} />
            </View>
            <SkeletonBox style={styles.priceBox} />
          </View>
        </View>

        <View style={styles.pagination}>
          {Array.from({length: DOT_COUNT}).map((_, index) => (
            <View key={`dot-skeleton-${index}`} style={styles.dotSlot}>
              <SkeletonBox
                style={[styles.dot, index === 0 && styles.dotActive]}
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#fff',
    paddingTop: 16,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 4,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titlePill: {
    width: 56,
    height: 22,
    borderRadius: 10,
  },
  titleSuffix: {
    width: 92,
    height: 22,
    borderRadius: 6,
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreTextSkeleton: {
    width: 46,
    height: 14,
    borderRadius: 5,
  },
  carouselWrap: {
    marginTop: 8,
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
  cardStoreNameRow: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  verifyIcon: {
    width: 16,
    height: 16,
    borderRadius: 4,
  },
  storeName: {
    flex: 1,
    minWidth: 0,
    height: 17,
    borderRadius: 6,
  },
  priceBox: {
    width: 72,
    height: 18,
    borderRadius: 6,
  },
  pagination: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotSlot: {
    width: 10,
    height: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
    overflow: 'visible',
  },
  dot: {
    height: 5,
    width: 5,
    borderRadius: 3,
    position: 'absolute',
  },
  dotActive: {
    height: 5,
    width: 16,
    borderRadius: 3,
  },
});

export default RecommItemSkeleton;
