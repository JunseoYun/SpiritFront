import React from 'react';

import {View, Text, StyleSheet, Pressable} from 'react-native';
import FastImage from 'react-native-fast-image';

import Entypo from 'react-native-vector-icons/Entypo';

const Review = ({navigation, storeData}) => {
  return (
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
        <View style={styles.reviewRateView}>
          <Text style={styles.reviewRatetext}>{storeData?.rate}</Text>
          <Text style={styles.reviewtext}>({storeData?.reviewCount})</Text>
        </View>
        <Entypo
          name="chevron-right"
          size={17}
          color="#333"
          style={styles.reviewIcon}
        />
      </View>
    </Pressable>
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
    padding: 5,
    height: 17,
    width: 17,
    marginRight: 5,
  },
  reviewView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  reviewRateView: {
    flexDirection: 'row',
  },
  reviewRatetext: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 15,
    color: '#333',
    marginRight: 2,
  },

  reviewtext: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 15,
    color: '#333',
  },
  reviewIcon: {
    paddingTop: 4,
    marginLeft: 3,
  },
});

export default Review;
