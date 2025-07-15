import React from 'react';
import {View, Text, StyleSheet, Image, Pressable} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';

const MyReviewItem = ({review, navigation, deleteReview, updateReview}) => {
  const formatDate = dateString => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    return year === currentYear
      ? `${date.getMonth() + 1}.${date.getDate()}`
      : `${year}.${date.getMonth() + 1}.${date.getDate()}`;
  };
  const formattedCreatedDate = formatDate(review.visitedAt);
  const {translateCategory} = useCategoryTranslation();

  const handleImagePress = index => {
    navigation.navigate('StoreStack', {
      screen: 'ImageViewerScreen',
      params: {
        images: review.imgUrlList,
        index: index,
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.reviewCard}>
        <Pressable
          key={review.id}
          onPress={() => {
            navigation.navigate('StoreStack', {
              screen: 'StoreMainScreen',
              params: {
                storeId: review.storeId,
              },
            });
          }}>
          <View style={styles.header}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                flex: 1,
                alignItems: 'center',
                paddingBottom: 8,
              }}>
              <Text
                style={styles.storeName}
                ellipsizeMode="tail"
                numberOfLines={1}>
                {review.storeName}
              </Text>
              <Text style={styles.date}>{formattedCreatedDate}방문</Text>
            </View>

            <View>
              <Text style={styles.category} ellipsizeMode="tail">
                {Array.isArray(review.categories) &&
                review.categories.length > 0
                  ? review.categories
                      .map(category => translateCategory(category))
                      .join(' ')
                  : '카테고리 미설정'}
              </Text>
            </View>
          </View>
          <View style={styles.rating}>
            {[...Array(5)].map((_, index) => (
              <FontAwesomeIcon
                key={index}
                name="star"
                size={18}
                color={index < review.rate ? '#FFC107' : '#E0E0E0'}
              />
            ))}
          </View>
          <Text style={styles.reviewText}>
            {review.content || '리뷰 내용 없음'}
          </Text>
        </Pressable>
        {review.imgUrlList.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {review.imgUrlList.map((imgUrl, index) => (
              <Pressable
                key={index}
                onPress={() => {
                  handleImagePress(index);
                }}>
                <Image
                  key={index}
                  source={{uri: imgUrl}}
                  style={styles.reviewImage}
                />
              </Pressable>
            ))}
          </ScrollView>
        )}
        <View style={styles.buttons}>
          <Pressable
            style={styles.deleteView}
            onPress={() => updateReview(review)}>
            <Text style={styles.deleteText}>수정</Text>
          </Pressable>
          <Pressable
            style={styles.deleteView}
            onPress={() => deleteReview(review.id)}>
            <Text style={styles.deleteText}>삭제</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    paddingHorizontal: 16,
    paddingVertical: 8,
    marginVertical: 5,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3, // Android 그림자
  },
  header: {
    flexDirection: 'column',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#181A1A',
    width: '80%',
  },
  category: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
    marginTop: 4,
  },
  date: {
    fontSize: 14,
    color: '#767676',
    fontFamily: 'Pretendard-Medium',
  },
  rating: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#181A1A',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
  },
  deleteView: {
    marginTop: 12,
    alignItems: 'flex-start',
    marginRight: 12,
  },
  deleteText: {
    borderRadius: 10,

    paddingHorizontal: 8,
    paddingVertical: 2,
    color: '#5F5F5F',
    fontFamily: 'Pretendard-Regular',
    backgroundColor: '#EFEFEF',
    paddingVertical: 5,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
});

export default MyReviewItem;
