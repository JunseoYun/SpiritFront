import React, {useEffect, useRef} from 'react';
import {View, Animated, Dimensions, StyleSheet} from 'react-native';
import SkeletonBox from '../../hooks/SkeletonBox';

const windowWidth = Dimensions.get('window').width;
const imageWidth = windowWidth - 36;
const imageHeight = imageWidth * (4.2 / 8);

const LikedItemSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* 이미지 */}
      <View style={styles.imageview}>
        <SkeletonBox style={styles.image} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.lineRow}>
          <View style={styles.drinkView}>
            <SkeletonBox style={styles.drink} />
            <SkeletonBox style={styles.drink} />
            <SkeletonBox style={styles.drink} />
          </View>
        </View>

        {/* 인증/제목 */}
        <View style={styles.titleRow}>
          <SkeletonBox style={styles.certified} />
          <SkeletonBox style={styles.title} />
        </View>

        {/* 카테고리 */}
        <View style={styles.categoryRow}>
          <SkeletonBox style={styles.category} />
          <SkeletonBox style={styles.category} />
          <SkeletonBox style={styles.category} />
        </View>

        {/* 별점 + 리뷰수 */}
        <View style={styles.scoreRow}>
          <SkeletonBox style={styles.star} />
          <SkeletonBox style={styles.score} />
          <SkeletonBox style={styles.count} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
  },
  card: {
    marginBottom: 10,
  },
  imageview: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    marginTop: 20,
    marginVertical: 8,
    alignSelf: 'center',
    borderRadius: 12,
  },
  image: {
    width: imageWidth,
    height: imageHeight,
    borderRadius: 10,
    alignSelf: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-between',
    marginHorizontal: 22,
    marginBottom: 20,
  },
  lineRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  drinkView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  drink: {
    width: 60,
    height: 30,
    borderRadius: 5,
    marginRight: 7,
  },
  titleRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  certified: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    marginRight: 4,
    borderRadius: 10,
  },
  title: {
    width: '90%',
    height: 25,
    borderRadius: 4,
  },
  categoryRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  category: {
    width: '15%',
    height: 16,
    marginRight: 7,
    borderRadius: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  star: {
    width: 15,
    height: 15,
    borderRadius: 8,
  },
  score: {
    width: 15,
    height: 15,
    borderRadius: 8,
    marginLeft: 6,
  },
  count: {
    width: 15,
    height: 15,
    borderRadius: 8,
    marginLeft: 6,
  },
});

export default LikedItemSkeleton;
