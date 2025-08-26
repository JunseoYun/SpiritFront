import React from 'react';
import {View, StyleSheet} from 'react-native';
import SkeletonBox from '../../hooks/SkeletonBox';

const ViewedStoreScreenSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* 왼쪽 썸네일 */}
      <SkeletonBox style={styles.thumbnail} />

      {/* 오른쪽 텍스트 영역 */}
      <View style={styles.textContainer}>
        {/* 카테고리 (최대 3개) */}
        <View style={styles.row}>
          <SkeletonBox style={styles.category} />
          <SkeletonBox style={styles.category} />
          <SkeletonBox style={styles.category} />
        </View>

        {/* 상호명 */}
        <SkeletonBox style={styles.title} />

        {/* 주소 */}
        <SkeletonBox style={styles.address} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginHorizontal: 22,
    marginVertical: 11,
  },
  thumbnail: {
    width: 110,
    height: 110,
    borderRadius: 7,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  category: {
    width: 50,
    height: 14,
    borderRadius: 4,
    marginRight: 6,
  },
  title: {
    width: '80%',
    height: 18,
    borderRadius: 4,
    marginBottom: 6,
  },
  address: {
    width: '95%',
    height: 14,
    borderRadius: 4,
  },
});

export default ViewedStoreScreenSkeleton;
