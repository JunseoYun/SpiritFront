import React from 'react';
import {StyleSheet, View} from 'react-native';
import SkeletonBox from '../../../hooks/SkeletonBox';

const RecommItemSkeleton = () => {
  return (
    <View style={styles.container}>
      <SkeletonBox style={styles.title} />

      <View style={styles.tabRow}>
        <SkeletonBox style={styles.tab} />
        <SkeletonBox style={styles.tab} />
        <SkeletonBox style={styles.tab} />
      </View>

      <View style={styles.cardRow}>
        <SkeletonBox style={styles.card} />
        <SkeletonBox style={styles.card} />
        <SkeletonBox style={styles.card} />
      </View>

      <View style={styles.footerRow}>
        <SkeletonBox style={styles.footerInfo} />
        <SkeletonBox style={styles.footerAction} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 14,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    height: 26,
    width: '46%',
    borderRadius: 8,
    marginLeft: 20,
    marginBottom: 14,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  tab: {
    width: 76,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  cardRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  card: {
    width: 118,
    height: 162,
    borderRadius: 16,
    marginRight: 8,
  },
  footerRow: {
    marginTop: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    width: '56%',
    height: 14,
    borderRadius: 6,
  },
  footerAction: {
    width: 68,
    height: 16,
    borderRadius: 6,
  },
});

export default RecommItemSkeleton;
