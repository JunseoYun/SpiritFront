import React from 'react';
import {StyleSheet, View} from 'react-native';

import SkeletonBox from '../../../hooks/SkeletonBox';

const RecommTotalItemSkeleton = () => {
  return (
    <View style={styles.card}>
      <SkeletonBox style={styles.image} />

      <View style={styles.infoBox}>
        <View style={styles.topRow}>
          <SkeletonBox style={styles.storeName} />
          <SkeletonBox style={styles.menuName} />
        </View>

        <View style={styles.bottomRow}>
          <View style={styles.metaRow}>
            <SkeletonBox style={styles.metaChip} />
            <SkeletonBox style={styles.metaDot} />
            <SkeletonBox style={styles.metaText} />
            <SkeletonBox style={styles.metaTextWide} />
          </View>

          <SkeletonBox style={styles.price} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  storeName: {
    height: 18,
    borderRadius: 4,
    flex: 1,
    marginRight: 12,
  },
  menuName: {
    width: 60,
    height: 14,
    borderRadius: 4,
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
    gap: 8,
    marginRight: 12,
  },
  metaChip: {
    width: 44,
    height: 12,
    borderRadius: 4,
  },
  metaDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  metaText: {
    width: 28,
    height: 12,
    borderRadius: 4,
  },
  metaTextWide: {
    width: 72,
    height: 12,
    borderRadius: 4,
  },
  price: {
    width: 78,
    height: 18,
    borderRadius: 4,
  },
});

export default RecommTotalItemSkeleton;
