import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const MyReview = () => {
  return (
    <View style={styles.container}>
      {/* 리뷰 카드 1 */}
      <View style={styles.reviewCard}>
        <View style={styles.header}>
          <View>
            <Text style={styles.storeName}>땀땀 신논현점</Text>
            <Text style={styles.category}>이자카야</Text>
          </View>
          <Text style={styles.date}>24.07.18</Text>
        </View>
        <View style={styles.rating}>
          {[...Array(5)].map((_, index) => (
            <FontAwesomeIcon
              key={index}
              name="star"
              size={18}
              color={index < 5 ? '#FFC107' : '#E0E0E0'}
            />
          ))}
        </View>
        <Text style={styles.reviewText}>
          맛있게 잘 먹었어요! 간단하게 회식갈때 좋은 것 같아요! 다음에 또 재방문
          할께요 ㅎㅎ
        </Text>
        <View style={styles.footer}>
          <Image
            source={require('../../assets/kim.png')}
            style={styles.reviewImage}
          />
        </View>
        <View style={styles.deleteView}>
          <Text style={styles.deleteText}>삭제</Text>
        </View>
      </View>

      {/* 리뷰 카드 2 */}
      <View style={styles.reviewCard}>
        <View style={styles.header}>
          <View>
            <Text style={styles.storeName}>비어룸</Text>
            <Text style={styles.category}>호프</Text>
          </View>
          <Text style={styles.date}>24.05.17</Text>
        </View>
        <View style={styles.rating}>
          {[...Array(4)].map((_, index) => (
            <FontAwesomeIcon
              key={index}
              name="star"
              size={18}
              color={index < 4 ? '#FFC107' : '#E0E0E0'}
            />
          ))}
        </View>
        <Text style={styles.reviewText}>
          안주 가성비 좋았어요 장소는 조금 시끄러웠지만 안주는 good 맥주 종류
          다양 시켰던 메뉴 굿
        </Text>
        <View style={styles.footer}></View>
        <View style={styles.deleteView}>
          <Text style={styles.deleteText}>삭제</Text>
        </View>
      </View>
    </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  deleteView: {
    marginTop: 12,
    alignItems: 'flex-start',
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

export default MyReview;
