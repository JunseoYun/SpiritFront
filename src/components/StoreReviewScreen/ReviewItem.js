import React from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';

import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

const ReviewItem = ({item}) => {
  const formatDate = dateString => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const year = date.getFullYear();
    const currentYear = new Date().getFullYear();

    return year === currentYear
      ? `${date.getMonth() + 1}.${date.getDate()}`
      : `${year}.${date.getMonth() + 1}.${date.getDate()}`;
  };

  const formattedCreatedDate = formatDate(item.createdAt);
  const formattedVisitedDate = formatDate(item.visitedAt);
  return (
    <View key={item.reviewId} style={styles.reviewContainer}>
      <View style={styles.reviewHeader}>
        <Image
          source={
            item.writerAvatar
              ? {uri: item.writerAvatar}
              : require('../../assets/default_profile.png')
          }
          style={styles.avatar}
        />
        <View style={styles.reviewHeaderText}>
          <Text style={styles.writerName}>{item.writerNickname}</Text>
          <View style={styles.infoView}>
            <FontAwesomeIcon name="star" size={17} color="#FCC104" />
            <Text style={styles.reviewInfo}> {item.rate}</Text>
          </View>
        </View>
        {/* <Text style={styles.reviewDate}>{item.date}</Text> */}
        <Text style={styles.reviewDate}>방문 {formattedVisitedDate}</Text>
      </View>
      <Text style={styles.reviewContent}>{item.content}</Text>
      {item.imgUrlList && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {item.imgUrlList.map((image, index) => (
            <Image
              key={image || index} // 각 이미지의 고유한 key 값 설정
              source={image ? {uri: image} : null} // 이미지 URL을 바로 사용
              style={styles.reviewImage}
            />
          ))}
        </ScrollView>
      )}

      <Text style={styles.datetimeText}>리뷰 작성 {formattedCreatedDate}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    width: '100%',
    textAlign: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderColor: '#E7E7E7',
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 40,
    marginRight: 10,
  },
  reviewHeaderText: {
    flex: 1,
    justifyContent: 'center',
  },
  writerName: {
    fontWeight: '600',
    fontSize: 17,
    color: '#333',
  },
  infoView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  reviewInfo: {
    fontSize: 15,
    color: '#616161',
    fontWeight: '500',
  },
  reviewDate: {
    fontSize: 14,
    color: '#828282',
    fontWeight: '500',
    paddingBottom: 16,
  },
  reviewContent: {
    fontSize: 15,
    marginVertical: 15,
    marginLeft: 3,
    color: '#333',
    textAlign: 'left',
    alignSelf: 'flex-start',
    fontWeight: '500',
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 7,
    marginRight: 7,
  },
  datetimeText: {
    color: '#999',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 10,
    marginLeft: 3,
  },
  imageScrollView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ReviewItem;
