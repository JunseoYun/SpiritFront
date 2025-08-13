import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import SkeletonBox from '../../../../hooks/SkeletonBox';

const ResultModalItemSkeleton = () => {
  return (
    <View style={styles.fastSearchStoreInfo}>
      {/* 이미지 자리 */}
      <SkeletonBox style={styles.backimage} />

      {/* 텍스트/정보 자리 */}
      <View style={styles.fastStoreText}>
        {/* 상단 인증 마크 + 이름 */}
        <View style={styles.fastSearchStoreView}>
          <SkeletonBox style={styles.fastStoreTitle} />
          <View style={styles.fastStorescore}>
            <SkeletonBox style={styles.star} />
            <SkeletonBox style={styles.fastScoretext} />
          </View>
        </View>

        {/* 평점 */}

        {/* 카테고리 */}
        <View style={styles.StoreScore}>
          <SkeletonBox style={styles.category} />
          <SkeletonBox style={styles.category} />
          <SkeletonBox style={styles.category} />
        </View>

        {/* 주류 리스트 */}
        <View style={styles.StoreAlcoholList}>
          {Array.from({length: 3}).map((_, i) => (
            <SkeletonBox key={i} style={styles.alcoholItem} />
          ))}
        </View>

        {/* 하단 상태 텍스트 */}
        <View style={styles.subView}>
          <SkeletonBox style={styles.StoreClose} />
          <SkeletonBox style={[styles.StoreClose, {width: 80}]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  fastSearchStoreInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignSelf: 'center',
    borderRadius: 16,
    marginHorizontal: 18,
    marginVertical: 7,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 1,
  },
  backimage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 12,
  },
  fastStoreText: {
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 3,
  },
  fastSearchStoreView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  certifyMark: {
    width: 15,
    height: 15,
    borderRadius: 4,
    marginRight: 6,
  },
  fastStoreTitle: {
    flex: 1,
    height: 20,
    borderRadius: 4,
  },
  fastStorescore: {
    marginLeft: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    width: 15,
    height: 15,
    borderRadius: 7.5,
    marginRight: 6,
  },
  fastScoretext: {
    width: 20,
    height: 15,
    borderRadius: 4,
  },
  StoreScore: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  category: {
    width: 60,
    height: 14,
    borderRadius: 4,
    marginRight: 8,
  },
  StoreAlcoholList: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  alcoholItem: {
    flex: 1,
    height: 16,
    borderRadius: 6,
    marginRight: 10,
  },
  subView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  StoreClose: {
    width: 100,
    height: 14,
    borderRadius: 4,
  },
});

export default ResultModalItemSkeleton;
