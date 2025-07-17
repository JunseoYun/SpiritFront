import React from 'react';

import {View, Text, StyleSheet, Pressable} from 'react-native';
import FastImage from 'react-native-fast-image';

import Entypo from 'react-native-vector-icons/Entypo';

const Review = ({navigation, isUpdate, storeData}) => {
  return (
    <>
      {!isUpdate && (
        <Pressable
          onPress={() => {
            navigation.navigate('StoreStack', {
              screen: 'StoreReviewScreen',
              params: {
                storeId: storeData.id,
                storename: storeData.name,
                isOwner: storeData.isOwner,
              },
            });
          }}
          style={styles.ReviewView}>
          <View style={styles.reviewView}>
            <FastImage
              style={styles.iconStar}
              source={require('../../../assets/icon-star.png')}
              resizeMode={FastImage.resizeMode.cover}></FastImage>
            <Text style={styles.reviewRatetext}> {storeData?.rate}</Text>
            <Text style={styles.reviewDotText}>•</Text>
            <Text style={styles.reviewtext}>
              리뷰 {storeData?.reviewCount}개
            </Text>
            <Entypo
              name="chevron-right"
              size={17}
              color="#333"
              style={styles.reviewIcon}
            />
          </View>
          {/* <Text style={styles.reviewtext}>고객 리뷰</Text>
          <Text style={styles.reviewtext}>찜 {storedata?.likeCount}</Text> */}
        </Pressable>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  ReviewView: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    marginHorizontal: 18,
  },
  iconStar: {
    justifyContent: 'space-between',
    padding: 10,
    height: 20,
    width: 20,
  },
  reviewView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  reviewRatetext: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#181A1A',
  },
  reviewDotText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
    color: '#E0E0E0',
    marginHorizontal: 3,
  },
  reviewtext: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#181A1A',
  },
  reviewIcon: {
    marginLeft: 3,
  },
});

export default Review;
