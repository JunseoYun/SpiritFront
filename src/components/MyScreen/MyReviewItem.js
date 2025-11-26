import React, {useState, useRef} from 'react';
import {View, StyleSheet, Pressable, ScrollView, Animated} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FastImage from 'react-native-fast-image';
import CustomText from '../../utils/CustomText';

const MyReviewItem = ({review, navigation, deleteReview, updateReview}) => {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [shouldCollapseContent, setShouldCollapseContent] = useState(false);
  const dropdownAnim = useRef(new Animated.Value(0)).current;

  const goDetail = () => {
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId: review.storeId},
    });
  };

  const openImage = index => {
    navigation.navigate('StoreStack', {
      screen: 'ImageViewerScreen',
      params: {images: review.imgUrlList, index},
    });
  };

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    const year = d.getFullYear();
    const currentYear = new Date().getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return year === currentYear
      ? `${mm}.${dd}`
      : `${String(year).slice(-2)}.${mm}.${dd}`;
  };

  const date = formatDate(review.visitedAt);

  // ⭐️ 별점 렌더링 (5점 만점)
  const renderStars = rate => {
    return (
      <View style={{flexDirection: 'row', marginHorizontal: 18}}>
        {[1, 2, 3, 4, 5].map(star => (
          <FontAwesomeIcon
            key={star}
            name="star"
            size={14}
            color={rate >= star ? '#FFC107' : '#D4D4D4'}
            style={{marginRight: 2}}
          />
        ))}
      </View>
    );
  };

  const toggleDropdown = () => {
    if (dropdownVisible) {
      Animated.timing(dropdownAnim, {
        toValue: 0,
        duration: 160,
        useNativeDriver: true,
      }).start(() => setDropdownVisible(false));
    } else {
      setDropdownVisible(true);
      Animated.timing(dropdownAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  };

  const dropdownTranslateY = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, 0],
  });

  const dropdownScale = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const onReviewTextLayout = e => {
    if (shouldCollapseContent) {
      return;
    }
    if (e?.nativeEvent?.lines?.length > 2) {
      setShouldCollapseContent(true);
    }
  };

  const toggleContentCollapse = () => {
    if (!shouldCollapseContent) {
      return;
    }
    setIsContentExpanded(prev => !prev);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        {/* 🔥 (1) 카테고리 제거 → 대신 상단에 StoreName + 화살표 + 별점 */}
        <View style={styles.topBar}>
          <Pressable
            onPress={goDetail}
            style={{flexDirection: 'row', alignItems: 'center'}}>
            <CustomText style={styles.storeName} numberOfLines={1}>
              {review.storeName}
            </CustomText>
            <FontAwesomeIcon
              name="angle-right"
              size={20}
              color="#333"
              style={{marginLeft: 7}}
            />
          </Pressable>

          <View style={styles.actionWrapper}>
            <Pressable
              onPress={toggleDropdown}
              style={styles.menuButton}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <Ionicons name="ellipsis-vertical" size={14} color="#333" />
            </Pressable>

            {dropdownVisible && (
              <Pressable
                style={styles.backdrop}
                onPress={toggleDropdown}
                accessibilityLabel="Close menu"
              />
            )}

            {dropdownVisible && (
              <Animated.View
                style={[
                  styles.dropdown,
                  {
                    opacity: dropdownAnim,
                    transform: [
                      {translateY: dropdownTranslateY},
                      {scale: dropdownScale},
                    ],
                  },
                ]}>
                <Pressable
                  style={[styles.dropdownButton]}
                  onPress={() => {
                    toggleDropdown();
                    updateReview(review);
                  }}>
                  <CustomText style={styles.dropdownButtonText}>
                    수정하기
                  </CustomText>
                </Pressable>
                <View style={styles.dropdownDivider} />
                <Pressable
                  style={[styles.dropdownButton]}
                  onPress={() => {
                    toggleDropdown();
                    deleteReview(review.id);
                  }}>
                  <CustomText
                    style={[
                      styles.dropdownButtonText,
                      styles.dropdownButtonDangerText,
                    ]}>
                    삭제하기
                  </CustomText>
                </Pressable>
              </Animated.View>
            )}
          </View>
        </View>
        {renderStars(review.rate)}
        {/* Divider */}
        <View style={styles.divider} />

        {/* Review Text */}
        <Pressable
          onPress={toggleContentCollapse}
          disabled={!shouldCollapseContent}
          hitSlop={{top: 4, bottom: 4}}>
          <CustomText
            style={styles.reviewText}
            numberOfLines={
              isContentExpanded || !shouldCollapseContent ? undefined : 2
            }
            ellipsizeMode="tail"
            onTextLayout={onReviewTextLayout}>
            {review.content || '리뷰 내용 없음'}
          </CustomText>
        </Pressable>
        {shouldCollapseContent && (
          <Pressable
            onPress={toggleContentCollapse}
            hitSlop={{top: 4, bottom: 4}}
            style={styles.contentToggleWrapper}>
            <CustomText style={styles.contentToggleText}>
              {isContentExpanded ? '닫기' : '더보기'}
            </CustomText>
          </Pressable>
        )}

        {/* Images */}
        {review.imgUrlList.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{paddingVertical: 6, paddingHorizontal: 18}}>
            {review.imgUrlList.map((uri, idx) => (
              <Pressable key={idx} onPress={() => openImage(idx)}>
                <FastImage source={{uri}} style={styles.thumb} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* 하단 행 — ⭐️ 수정/삭제 대신 날짜 표시 */}
        <View style={styles.bottomRow}>
          <CustomText style={styles.bottomDate}>{date}</CustomText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {marginTop: 12, paddingHorizontal: 16},
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    borderWidth: 1,
    borderColor: '#F1F1F3',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: {width: 0, height: 3},
    elevation: 0.3,
  },

  /* ⭐ Top Layout 변경 */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginBottom: 6,
  },

  storeName: {fontSize: 17, fontFamily: 'Pretendard-SemiBold', color: '#111'},
  actionWrapper: {position: 'relative', justifyContent: 'center'},
  menuButton: {},

  divider: {
    height: 1,
    backgroundColor: '#EFEFEF',
    marginVertical: 14,
    marginHorizontal: 14,
  },

  reviewText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#1E1E1E',
    fontFamily: 'Pretendard-Regular',
    marginHorizontal: 18,
    marginBottom: 12,
  },
  contentToggleWrapper: {
    alignSelf: 'flex-start',
    marginTop: -4,
    marginBottom: 12,
    marginHorizontal: 18,
  },
  contentToggleText: {
    fontSize: 13,
    color: '#7A7A7A',
    fontFamily: 'Pretendard-Medium',
  },

  thumb: {
    width: 92,
    height: 92,
    borderRadius: 12,
    marginRight: 12,
    backgroundColor: '#FAFAFA',
    borderWidth: 0.6,
    borderColor: '#E6E6E6',
  },

  bottomRow: {marginTop: 4, marginHorizontal: 18},
  bottomDate: {fontSize: 12, color: '#A2A2A2'},
  dropdown: {
    position: 'absolute',
    top: 20,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.12,
    shadowRadius: 16,
    zIndex: 999,
    borderWidth: 1,
    borderColor: '#EFEFF3',
    gap: 10,
    minWidth: 90,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    bottom: -1000,
    left: -1000,
    right: -1000,
    backgroundColor: 'transparent',
    zIndex: 998,
  },
  dropdownButton: {
    alignSelf: 'stretch',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 10,
  },

  dropdownButtonText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
  },
  dropdownButtonDangerText: {
    color: '#D62828',
  },
  dropdownDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
  },
});

export default MyReviewItem;
