import React from 'react';
import {View, Text, StyleSheet, Image, Pressable} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const MyReviewItem = ({review, navigation, deleteReview}) => {
  const formattedDate = new Date(review.visitedAt).toISOString().split('T')[0];

  return (
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
      <View style={styles.container}>
        <View style={styles.reviewCard}>
          <View style={styles.header}>
            <View>
              <Text style={styles.storeName}>{review.storeName}</Text>
              <Text style={styles.category}>이자카야</Text>
            </View>
            <Text style={styles.date}>{formattedDate}</Text>
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

          {review.imgUrlList.length > 0 && (
            <View style={styles.footer}>
              {review.imgUrlList.map((imgUrl, index) => (
                <Image
                  key={index}
                  source={{uri: imgUrl}}
                  style={styles.reviewImage}
                />
              ))}
            </View>
          )}
          <View style={styles.buttons}>
            <Pressable style={styles.deleteView}>
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
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
    padding: 16,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android 그림자
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  category: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#AAA',
  },
  rating: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 14,
    color: '#555',
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
    borderColor: 'gray',
    paddingHorizontal: 8,
    paddingVertical: 2,
    color: '#5F5F5F',
    fontWeight: '300',
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
