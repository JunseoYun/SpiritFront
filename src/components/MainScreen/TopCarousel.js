import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import HeartIcon from '../../assets/svg/HeartIcon';
import ColorUtil from '../../utils/ColorUtil';
import CustomText from '../../utils/CustomText';

const TopCarousel = ({
  topRollScrollRef,
  topRollLoading,
  topRollSkeleton,
  topRollItems,
  windowWidth,
  windowHeight,
  navigation,
  defaultProfile,
}) => {
  if (!topRollLoading && topRollItems.length === 0) {
    return null;
  }

  const items = topRollLoading ? topRollSkeleton : topRollItems;

  return (
    <View style={styles.topCarouselContainer}>
      <ScrollView
        ref={topRollScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.topCarouselContent}>
        {items.map(item => {
          const isSkeleton = topRollLoading;
          return (
            <View
              key={isSkeleton ? item : item.id}
              style={[
                styles.topCarouselItem,
                {
                  width: windowWidth * 0.26,
                  height: windowHeight * 0.2,
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

                  <View style={styles.topCarouselMetaRow}>
                    <FastImage
                      source={
                        item.profileUri
                          ? {
                              uri: item.profileUri,
                              priority: FastImage.priority.normal,
                            }
                          : defaultProfile
                      }
                      style={styles.topCarouselAvatar}
                      resizeMode={FastImage.resizeMode.cover}
                    />
                    <CustomText
                      style={styles.topCarouselName}
                      numberOfLines={1}>
                      {item.name}
                    </CustomText>
                  </View>
                  <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.2)']}
                    style={styles.topCarouselGradient}
                    pointerEvents="none"
                  />
                  <View style={styles.topCarouselLikeRow}>
                    <HeartIcon
                      size={16}
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
    paddingTop: 6,
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
  topCarouselAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: ColorUtil.border,
  },
  topCarouselMetaRow: {
    position: 'absolute',
    top: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topCarouselGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
  },
  topCarouselName: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    textShadowColor: 'rgba(0,0,0,0.35)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
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
