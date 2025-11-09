import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

import FastImage from 'react-native-fast-image';
import ColorUtil from '../../../utils/ColorUtil';

const Category = ({categories, translateCategory, isOwner, isMoods}) => {
  if (categories === null) {
    return;
  }

  return (
    <View style={[styles.Storesubtitleview, isMoods && {marginTop: 10}]}>
      {isOwner != null && (
        <FastImage
          source={require('../../../assets/verifyMaker.png')}
          style={styles.imageStyle}
        />
      )}
      {Array.isArray(categories) &&
        categories?.map((category, index) => (
          <Text key={index} style={styles.Storesubtitle}>
            {translateCategory(category)}
          </Text>
        ))}
    </View>
  );
};

const styles = StyleSheet.create({
  Storesubtitleview: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 20,
  },
  Storesubtitle: {
    fontSize: 13,
    color: ColorUtil.subText,
    textAlign: 'center',
    marginRight: 7,
    fontFamily: 'Pretendard-Regular',
  },
  imageStyle: {
    alignSelf: 'center',
    width: 18,
    height: 18,
    marginRight: 5,
  },
});

export default Category;
