import React from 'react';
import {Dimensions, StyleSheet, View} from 'react-native';
import SkeletonBox from '../../../hooks/SkeletonBox';

const {width: screenWidth} = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.75;
const CARD_HEIGHT = 200;
const SIDE_CARD_WIDTH = CARD_WIDTH * 0.9;
const SIDE_CARD_HEIGHT = CARD_HEIGHT * 0.9;
const SIDE_VISIBLE_WIDTH = Math.max(18, Math.round(screenWidth * 0.07));
const DOT_COUNT = 10;

const RecommItemSkeleton = () => {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.titleRow}>
        <SkeletonBox style={styles.titleSkeleton} />
        <View style={styles.moreRow}>
          <SkeletonBox style={styles.moreTextSkeleton} />
          <SkeletonBox style={styles.moreIconSkeleton} />
        </View>
      </View>

      <View style={styles.tabTrack}>
        <View style={styles.tabContentContainer}>
          {TAB_SKELETON_WIDTHS.map((tabWidth, index) => (
            <View
              key={`tab-skeleton-${index}`}
              style={[styles.tabItem, index === 0 && styles.tabItemActive]}>
              <SkeletonBox
                style={[styles.tabTextSkeleton, {width: tabWidth}]}
              />
            </View>
          ))}
        </View>
      </View>

      <View style={styles.carouselWrap}>
        <View style={styles.carouselViewport}>
          <SkeletonBox style={[styles.sideCard, styles.leftSideCard]} />

          <View style={styles.mainCard}>
            <SkeletonBox style={styles.verifyBadge} />
            <SkeletonBox style={styles.mainTopTitle} />
            <SkeletonBox style={styles.mainTopPrice} />
            <View style={styles.mainBottomRow}>
              <SkeletonBox style={styles.mainBottomLeft} />
              <SkeletonBox style={styles.mainBottomRight} />
            </View>
          </View>

          <SkeletonBox style={[styles.sideCard, styles.rightSideCard]} />
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

const TAB_SKELETON_WIDTHS = [28, 26, 34, 24, 36, 22, 34, 30, 30, 34];

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  titleSkeleton: {
    width: 92,
    height: 22,
    borderRadius: 6,
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moreTextSkeleton: {
    width: 50,
    height: 14,
    borderRadius: 5,
    marginRight: 6,
  },
  moreIconSkeleton: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  tabTrack: {
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    marginBottom: 14,
  },
  tabContentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 2,
  },
  tabItem: {
    height: 40,
    marginRight: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#CFCFCF',
  },
  tabTextSkeleton: {
    height: 14,
    borderRadius: 5,
  },
  carouselWrap: {
    marginTop: 2,
  },
  carouselViewport: {
    width: '100%',
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sideCard: {
    position: 'absolute',
    width: SIDE_CARD_WIDTH,
    height: SIDE_CARD_HEIGHT,
    borderRadius: 12,
    opacity: 0.6,
  },
  leftSideCard: {
    left: -SIDE_CARD_WIDTH + SIDE_VISIBLE_WIDTH,
  },
  rightSideCard: {
    right: -SIDE_CARD_WIDTH + SIDE_VISIBLE_WIDTH,
  },
  mainCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    paddingTop: 12,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    paddingBottom: 10,
  },
  verifyBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 15,
    height: 15,
    borderRadius: 7.5,
  },
  mainTopTitle: {
    width: '62%',
    height: 16,
    borderRadius: 5,
  },
  mainTopPrice: {
    width: '42%',
    height: 12,
    borderRadius: 5,
    marginTop: -4,
  },
  mainBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainBottomLeft: {
    width: 44,
    height: 12,
    borderRadius: 5,
  },
  mainBottomRight: {
    width: 52,
    height: 12,
    borderRadius: 5,
  },
  pagination: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#D6D6D6',
  },
});

export default RecommItemSkeleton;
