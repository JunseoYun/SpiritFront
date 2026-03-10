import React from 'react';
import {StyleSheet, View} from 'react-native';

import SkeletonBox from '../../../hooks/SkeletonBox';

const RecommTotalItemSkeleton = () => {
  return (
    <View style={styles.cardShadow}>
      <View style={styles.card}>
        <SkeletonBox style={styles.image} />

        <View style={styles.infoBox}>
          <View style={styles.topRow}>
            <SkeletonBox style={styles.storeName} />
          </View>

          <View style={styles.bottomRow}>
            <View style={styles.metaRow}>
              <SkeletonBox style={styles.metaChip} />
              <SkeletonBox style={styles.sepDot} />
              <SkeletonBox style={styles.rateText} />
              <SkeletonBox style={styles.sepDot} />
              <SkeletonBox style={styles.metaText} />
              <SkeletonBox style={styles.sepDot} />
              <SkeletonBox style={styles.metaTextWide} />
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
    gap: 6,
    marginRight: 10,
  },
  metaChip: {
    width: 42,
    height: 12,
    borderRadius: 4,
  },
  sepDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  rateText: {
    width: 26,
    height: 12,
    borderRadius: 4,
  },
  metaText: {
    width: 46,
    height: 12,
    borderRadius: 4,
  },
  metaTextWide: {
    width: 54,
    height: 12,
    borderRadius: 4,
  },
  priceValue: {
    width: 64,
    height: 18,
    borderRadius: 4,
  },
});

export default RecommTotalItemSkeleton;
