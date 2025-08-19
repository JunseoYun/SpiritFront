import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import SkeletonBox from '../../hooks/SkeletonBox';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth - 40;

const OpenStoreScreenitemSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* 이미지 스켈레톤 */}
      <SkeletonBox style={styles.image} />

      {/* 텍스트 정보 스켈레톤 */}
      <View style={styles.textContainer}>
        {/* 상단: 이름 + 평점 */}
        <View style={styles.lineRow}>
          <SkeletonBox style={styles.title} />
          <SkeletonBox style={styles.rate} />
        </View>

        {/* 카테고리 */}
        <View style={{flexDirection: 'row', gap: 20}}>
          <SkeletonBox style={styles.category} />
          <SkeletonBox style={styles.category} />
          <SkeletonBox style={styles.category} />
        </View>

        {/* 영업시간 + 거리 */}
        <View style={styles.lineRow}>
          <SkeletonBox style={styles.time} />
          <SkeletonBox style={styles.distance} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingTop: 10,
    paddingBottom: 40,
    backgroundColor: '#fff',
  },
  image: {
    width: imageWidth,
    height: (imageWidth * 3) / 4,
    borderRadius: 15,
    alignSelf: 'center',
    marginBottom: 10,
  },
  textContainer: {
    paddingHorizontal: 20,
  },
  lineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 50,
  },
  title: {
    flex: 1,
    height: 20,
    borderRadius: 4,
  },
  rate: {
    width: 40,
    height: 20,
    borderRadius: 4,
  },
  category: {
    flex: 0.25,
    height: 16,
    borderRadius: 4,
    marginBottom: 4,
  },
  time: {
    flex: 0.6,
    height: 14,
    borderRadius: 4,
  },
  distance: {
    width: 50,
    height: 14,
    borderRadius: 4,
  },
});

export default OpenStoreScreenitemSkeleton;
