import React from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import SkeletonBox from '../../hooks/SkeletonBox';

const windowWidth = Dimensions.get('window').width;
const H_MARGIN = 18;
const CARD_RADIUS = 16;
const imageWidth = windowWidth - H_MARGIN * 2;

const LikedItemSkeleton = () => {
  return (
    <View style={styles.card}>
      {/* 이미지 영역 (8:5) */}
      <View style={styles.imageWrap}>
        <SkeletonBox style={styles.image} />

        {/* 좌상단: 술 배지 자리(최대 3개) */}
        <View style={styles.badgeRowLeft}>
          <SkeletonBox style={[styles.drinkBadge, {width: 54}]} />
          <SkeletonBox style={[styles.drinkBadge, {width: 44}]} />
          <SkeletonBox style={[styles.drinkBadge, {width: 50}]} />
        </View>

        {/* 우상단: 인증 배지 자리 */}
        <SkeletonBox style={styles.verifyBadge} />

        {/* 우하단: 칩 바(거리/브레이크 자리) */}
        <View style={styles.chipBar}>
          <SkeletonBox style={[styles.chip, {width: 92}]} />
          <SkeletonBox style={[styles.chip, {width: 72}]} />
        </View>
      </View>

      {/* 정보 영역 */}
      <View style={styles.info}>
        {/* 카테고리 한 줄 */}
        <SkeletonBox style={styles.category} />

        {/* 제목 + 평점 */}
        <View style={styles.titleRow}>
          <SkeletonBox style={styles.title} />
          <SkeletonBox style={styles.rate} />
        </View>

        {/* 영업시간 */}
        <SkeletonBox style={styles.time} />

        {/* 대표 술/가격 배지 3개 */}
        <View style={styles.mainDrinkRow}>
          <SkeletonBox style={styles.drinkPill} />
          <SkeletonBox style={styles.drinkPill} />
          <SkeletonBox style={styles.drinkPill} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // 카드 컨테이너: 여백 + 라운드 + 섀도우로 '카드' 느낌
  card: {
    marginHorizontal: H_MARGIN,
    marginTop: 20,
    marginBottom: 5,
    backgroundColor: '#fff',
    borderRadius: CARD_RADIUS,
    // iOS shadow
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 6},
    // Android shadow
    elevation: 1,
  },

  // 이미지 상단만 라운드 클리핑 (부모는 overflow: visible로 shadow 유지)
  imageWrap: {
    width: imageWidth,
    aspectRatio: 8 / 5,
    alignSelf: 'center',
    borderTopLeftRadius: CARD_RADIUS,
    borderTopRightRadius: CARD_RADIUS,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f2f2f2',
  },
  image: {width: '100%', height: '100%'},

  // 좌상단 술 배지 자리
  badgeRowLeft: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
  },
  drinkBadge: {
    height: 22,
    borderRadius: 12,
    marginRight: 6,
  },

  // 우상단 인증 배지 자리
  verifyBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
  },

  // 우하단 칩 바(오른쪽부터 차곡)
  chipBar: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  chip: {
    height: 26,
    borderRadius: 16,
    marginLeft: 8, // row-reverse 구조라 왼쪽 간격
  },

  // 정보 영역
  info: {
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  category: {
    width: imageWidth * 0.55,
    height: 14,
    borderRadius: 4,
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    flex: 1,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
  },
  rate: {
    width: 40,
    height: 18,
    borderRadius: 4,
  },
  time: {
    width: imageWidth * 0.4,
    height: 14,
    borderRadius: 4,
  },

  // 대표 술/가격 자리
  mainDrinkRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  drinkPill: {
    width: 76,
    height: 20,
    borderRadius: 3,
    marginRight: 8,
  },
});

export default LikedItemSkeleton;
