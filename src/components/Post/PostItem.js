import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  ActionSheetIOS,
  Alert,
  DeviceEventEmitter,
  Easing,
  FlatList,
  Image,
  Dimensions,
  Platform,
  Share,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import CustomText from '../../utils/CustomText';
import FastImage from 'react-native-fast-image';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import ChatCircleIcon from '../../assets/svg/ChatCircleIcon';
import PaperPlaneIcon from '../../assets/svg/PaperPlaneIcon';
import HeartIcon from '../../assets/svg/HeartIcon';
import BookmarkIcon from '../../assets/svg/BookmarkIcon';
import ColorUtil from '../../utils/ColorUtil';
import {POST_REPORT_REASONS} from './PostReportSheet';
import PostReportBottomSheet from './PostReportBottomSheet';
import useMeasuredExpandableText from '../../utils/useMeasuredExpandableText';
import {get_store_share} from '../../api/storeApi';
import {PostSave} from '../../api/postApi';
import {getGlobalShowAlert} from '../../context/CustomAlertContext';
import {useNavigation} from '@react-navigation/native';
import formatRelativeTime from '../../utils/formatRelativeTime';
const defaultProfile = require('../../assets/default_profile.png');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const PostItem = ({
  item,
  isCentered = false,
  contentMaxLines = 2,
  fixedMediaHeight,
  onCommentPress,
  onContentMeasured,
  onPrimaryImageLoad,
  initialImageRatio,
  onEditPress,
  onDeletePress,
  onSavedChange,
  isWriter = false,
  hideStoreBadge = false,
  showRatingInTitleCycle = false,
}) => {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get('window').width;
  const profileSource = item.profileImage
    ? {uri: item.profileImage}
    : defaultProfile;
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(item.likes ?? 0);
  const [saved, setSaved] = useState(
    Boolean(item?.saved ?? item?.isSaved ?? false),
  );

  const comments = item.comments ?? 0;
  const [shareCount, setShareCount] = useState(item.shares ?? 0);
  const [titleCycleIndex, setTitleCycleIndex] = useState(0);
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
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedReportReason, setSelectedReportReason] = useState(
    POST_REPORT_REASONS[0],
  );
  const reportSheetRef = useRef(null);
  const badgeAnim = useRef(new Animated.Value(isCentered ? 1 : 0)).current;
  const badgeDelayRef = useRef(null);
  const HEART_SIZE = 32;
  const HEART_END_OFFSET_X = 0;
  const pendingLikeRef = useRef(false);
  const pendingSaveRef = useRef(false);
  const READ_MORE_LABEL = '…더보기';
  const primaryImageLoadedRef = useRef(false);

  const {
    contentForRender,
    handleTextLayout: handleContentLayout,
    isExpandable: isContentExpandable,
    hasMeasured: hasContentMeasured,
    toggleExpanded: toggleContentExpanded,
  } = useMeasuredExpandableText({
    text: item.content,
    maxLines: contentMaxLines,
    readMoreLabel: READ_MORE_LABEL,
    readMoreStyle: styles.moreButtonText,
  });
  const contentMeasuredRef = useRef(false);

  const ratingValue =
    item?.rate ?? item?.rating ?? item?.storeRate ?? item?.storeRating ?? null;
  const hasRating =
    ratingValue !== null && ratingValue !== undefined && ratingValue !== '';
  const fallbackPlace = item?.place ?? item?.__sourceReview?.place ?? '';
  const fallbackCreatedAt =
    item?.createdAt ?? item?.__sourceReview?.createdAt ?? null;
  const formattedCreatedAt = fallbackCreatedAt
    ? formatRelativeTime(fallbackCreatedAt)
    : '';
  const hasStoreIdentity = Boolean(item?.storeId) || Boolean(item?.name);
  const formattedRating = useMemo(() => {
    if (!hasRating) {
      return '';
    }
    const numeric = Number(ratingValue);
    if (!Number.isFinite(numeric)) {
      return String(ratingValue);
    }
    return numeric % 1 === 0 ? numeric.toFixed(0) : numeric.toFixed(1);
  }, [hasRating, ratingValue]);
  const titleCycleItems = useMemo(() => {
    const items = [];
    if (!hasStoreIdentity) {
      if (fallbackPlace) {
        items.push({type: 'place', value: fallbackPlace});
      }
      if (formattedCreatedAt) {
        items.push({type: 'meta', value: formattedCreatedAt});
      }
      return items;
    }
    if (showRatingInTitleCycle) {
      if (item?.name) {
        items.push({type: 'name', value: item.name});
      }
      if (formattedCreatedAt) {
        items.push({type: 'meta', value: formattedCreatedAt});
      }
      if (hasRating) {
        items.push({type: 'rating', value: formattedRating});
      }
      return items;
    }

    if (item?.name) {
      items.push({type: 'name', value: item.name});
    }
    if (formattedCreatedAt) {
      items.push({type: 'meta', value: formattedCreatedAt});
    }
    return items;
  }, [
    fallbackPlace,
    formattedCreatedAt,
    formattedRating,
    hasStoreIdentity,
    hasRating,
    item?.name,
    item?.storeAddress,
    showRatingInTitleCycle,
  ]);
  const titleCycleLength = titleCycleItems.length;
  const hasTitleCycle = titleCycleLength > 1;

  const animateToggle = useCallback(() => {
    if (titleCycleLength < 2) {
      return;
    }
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setTitleCycleIndex(prev => (prev + 1) % titleCycleLength);
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
  }, [fadeAnim, titleCycleLength]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener('feed-more-menu-close', () => {
      setShowMoreMenu(false);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    setSaved(Boolean(item?.saved ?? item?.isSaved ?? false));
  }, [item?.id, item?.isSaved, item?.saved]);

  useEffect(() => {
    if (hasContentMeasured && !contentMeasuredRef.current) {
      contentMeasuredRef.current = true;
      onContentMeasured?.(item);
      return;
    }

    if (!hasContentMeasured && contentMeasuredRef.current) {
      contentMeasuredRef.current = false;
    }
  }, [hasContentMeasured, item, onContentMeasured]);

  const openReportModal = useCallback(() => {
    setShowMoreMenu(false);
    setSelectedReportReason(POST_REPORT_REASONS[0]);
    reportSheetRef.current?.present();
  }, []);

  const handleEditPress = useCallback(() => {
    setShowMoreMenu(false);
    if (onEditPress) {
      onEditPress(item);
      return;
    }
    Alert.alert('수정하기', '수정 화면으로 이동하도록 연결해주세요.');
  }, [item, onEditPress]);

  const handleDeletePress = useCallback(() => {
    setShowMoreMenu(false);
    const confirmDelete = () => {
      if (onDeletePress) {
        onDeletePress(item);
        return;
      }
      Alert.alert('삭제하기', '삭제 동작을 연결해주세요.');
    };

    const showAlert = getGlobalShowAlert();
    if (showAlert) {
      showAlert({
        title: '글 삭제하기',
        message: '정말 삭제할까요?',
        type: 'delete',
        onConfirm: confirmDelete,
        onCancel: () => {},
      });
      return;
    }

    Alert.alert('삭제하기', '정말 삭제할까요?', [
      {text: '취소', style: 'cancel'},
      {text: '삭제', style: 'destructive', onPress: confirmDelete},
    ]);
  }, [item, onDeletePress]);

  const handleReportSubmit = useCallback(() => {
    reportSheetRef.current?.dismiss();
    // TODO: Hook up real report flow when available.
    setTimeout(() => {
      Alert.alert('신고하기', '신고가 접수되었습니다.');
    }, 120);
  }, []);

  const handleMorePress = useCallback(() => {
    if (Platform.OS === 'ios') {
      if (isWriter) {
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options: ['수정하기', '삭제하기', '취소'],
            cancelButtonIndex: 2,
            destructiveButtonIndex: 1,
            userInterfaceStyle: 'light',
          },
          buttonIndex => {
            if (buttonIndex === 0) {
              handleEditPress();
              return;
            }
            if (buttonIndex === 1) {
              handleDeletePress();
            }
          },
        );
        return;
      }

      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['신고하기', '취소'],
          cancelButtonIndex: 1,
          destructiveButtonIndex: 0,
          userInterfaceStyle: 'light',
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            openReportModal();
          }
        },
      );
      return;
    }

    setShowMoreMenu(prev => !prev);
  }, [handleDeletePress, handleEditPress, isWriter, openReportModal]);

  useEffect(() => {
    if (!hasTitleCycle) {
      setTitleCycleIndex(0);
      fadeAnim.setValue(1);
      return;
    }

    const id = setInterval(animateToggle, 7000);

    return () => clearInterval(id);
  }, [animateToggle, fadeAnim, hasTitleCycle]);

  useEffect(() => {
    if (titleCycleIndex >= titleCycleLength && titleCycleLength > 0) {
      setTitleCycleIndex(0);
    }
  }, [titleCycleIndex, titleCycleLength]);

  const handleLikePress = () => {
    if (showFlyingHeart || pendingLikeRef.current) {
      return;
    }
    setLiked(prev => !prev);
    setLikes(prev => prev + (liked ? -1 : 1));
  };

  const handleBookmarkPress = useCallback(async () => {
    if (!item?.id || pendingSaveRef.current) {
      return;
    }
    const nextSaved = !saved;
    setSaved(nextSaved);
    pendingSaveRef.current = true;
    try {
      await PostSave(item.id);
      onSavedChange?.(item, nextSaved);
    } catch (error) {
      setSaved(!nextSaved);
    } finally {
      pendingSaveRef.current = false;
    }
  }, [item, onSavedChange, saved]);

  const handleCommentPress = useCallback(() => {
    onCommentPress?.(item);
  }, [item, onCommentPress]);

  const handleSharePress = useCallback(async () => {
    try {
      const targetId = item?.storeId ?? item?.id;
      let shareLink = item?.shareLink;

      if (!shareLink && targetId) {
        const response = await get_store_share(targetId);
        shareLink = response?.shareLink;
      }

      const messageParts = [];
      if (item?.name) {
        messageParts.push(`${item.name}에서 한잔 어때요?`);
      }
      if (item?.storeAddress) {
        messageParts.push(item.storeAddress);
      }
      if (shareLink) {
        messageParts.push(shareLink);
      } else if (item?.content) {
        messageParts.push(item.content);
      }

      const message = messageParts.filter(Boolean).join('\n');
      if (!message) {
        Alert.alert('공유하기', '공유할 내용을 찾을 수 없어요.');
        return;
      }

      const result = await Share.share({message});
      if (result?.action === Share.sharedAction) {
        setShareCount(prev => prev + 1);
      }
    } catch (error) {
      Alert.alert('공유하기', '공유에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  }, [item]);

  const handleStoreBadgePress = useCallback(() => {
    const storeId = item?.storeId;
    if (!storeId) {
      return;
    }
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId},
    });
  }, [item?.storeId, navigation]);

  const handleProfilePress = useCallback(() => {
    const storeId = item?.storeId;
    if (!storeId) {
      return;
    }
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId},
    });
  }, [item?.storeId, navigation]);

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
    if (index === 0 && !primaryImageLoadedRef.current) {
      primaryImageLoadedRef.current = true;
      onPrimaryImageLoad?.();
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
    const seededRatio =
      typeof initialImageRatio === 'number' && initialImageRatio > 0
        ? initialImageRatio
        : null;
    setImageRatios(seededRatio ? {0: seededRatio} : {});
    setCurrentIndex(0);
    setImageRatio(seededRatio || 1);
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
  }, [initialImageRatio, item.postImages]);

  useEffect(() => {
    if (badgeDelayRef.current) {
      clearTimeout(badgeDelayRef.current);
      badgeDelayRef.current = null;
    }
    const showBadge = Boolean(item?.storeId);
    Animated.timing(badgeAnim, {
      toValue: showBadge ? 1 : 0,
      duration: 160,
      easing: showBadge ? Easing.out(Easing.quad) : Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [badgeAnim, item?.storeId]);

  const badgeStyle = useMemo(
    () => [
      styles.storeBadge,
      {
        opacity: badgeAnim,
      },
    ],
    [badgeAnim],
  );

  const cardContentStyle = useMemo(
    () => [
      styles.cardContent,
      !hasContentMeasured ? styles.cardContentHidden : null,
    ],
    [hasContentMeasured],
  );

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
              friction: 8,
              tension: 230,
              useNativeDriver: true,
            }),

            Animated.parallel([
              Animated.timing(flyingHeartPos, {
                toValue: {x: destX, y: destY},
                duration: 320,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.sequence([
                Animated.timing(flyingHeartScale, {
                  toValue: 1.85,
                  duration: 170,
                  easing: Easing.inOut(Easing.quad),
                  useNativeDriver: true,
                }),
                Animated.spring(flyingHeartScale, {
                  toValue: 1.1,
                  friction: 7,
                  tension: 140,
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
    <View
      style={styles.card}
      ref={cardRef}
      onStartShouldSetResponderCapture={() => false}>
      <View
        style={cardContentStyle}
        pointerEvents={hasContentMeasured ? 'auto' : 'none'}>
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
        {showMoreMenu ? (
          <>
            <Pressable
              style={styles.moreMenuOverlay}
              onPress={() => setShowMoreMenu(false)}
            />
            <View style={styles.moreMenu}>
              {isWriter ? (
                <>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.moreMenuItem}
                    onPress={handleEditPress}>
                    <CustomText style={styles.moreMenuItemText}>
                      수정하기
                    </CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={styles.moreMenuItem}
                    onPress={handleDeletePress}>
                    <CustomText style={styles.moreMenuItemTextDestructive}>
                      삭제하기
                    </CustomText>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={styles.moreMenuItem}
                  onPress={openReportModal}>
                  <CustomText style={styles.moreMenuItemTextDestructive}>
                    신고하기
                  </CustomText>
                </TouchableOpacity>
              )}
            </View>
          </>
        ) : null}
        <View style={styles.cardHeader}>
          <Pressable
            onPress={handleProfilePress}
            disabled={!item?.storeId || hideStoreBadge}
            hitSlop={6}
            style={styles.profileRowPressable}>
            <View style={styles.profileRow}>
              <FastImage source={profileSource} style={styles.avatar} />
              <View style={styles.profileText}>
                <CustomText style={styles.nickname}>{item.nickname}</CustomText>
                <Animated.View style={{opacity: fadeAnim}}>
                  {titleCycleItems[titleCycleIndex]?.type === 'rating' ? (
                    <View style={styles.ratingRow}>
                      <FontAwesomeIcon name="star" size={12} color="#FCC104" />
                      <CustomText style={styles.ratingText}>
                        {titleCycleItems[titleCycleIndex]?.value}
                      </CustomText>
                    </View>
                  ) : (
                    <CustomText
                      style={[
                        styles.address,
                        item?.storeId &&
                          (titleCycleItems[titleCycleIndex]?.type === 'name' ||
                            titleCycleItems[titleCycleIndex]?.type === 'meta') &&
                          styles.storeNameText,
                      ]}
                      numberOfLines={1}>
                      {titleCycleItems[titleCycleIndex]?.value ??
                        item.storeAddress ??
                        item.name}
                    </CustomText>
                  )}
                </Animated.View>
              </View>
            </View>
          </Pressable>
          <Pressable
            style={styles.moreButton}
            hitSlop={8}
            onPress={handleMorePress}>
            <Ionicons name="ellipsis-horizontal" size={18} color="#333" />
          </Pressable>
        </View>

        {item.postImages?.length > 1 ? (
          <View
            style={{
              width: screenWidth,
              position: 'relative',
              ...(fixedMediaHeight ? {height: fixedMediaHeight} : null),
            }}>
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
                <View
                  style={[
                    styles.imageWrapper,
                    {
                      width: screenWidth,
                      ...(fixedMediaHeight ? {height: fixedMediaHeight} : null),
                    },
                  ]}>
                  <Pressable onPress={handleImagePress}>
                    <FastImage
                      source={{uri}}
                      style={[
                        styles.postImage,
                        {
                          width: screenWidth,
                          ...(fixedMediaHeight
                            ? {height: fixedMediaHeight}
                            : {aspectRatio: imageRatios[index] ?? imageRatio}),
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
            {!hideStoreBadge && item?.storeId ? (
              <AnimatedPressable
                style={badgeStyle}
                hitSlop={6}
                onPress={handleStoreBadgePress}>
                <Ionicons name="storefront" size={14} color="#FFF" />
              </AnimatedPressable>
            ) : null}
          </View>
        ) : item.postImages?.length === 1 ? (
          <View
            style={{
              width: screenWidth,
              ...(fixedMediaHeight ? {height: fixedMediaHeight} : null),
            }}>
            <Pressable onPress={handleImagePress}>
              <FastImage
                source={{uri: item.postImages[0]}}
                style={[
                  styles.postImage,
                  {
                    width: screenWidth,
                    ...(fixedMediaHeight
                      ? {height: fixedMediaHeight}
                      : {aspectRatio: imageRatios[0] ?? imageRatio}),
                  },
                ]}
                resizeMode={FastImage.resizeMode.contain}
                onLoad={event => handleImageLoad(event, 0)}
              />
            </Pressable>
            {!hideStoreBadge && item?.storeId ? (
              <AnimatedPressable
                style={badgeStyle}
                hitSlop={6}
                onPress={handleStoreBadgePress}>
                <Ionicons name="storefront" size={14} color="#FFF" />
              </AnimatedPressable>
            ) : null}
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
          <Pressable
            style={styles.actionButton}
            hitSlop={8}
            onPress={handleCommentPress}>
            <ChatCircleIcon size={24} color="#333" strokeWidth={2} />
            <CustomText style={styles.actionCount}>{comments}</CustomText>
          </Pressable>
          {/* <Pressable
          style={styles.actionButton}
          hitSlop={8}
          onPress={handleSharePress}>
          <PaperPlaneIcon size={24} color="#333" strokeWidth={2} />
          <CustomText style={styles.actionCount}>{shareCount}</CustomText>
        </Pressable> */}
          <View style={{flex: 1}} />
          <Pressable hitSlop={8} onPress={handleBookmarkPress}>
            <BookmarkIcon
              size={24}
              color="#333"
              strokeWidth={2}
              filled={saved}
            />
          </Pressable>
        </View>

        <View style={styles.contentWrapper}>
          <Pressable
            disabled={!isContentExpandable}
            onPress={toggleContentExpanded}>
            <CustomText
              style={styles.contentText}
              onTextLayout={handleContentLayout}>
              {contentForRender}
            </CustomText>
          </Pressable>
        </View>
        <PostReportBottomSheet
          sheetRef={reportSheetRef}
          reasons={POST_REPORT_REASONS}
          selectedReason={selectedReportReason}
          onSelectReason={setSelectedReportReason}
          onSubmit={handleReportSubmit}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    // paddingTop: 10,
    paddingBottom: 40,
    position: 'relative',
  },
  cardContent: {
    position: 'relative',
  },
  cardContentHidden: {
    opacity: 0,
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
  profileRowPressable: {
    flexShrink: 1,
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
  storeNameText: {
    color: '#333',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
  },
  moreButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  moreMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  moreMenu: {
    position: 'absolute',
    right: 0,
    top: 70,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    minWidth: 140,
    zIndex: 20,
  },
  moreMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  moreMenuItemText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    textAlign: 'center',
  },
  moreMenuItemTextDestructive: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#E03131',
    textAlign: 'center',
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
  imageWrapper: {
    position: 'relative',
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
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
    lineHeight: 22,
  },
  storeBadge: {
    position: 'absolute',
    bottom: 24,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // 60% 불투명
    borderRadius: 16,
    padding: 7,
  },
});

export default PostItem;
