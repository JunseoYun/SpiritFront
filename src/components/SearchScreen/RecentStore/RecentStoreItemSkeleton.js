import React from 'react';
import {View, StyleSheet} from 'react-native';
import SkeletonBox from '../../../hooks/SkeletonBox';

const RecentStoreItemSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* 이미지 영역 스켈레톤 */}
      <SkeletonBox style={styles.backimageview} />

      {/* 텍스트 정보 영역 */}
      <View style={styles.infoContainer}>
        <View style={styles.headerView}>
          <SkeletonBox style={styles.storeName} />
        </View>
        <View style={styles.storeCategoryInfo}>
          <SkeletonBox style={styles.StoreCategory} />
          <SkeletonBox style={styles.StoreCategory} />
          <SkeletonBox style={styles.StoreCategory} />
        </View>
        <View style={styles.storeViewInfo}>
          <SkeletonBox style={styles.storeTimeInfo} />
          <SkeletonBox style={styles.storeSubInfo} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 170,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  backimageview: {
    width: 170,
    height: 120,
    marginTop: 15,
    borderRadius: 15,
  },
  infoContainer: {
    marginTop: 8,
    paddingHorizontal: 5,
  },
  headerView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  storeName: {
    height: 20,
    flex: 1,
    borderRadius: 4,
    marginBottom: 5,
    marginTop: 5,
  },
  storeCategoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 5,
  },
  StoreCategory: {
    height: 16,
    flex: 1,
    borderRadius: 4,
    marginBottom: 9,
  },
  storeViewInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  storeTimeInfo: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  storeSubInfo: {
    width: 50,
    height: 14,
    borderRadius: 4,
  },
});

export default RecentStoreItemSkeleton;
