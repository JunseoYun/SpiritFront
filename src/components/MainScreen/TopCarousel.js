import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import HeartIcon from '../../assets/svg/HeartIcon';
import ColorUtil from '../../utils/ColorUtil';
import CustomText from '../../utils/CustomText';
import SkeletonBox from '../../hooks/SkeletonBox';

const TopCarousel = ({
  topRollScrollRef,
  topRollLoading,
  topRollSkeleton,
  topRollItems,
  navigation,
}) => {
  if (!topRollLoading && topRollItems.length === 0) {
    return null;
  }

  const items = topRollLoading ? topRollSkeleton : topRollItems;

  return (
    <View style={styles.topCarouselContainer}>
      {topRollLoading ? (
        <SkeletonBox style={styles.titleSkeleton} />
      ) : (
        <CustomText style={styles.title}>인기 게시글</CustomText>
      )}
      <ScrollView
        ref={topRollScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topCarouselContent}>
        {items.map((item, index) => {
          const isSkeleton = topRollLoading;
          return (
            <View
              key={isSkeleton ? item : item.id}
              style={[
                styles.topCarouselItem,
                {
                  width: 120,
                  height: 120 * (4 / 3),
                },
              ]}>
              {isSkeleton ? (
                <View style={styles.topCarouselSkeleton} />
              ) : (
                <TouchableOpacity
                  activeOpacity={0.9}
                  style={styles.topCarouselCard}
                  onPress={() =>
                    navigation.navigate('PostDetailScreen', {
                      postId: item.id,
                      returnTo: 'MainScreen',
                    })
                  }>
                  <FastImage
                    source={{
                      uri: item.uri,
                      priority: FastImage.priority.high,
                    }}
                    style={styles.topCarouselImage}
                    resizeMode={FastImage.resizeMode.cover}
                  />
                  <CustomText
                    style={styles.topNumber}
                    maxScale={1.2}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {index + 1}
                  </CustomText>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.2)']}
                    style={styles.topCarouselGradient}
                    pointerEvents="none"
                  />
                  <LinearGradient
                    colors={['rgba(0,0,0,0.25)', 'transparent']}
                    style={styles.topCarouselTopGradient}
                    pointerEvents="none"
                  />
                  <View style={styles.topCarouselLikeRow}>
                    <HeartIcon
                      size={18}
                      color="#FF6B6B"
                      filled
                      strokeWidth={0}
                    />
                    <CustomText style={styles.topCarouselLikeText}>
                      {item.likes ?? 0}
                    </CustomText>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topCarouselContainer: {
    paddingTop: 10,
    paddingBottom: 7,
  },
  title: {
    marginHorizontal: 16,
    marginBottom: 9,
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  titleSkeleton: {
    marginHorizontal: 16,
    marginBottom: 9,
    width: 88,
    height: 18,
    borderRadius: 4,
  },
  topCarouselContent: {
    paddingLeft: 16,
    paddingRight: 6,
  },
  topCarouselItem: {
    marginRight: 10,
    position: 'relative',
  },
  topCarouselCard: {
    borderRadius: 9,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: ColorUtil.border,
  },
  topCarouselSkeleton: {
    flex: 1,
    borderRadius: 9,
    backgroundColor: '#eee',
  },
  topCarouselImage: {
    width: '100%',
    height: '100%',
  },

  topNumber: {
    position: 'absolute',
    top: 4,
    left: 8,
    color: '#FFF',
    fontSize: 28,
    fontFamily: 'Pretendard-Medium',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
    zIndex: 3,
    includeFontPadding: false,
  },
  topCarouselGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
  },
  topCarouselTopGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '35%',
  },

  topCarouselLikeRow: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  topCarouselLikeText: {
    color: '#FFF',
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
});

export default TopCarousel;
