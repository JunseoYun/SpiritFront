import React from 'react';
import {View, StyleSheet} from 'react-native';
import SkeletonBox from '../../hooks/SkeletonBox';

const ReviewItemSkeleton = () => {
  return (
    <View style={styles.reviewContainer}>
      {/* 상단 리뷰 헤더 */}
      <View style={styles.reviewHeader}>
        <SkeletonBox style={styles.avatar} />
        <View style={styles.reviewHeaderText}>
          <SkeletonBox style={styles.nameSkeleton} />
          <SkeletonBox style={styles.ratingSkeleton} />
        </View>
        <SkeletonBox style={styles.dateSkeleton} />
      </View>

      {/* 리뷰 본문 */}
      <View style={styles.contentView}>
        <SkeletonBox style={styles.lineSkeleton} />
        <SkeletonBox style={styles.lineSkeleton} />
        <SkeletonBox style={styles.shortLineSkeleton} />
      </View>

      {/* 리뷰 이미지 */}
      <View style={styles.imageContainer}>
        <SkeletonBox style={styles.reviewImage} />
        <SkeletonBox style={styles.reviewImage} />
        <SkeletonBox style={styles.reviewImage} />
      </View>

      {/* 하단 날짜/신고 */}
      <View style={styles.bottomView}>
        <SkeletonBox style={styles.shortLineSkeleton} />
        <SkeletonBox style={styles.shortLineSkeleton} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    width: '100%',
    backgroundColor: 'white',
    paddingTop: 20,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 100,
    marginRight: 10,
  },
  reviewHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  nameSkeleton: {
    width: 120,
    height: 16,
    borderRadius: 4,
    marginBottom: 6,
  },
  ratingSkeleton: {
    width: 80,
    height: 14,
    borderRadius: 4,
  },
  dateSkeleton: {
    width: 70,
    height: 14,
    borderRadius: 4,
  },
  contentView: {
    marginHorizontal: 18,
    marginTop: 15,
  },
  lineSkeleton: {
    height: 14,
    borderRadius: 4,
    marginBottom: 10,
    width: '100%',
  },
  shortLineSkeleton: {
    height: 14,
    borderRadius: 4,
    width: 100,
  },
  imageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 7,
    paddingHorizontal: 18,
    marginTop: 15,
  },
  reviewImage: {
    width: 100,
    height: 100,
    borderRadius: 7,
  },
  bottomView: {
    marginHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});

export default ReviewItemSkeleton;
