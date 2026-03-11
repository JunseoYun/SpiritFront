import React from 'react';
import {StyleSheet, View} from 'react-native';

import SkeletonBox from '../../../hooks/SkeletonBox';

const RecommTotalItemSkeleton = () => {
  return (
    <View style={styles.cardShadow}>
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          <SkeletonBox style={styles.image} />
          <SkeletonBox style={styles.verifyIcon} />
        </View>

        <View style={styles.infoBox}>
          <View style={styles.topRow}>
            <SkeletonBox style={styles.storeName} />
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.metaRow}>
              <SkeletonBox style={styles.statusText} />
              <SkeletonBox style={styles.sepDot} />
              <View style={styles.rateRow}>
                <SkeletonBox style={styles.starIcon} />
                <SkeletonBox style={styles.rateText} />
              </View>
              <SkeletonBox style={styles.sepDot} />
              <SkeletonBox style={styles.reviewText} />
              <SkeletonBox style={styles.sepDot} />
              <SkeletonBox style={styles.distanceText} />
            </View>

            <SkeletonBox style={styles.priceValue} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    shadowColor: '#111',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    shadowOffset: {width: 0, height: 2},
    elevation: 1,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 0,
  },
  imageWrap: {
    position: 'relative',
  },
  verifyIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  infoBox: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    height: 18,
    borderRadius: 4,
    flex: 1,
    marginRight: 10,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  metaRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginRight: 10,
  },
  statusText: {
    width: 44,
    height: 12,
    borderRadius: 4,
  },
  sepDot: {
    width: 2,
    height: 2,
    borderRadius: 1,
    marginHorizontal: 6,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 4,
  },
  rateText: {
    width: 26,
    height: 12,
    borderRadius: 4,
  },
  reviewText: {
    width: 56,
    height: 12,
    borderRadius: 4,
  },
  distanceText: {
    width: 40,
    height: 12,
    borderRadius: 4,
  },
  priceValue: {
    width: 72,
    height: 18,
    borderRadius: 4,
  },
});

export default RecommTotalItemSkeleton;
