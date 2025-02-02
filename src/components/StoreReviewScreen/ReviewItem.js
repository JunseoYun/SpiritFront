import React from 'react';
import {View, Text, StyleSheet, Image, ScrollView} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const ReviewItem = ({item}) => {
  const visitedDate = new Date(item.visitedAt);
  const formattedDate = `${
    visitedDate.getMonth() + 1
  }.${visitedDate.getDate()}`;
  return (
    <View key={item.reviewId} style={styles.reviewContainer}>
      <View style={styles.reviewHeader}>
        <Image
          source={
            item.writerAvatar
              ? {uri: item.writerAvatar}
              : require('../../assets/kim.png')
          }
          style={styles.avatar}
        />
        <View style={styles.reviewHeaderText}>
          <Text style={styles.writerName}>{item.writerNickname}</Text>
          <View style={styles.infoView}>
            <Entypo name="star" size={17} color="#FCC104" />
            <Text style={styles.reviewInfo}> {item.rate}</Text>
          </View>
        </View>
        {/* <Text style={styles.reviewDate}>{item.date}</Text> */}
        <Text style={styles.reviewDate}>방문 {formattedDate}</Text>
      </View>
      <Text style={styles.reviewContent}>{item.content}</Text>

      {item.images &&
        item.images.map((image, index) => (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Image
              key={index}
              source={image ? {uri: image} : null}
              style={styles.reviewImage}
            />
          </ScrollView>
        ))}

      <Text style={styles.datetimeText}>리뷰 작성 01.20</Text>
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
    marginTop: 1,
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
});

export default ReviewItem;
