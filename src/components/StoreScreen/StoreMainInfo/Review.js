import React from 'react';

import {View, Text, StyleSheet} from 'react-native';

import Entypo from 'react-native-vector-icons/Entypo';

const Review = ({isUpdate, storedata}) => {
  return (
    <>
      {!isUpdate && (
        <View style={styles.ReviewView}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Entypo name="star" size={20} color="#FCC104" />
            <Text style={styles.reviewRatetext}> {storedata?.storeRate}</Text>
          </View>
          <Text style={styles.reviewtext}>
            고객 리뷰 {storedata?.reviewCount}
          </Text>
          <Text style={styles.reviewtext}>찜 {storedata?.likeCount}</Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  ReviewView: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 7,
    marginHorizontal: 18,
  },
  reviewRatetext: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  reviewtext: {
    fontWeight: '400',
    fontSize: 16,
    color: '#5F5F5F',
    marginLeft: 10,
  },
});

export default Review;
