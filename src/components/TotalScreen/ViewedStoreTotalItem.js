import React, {useState, useEffect} from 'react';
import {View, Text, Pressable, ImageBackground, StyleSheet} from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import CustomText from '../../utils/CustomText';

const ViewedStoreTotalItem = ({store, navigation, location}) => {
  const {translateCategory} = useCategoryTranslation();
  const handlePress = () => {
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {storeId: store.id},
    });
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.StoreInfo}>
        <ImageBackground
          source={
            store.mainImgUrl
              ? {uri: store.mainImgUrl} // ✅ 네트워크 이미지
              : require('../../assets/default_store2.png') // ✅ 로컬 이미지
          }
          style={styles.backimage}
          imageStyle={styles.backimagestyle}>
          {/* ✅ 영업 종료 표시 */}
        </ImageBackground>
        <View style={styles.StoreTextView}>
          <View style={styles.StoreScore}>
            {store.categories.slice(0, 3).map((category, index) => (
              <CustomText key={index} style={styles.StoreCategory}>
                {translateCategory(category)}
              </CustomText>
            ))}
          </View>
          <View style={styles.StoreTitleView}>
            <CustomText
              style={styles.StoreTitle}
              numberOfLines={1}
              ellipsizeMode="tail">
              {store.name}
            </CustomText>
          </View>
          <View style={{marginTop: 3}}>
            <CustomText
              style={{
                maxWidth: '95%',
                color: '#555',
                fontFamily: 'Pretendard-Medium',
              }}>
              {store.locationDto.address}
            </CustomText>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  StoreInfo: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignSelf: 'center',
    marginHorizontal: 22,
    marginVertical: 11,
  },
  backimage: {
    width: 110,
    height: 110,
    borderRadius: 10,
    borderRadius: 10,
  },
  backimagestyle: {
    borderRadius: 7,
  },
  StoreTextView: {
    marginLeft: 10,
    flex: 1,
  },
  StoreTitleView: {
    flexDirection: 'row',
    marginTop: 3,
  },
  StoreTitle: {
    maxWidth: '90%',
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#111',
  },
  StoreScore: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  StoreCategory: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#767676',
    marginRight: 5,
  },
  imageStyle: {
    alignSelf: 'center',
    width: 15,
    height: 15,
    marginRight: 3,
  },
});

export default ViewedStoreTotalItem;
