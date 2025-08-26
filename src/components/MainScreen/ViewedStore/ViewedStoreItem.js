import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import useDistance from '../../../hooks/useDistance';
import useStoreStatus from '../../../hooks/useStoreStatus';
import {useAuth} from '../../../context/AuthContext';
import {useToast} from '../../../context/ToastContext';
import FastImage from 'react-native-fast-image';

const ViewedStoreItem = ({store, location, navigation}) => {
  const handlePress = () => {
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId: store.id},
    });
  };

  return (
    <View style={{paddingHorizontal: 8}}>
      <Pressable
        onPress={handlePress}
        style={{
          backgroundColor: '#fff',
          width: 100,
          marginTop: 15,
        }}>
        {/* 이미지 + 술 배지 */}
        <ImageBackground
          source={
            store.mainImgUrl
              ? {uri: store.mainImgUrl}
              : require('../../../assets/default_store.png')
          }
          style={{
            width: 100,
            aspectRatio: 1,
            alignSelf: 'center',
          }}
          imageStyle={styles.backimagestyle}>
          {/* <View style={styles.overlay}>
            <FastImage
              source={require('../../../assets/verifyMaker.png')}
              style={styles.imageStyle}
            />
          </View> */}
        </ImageBackground>

        <Text style={styles.titletext} numberOfLines={1}>
          {store.name}
        </Text>
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
    width: 100,
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#444',
    marginTop: 6,
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
