import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import ColorUtil from '../../utils/ColorUtil';
import FastImage from 'react-native-fast-image';
import CustomText from '../../utils/CustomText';

const MyReviewItem = ({review, navigation, deleteReview, updateReview}) => {
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
  const {translateCategory} = useCategoryTranslation();

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

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={goDetail} style={styles.card}>
        {/* Meta Row */}
        <View style={styles.metaRow}>
          <CustomText style={styles.category}>
            {review.categories?.length > 0
              ? review.categories.map(c => translateCategory(c)).join(' ')
              : '카테고리 없음'}
          </CustomText>

          <View style={styles.metaRight}>
            <FontAwesomeIcon
              name="star"
              size={13}
              color={'#FFC107'}
              style={{marginRight: 3}}
            />
            <CustomText style={styles.rate}>{review.rate}</CustomText>
          </View>
        </View>

        {/* Store Name */}

        <CustomText style={styles.storeName} numberOfLines={1}>
          {review.storeName}
        </CustomText>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Review Text */}
        <CustomText style={styles.reviewText}>
          {review.content || '리뷰 내용 없음'}
        </CustomText>

        {/* Images */}
        {review.imgUrlList.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingVertical: 6,
              paddingHorizontal: 18,
            }}>
            {review.imgUrlList.map((uri, idx) => (
              <Pressable key={idx} onPress={() => openImage(idx)}>
                <FastImage source={{uri}} style={styles.thumb} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Buttons + Bottom Date */}
        <View style={styles.actionRow}>
          <View style={{flexDirection: 'row'}}>
            <Pressable
              style={styles.actionBtn}
              onPress={() => updateReview(review)}>
              <CustomText style={styles.actionText}>수정</CustomText>
            </Pressable>

            <Pressable
              style={styles.actionBtn}
              onPress={() => deleteReview(review.id)}>
              <CustomText style={styles.actionText}>삭제</CustomText>
            </Pressable>
          </View>

          <CustomText style={styles.bottomDate}>{date}</CustomText>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 12,
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: '#ffffff',
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

  /* Meta */
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginHorizontal: 18,
  },

  category: {
    fontSize: 13,
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
  },

  metaRight: {
    flexDirection: 'row',
    alignItems: 'center',

    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
  },

  rate: {
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
    color: '#1D1D1D',
  },

  /* Store Name */
  storeName: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#111',
    marginHorizontal: 18,
  },

  divider: {
    backgroundColor: '#EFEFEF',
    height: 1,
    marginTop: 12,
    marginBottom: 14,
    marginHorizontal: 14,
  },

  /* Review Text */
  reviewText: {
    fontSize: 15,
    lineHeight: 23,
    color: '#1E1E1E',
    fontFamily: 'Pretendard-Regular',
    marginHorizontal: 18,
    marginBottom: 12,
  },

  /* Images */
  thumb: {
    width: 92,
    height: 92,
    borderRadius: 12,
    marginRight: 12,

    backgroundColor: '#FAFAFA',
    borderWidth: 0.6,
    borderColor: '#E6E6E6',

    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
  },

  /* Buttons + Bottom Date */
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginTop: 14,
    marginHorizontal: 18,
  },

  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 8,

    backgroundColor: '#F5F6F7',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },

  actionText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#444',
  },

  bottomDate: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#A2A2A2',
  },
});

export default MyReviewItem;
