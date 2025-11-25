import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Pressable, Dimensions} from 'react-native';
import FastImage from 'react-native-fast-image';
import CustomText from '../../common/CustomText';

const ViewedStoreItem = ({store, location, navigation}) => {
  const handlePress = () => {
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId: store.id},
    });
  };

  return (
    <View style={{paddingHorizontal: 5}}>
      <Pressable
        onPress={handlePress}
        style={{
          backgroundColor: '#fff',
          width: 100,
          marginTop: 15,
        }}>
        {/* 이미지 + 술 배지 */}
        <FastImage
          source={
            store.mainImgUrl
              ? {uri: store.mainImgUrl}
              : require('../../../assets/default_store.png')
          }
          style={{
            width: 100,
            aspectRatio: 1,
            alignSelf: 'center',
            borderRadius: 7,
          }}
          imageStyle={styles.backimagestyle}></FastImage>

        <CustomText style={styles.titletext} numberOfLines={1}>
          {store.name}
        </CustomText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  backimagestyle: {
    borderRadius: 7,
  },
  titletext: {
    textAlign: 'left',
    width: 97,
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#121212',
    marginTop: 6,
    marginLeft: 3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 5,
  },
  imageStyle: {
    width: 20,
    height: 20,
  },
});

export default ViewedStoreItem;
