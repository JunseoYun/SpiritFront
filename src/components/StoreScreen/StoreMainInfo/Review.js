import React from 'react';

import {View, Text, StyleSheet, Pressable} from 'react-native';
import FastImage from 'react-native-fast-image';

import Entypo from 'react-native-vector-icons/Entypo';
import CustomText from '../../../utils/CustomText';

const Review = ({navigation, storeData}) => {
  return (
    <Pressable
      onPress={() => {
        navigation.navigate('StoreStack', {
          screen: 'StoreReviewScreen',
          params: {
            storeId: storeData.id,
            storename: storeData.name,
            storeAddress:
              storeData?.locationDto?.address ?? storeData?.address ?? '',
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
          <CustomText style={styles.reviewRatetext}>
            {storeData?.rate}
          </CustomText>
          <CustomText style={styles.reviewtext}>
            ({storeData?.postCount})
          </CustomText>
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
    marginTop: 10,
    marginBottom: 5,
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
