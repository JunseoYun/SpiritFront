import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Easing,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';
import CustomText from '../../../utils/CustomText';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatCircleIcon from '../../../assets/svg/ChatCircleIcon';
import PaperPlaneIcon from '../../../assets/svg/PaperPlaneIcon';
import HeartIcon from '../../../assets/svg/HeartIcon';
import BookmarkIcon from '../../../assets/svg/BookmarkIcon';
import ColorUtil from '../../../utils/ColorUtil';
const defaultProfile = require('../../../assets/default_profile.png');

const FeedItem = ({item}) => {
  const screenWidth = Dimensions.get('window').width;
  const profileSource = item.profileImage
    ? {uri: item.profileImage}
    : defaultProfile;
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes ?? 0);
  const [saved, setSaved] = useState(false);
  const comments = item.comments ?? 0;
  const shares = item.shares ?? 0;
  const [showAltTitle, setShowAltTitle] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [imageRatio, setImageRatio] = useState(1);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageRatios, setImageRatios] = useState({});
  const totalImages = item.postImages?.length ?? 0;
  const lastTapRef = useRef({time: 0, x: 0, y: 0});
  const likeButtonRef = useRef(null);
  const heartIconWrapperRef = useRef(null);
  const cardRef = useRef(null);
  const flyingHeartPos = useRef(new Animated.ValueXY({x: 0, y: 0})).current;
  const flyingHeartScale = useRef(new Animated.Value(0)).current;
  const [showFlyingHeart, setShowFlyingHeart] = useState(false);
  const HEART_SIZE = 32;
  const HEART_END_OFFSET_X = 0;
  const HEART_LINGER_DURATION = 140;
  const pendingLikeRef = useRef(false);

  const animateToggle = useCallback(() => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setShowAltTitle(prev => !prev);
      Animated.sequence([
        Animated.delay(100),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [fadeAnim]);

  useEffect(() => {
    if (!item.name) {
      setShowAltTitle(false);
      fadeAnim.setValue(1);
      return;
    }

    const id = setInterval(animateToggle, 7000);

    return () => clearInterval(id);
  }, [animateToggle, fadeAnim, item.name]);

  const handleLikePress = () => {
    if (showFlyingHeart || pendingLikeRef.current) {
      return;
    }
    setLiked(prev => !prev);
    setLikes(prev => prev + (liked ? -1 : 1));
  };

  const handleBookmarkPress = () => {
    setSaved(prev => !prev);
  };

  const handleImageLoad = (event, index) => {
    const {width, height} = event.nativeEvent;
    if (width && height) {
      const ratio = width / height;
      if (ratio > 0) {
        setImageRatios(prev => {
          if (prev[index] === ratio) {
            return prev;
          }
          const next = {...prev, [index]: ratio};
          if (index === currentIndex) {
            setImageRatio(ratio);
          }
          return next;
        });
      }
    }
  };

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    const first = viewableItems?.[0];
    if (first?.index !== undefined) {
      setCurrentIndex(first.index);
      const ratio = imageRatios[first.index];
      if (ratio) {
        setImageRatio(ratio);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;

  useEffect(() => {
    setImageRatios({});
    setCurrentIndex(0);
    setImageRatio(1);
    item.postImages?.forEach((uri, idx) => {
      Image.getSize(
        uri,
        (width, height) => {
          if (width && height) {
            const ratio = width / height;
            if (ratio > 0) {
              setImageRatios(prev => {
                if (prev[idx] === ratio) {
                  return prev;
                }
                const next = {...prev, [idx]: ratio};
                if (idx === 0) {
                  setImageRatio(ratio);
                }
                return next;
              });
            }
          }
        },
        () => {},
      );
    });
  }, [item.postImages]);

  const indicatorIndices = useMemo(() => {
    if (!item.postImages || totalImages === 0) {
      return [];
    }

    const windowSize = Math.min(7, totalImages);
    const biasToRight = 0;
    let start = currentIndex - (Math.floor(windowSize / 2) + biasToRight);
    let end = start + windowSize - 1;

    if (start < 0) {
      start = 0;
      end = windowSize - 1;
    }

    if (end >= totalImages) {
      end = totalImages - 1;
      start = Math.max(0, end - windowSize + 1);
    }

    return Array.from({length: end - start + 1}, (_, i) => start + i);
  }, [currentIndex, item.postImages, totalImages]);

  const triggerHeartFly = useCallback(
    (pageX = 0, pageY = 0, onFinish) => {
      if (!cardRef.current) {
        onFinish?.();
        return;
      }

      setShowFlyingHeart(true);

      cardRef.current.measureInWindow((cardX = 0, cardY = 0) => {
        const measureTarget = targetCallback => {
          if (heartIconWrapperRef.current) {
            heartIconWrapperRef.current.measureInWindow(
              (targetX = 0, targetY = 0, targetW = 0, targetH = 0) => {
                targetCallback(targetX, targetY, targetW, targetH);
              },
            );
            return;
          }

          if (likeButtonRef.current) {
            likeButtonRef.current.measureInWindow(
              (targetX = 0, targetY = 0, targetW = 0, targetH = 0) => {
                targetCallback(targetX, targetY, targetW, targetH);
              },
            );
            return;
          }

          targetCallback();
        };

        measureTarget((targetX = 0, targetY = 0, targetW = 0, targetH = 0) => {
          const startX = pageX - cardX - HEART_SIZE / 2;
          const startY = pageY - cardY - HEART_SIZE / 2;
          const destX =
            targetX + targetW / 2 - cardX - HEART_SIZE / 2 + HEART_END_OFFSET_X;
          const destY = targetY + targetH / 2 - cardY - HEART_SIZE / 2;

          flyingHeartPos.setValue({x: startX, y: startY});
          flyingHeartScale.setValue(0.2);

          Animated.sequence([
            Animated.spring(flyingHeartScale, {
              toValue: 1.6,
              friction: 5,
              tension: 190,
              useNativeDriver: true,
            }),
            Animated.delay(100),
            Animated.parallel([
              Animated.timing(flyingHeartPos, {
                toValue: {x: destX, y: destY},
                duration: 450,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(flyingHeartScale, {
                  toValue: 1.85,
                  duration: 220,
                  easing: Easing.inOut(Easing.quad),
                  useNativeDriver: true,
                }),
                Animated.spring(flyingHeartScale, {
                  toValue: 1.1,
                  friction: 8,
                  tension: 120,
                  useNativeDriver: true,
                }),
              ]),
            ]),
          ]).start(() => {
            setShowFlyingHeart(false);
            onFinish?.();
          });
        });
      });
    },
    [HEART_SIZE, flyingHeartPos, flyingHeartScale],
  );

  const handleDoubleTapLike = useCallback(
    event => {
      if (showFlyingHeart) {
        return;
      }

      const {pageX = 0, pageY = 0} = event?.nativeEvent ?? {};
      if (liked || pendingLikeRef.current) {
        triggerHeartFly(pageX, pageY);
        return;
      }

      pendingLikeRef.current = true;
      setLikes(prev => prev + 1);

      triggerHeartFly(pageX, pageY, () => {
        setLiked(true);
        pendingLikeRef.current = false;
      });
    },
    [liked, showFlyingHeart, triggerHeartFly],
  );

  const handleImagePress = useCallback(
    event => {
      const now = Date.now();
      const {locationX = 0, locationY = 0} = event?.nativeEvent ?? {};
      const {time: lastTime, x: lastX, y: lastY} = lastTapRef.current;
      const isFast = now - lastTime < 500;
      const distance = Math.hypot(locationX - lastX, locationY - lastY);
      const isSameArea = distance < 40;

      if (isFast && isSameArea) {
        handleDoubleTapLike(event);
      }

      lastTapRef.current = {time: now, x: locationX, y: locationY};
    },
    [handleDoubleTapLike],
  );

  return (
    <View style={styles.card} ref={cardRef}>
      {showFlyingHeart ? (
        <View pointerEvents="none" style={styles.heartFlyContainer}>
          <Animated.View
            style={[
              styles.flyingHeart,
              {
                transform: [
                  {translateX: flyingHeartPos.x},
                  {translateY: flyingHeartPos.y},
                  {scale: flyingHeartScale},
                ],
              },
            ]}>
            <HeartIcon
              size={HEART_SIZE}
              color="#FF5E5E"
              filled
              strokeWidth={0}
            />
          </Animated.View>
        </View>
      ) : null}
      <View style={styles.cardHeader}>
        <View style={styles.profileRow}>
          <FastImage source={profileSource} style={styles.avatar} />
          <View style={styles.profileText}>
            <CustomText style={styles.nickname}>{item.nickname}</CustomText>
            <Animated.View style={{opacity: fadeAnim}}>
              <CustomText style={styles.address} numberOfLines={1}>
                {showAltTitle && item.name ? item.name : item.storeAddress}
              </CustomText>
            </Animated.View>
          </View>
        </View>
        <Pressable style={styles.moreButton} hitSlop={8}>
          <Ionicons name="ellipsis-horizontal" size={18} color="#333" />
        </Pressable>
      </View>

      {item.postImages?.length > 1 ? (
        <View style={{width: screenWidth, position: 'relative'}}>
          <FlatList
            data={item.postImages}
            keyExtractor={(uri, index) => `${uri}-${index}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="start"
            decelerationRate="fast"
            style={{width: screenWidth}}
            snapToInterval={screenWidth}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={({item: uri, index}) => (
              <View style={{width: screenWidth}}>
                <Pressable onPress={handleImagePress}>
                  <FastImage
                    source={{uri}}
                    style={[
                      styles.postImage,
                      {
                        width: screenWidth,
                        aspectRatio: imageRatios[index] ?? imageRatio,
                      },
                    ]}
                    resizeMode={FastImage.resizeMode.contain}
                    onLoad={event => handleImageLoad(event, index)}
                  />
                </Pressable>
              </View>
            )}
          />
          <View style={styles.imageCounter}>
            <CustomText style={styles.imageCounterText}>
              {currentIndex + 1}/{item.postImages.length}
            </CustomText>
          </View>
          <View style={styles.imageIndicatorContainer}>
            {indicatorIndices.map(idx => {
              const isActive = idx === currentIndex;
              const distance = Math.abs(currentIndex - idx);
              const clampedDistance = Math.min(distance, 3);
              const baseSize = isActive ? 8 : 6;
              const size = Math.max(
                isActive ? baseSize : baseSize - clampedDistance * 1,
                isActive ? 8 : 3,
              );
              const opacity = isActive
                ? 1
                : Math.max(0.35, 0.8 - clampedDistance * 0.2);
              const color = isActive ? '#FFF' : '#CFD5DF';

              return (
                <View key={idx} style={styles.imageIndicatorDotWrapper}>
                  <View
                    style={[
                      styles.imageIndicatorDot,
                      {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        opacity,
                        backgroundColor: color,
                      },
                    ]}
                  />
                </View>
              );
            })}
          </View>
        </View>
      ) : item.postImages?.length === 1 ? (
        <View style={{width: screenWidth}}>
          <Pressable onPress={handleImagePress}>
            <FastImage
              source={{uri: item.postImages[0]}}
              style={[
                styles.postImage,
                {
                  width: screenWidth,
                  aspectRatio: imageRatios[0] ?? imageRatio,
                },
              ]}
              resizeMode={FastImage.resizeMode.contain}
              onLoad={event => handleImageLoad(event, 0)}
            />
          </Pressable>
        </View>
      ) : null}

      <View style={styles.actionsRow}>
        <Pressable
          ref={likeButtonRef}
          style={styles.actionButton}
          hitSlop={8}
          disabled={showFlyingHeart || pendingLikeRef.current}
          onPress={handleLikePress}>
          <View ref={heartIconWrapperRef}>
            <HeartIcon
              size={24}
              color={liked ? '#FF5E5E' : '#333'}
              strokeWidth={2}
              filled={liked}
            />
          </View>
          <CustomText style={[styles.actionCount]}>{likes}</CustomText>
        </Pressable>
        <Pressable style={styles.actionButton} hitSlop={8}>
          <ChatCircleIcon size={24} color="#333" strokeWidth={2} />
          <CustomText style={styles.actionCount}>{comments}</CustomText>
        </Pressable>
        <Pressable style={styles.actionButton} hitSlop={8}>
          <PaperPlaneIcon size={24} color="#333" strokeWidth={2} />
          <CustomText style={styles.actionCount}>{shares}</CustomText>
        </Pressable>
        <View style={{flex: 1}} />
        <Pressable hitSlop={8} onPress={handleBookmarkPress}>
          <BookmarkIcon size={24} color="#333" strokeWidth={2} filled={saved} />
        </Pressable>
      </View>

      <View style={styles.contentWrapper}>
        <Pressable>
          <CustomText style={styles.contentText}>{item.content}</CustomText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    paddingTop: 10,
    paddingBottom: 30,
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  profileText: {
    flexShrink: 1,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    borderWidth: 0.5,
    borderColor: '#EEE',
  },
  nickname: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  address: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
    marginTop: 2,
  },
  moreButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  heartFlyContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  flyingHeart: {
    position: 'absolute',
  },
  postImage: {
    width: '100%',
    backgroundColor: '#f6f6f6',
    marginBottom: 10,
  },
  imageCounter: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  imageCounterText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
  },
  imageIndicatorContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 0,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignSelf: 'center',
  },
  imageIndicatorDot: {
    backgroundColor: '#CFD5DF',
  },
  imageIndicatorDotActive: {
    backgroundColor: '#FFF',
  },
  imageIndicatorDotWrapper: {
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
    marginHorizontal: 14,
    gap: 14,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  actionCount: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  hiddenIcon: {
    opacity: 0,
  },
  contentWrapper: {
    marginHorizontal: 14,
    marginTop: 2,
    gap: 2,
    position: 'relative',
  },
  contentText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    lineHeight: 22,
  },
  moreOverlay: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    paddingLeft: 8,
    backgroundColor: '#fff',
  },
  moreButtonText: {
    fontSize: 13,
    color: '#5a6f8f',
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default FeedItem;
