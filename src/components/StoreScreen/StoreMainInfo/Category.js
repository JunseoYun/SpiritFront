import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import Entypo from 'react-native-vector-icons/Entypo';
import FastImage from 'react-native-fast-image';

const Category = ({
  handleEdit,
  storedata,
  isUpdate,
  translateCategory,
  isOwner,
}) => {
  return (
    <>
      {isUpdate ? (
        <TouchableOpacity
          style={styles.Storesubtitleview}
          onPress={
            isUpdate
              ? () => handleEdit('categories', storedata?.categories)
              : null
          }>
          {Array.isArray(storedata?.categories) &&
            storedata?.categories.map((category, index) => (
              <View key={index} style={styles.categoryWrapper}>
                <Text style={styles.Storesubtitle}>
                  {translateCategory(category)}
                </Text>
                {index < storedata.categories.length - 1 && (
                  <View style={styles.verticalLine} />
                )}
              </View>
            ))}
          <View style={{right: 30, position: 'absolute', alignSelf: 'center'}}>
            <Entypo name="chevron-small-right" size={25} color="#333" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.Storesubtitleview}>
          {isOwner != null && (
            <FastImage
              source={require('../../../assets/verifyMaker.png')}
              style={styles.imageStyle}
            />
          )}
          {Array.isArray(storedata?.categories) &&
            storedata?.categories.map((category, index) => (
              <Text key={index} style={styles.Storesubtitle}>
                {translateCategory(category)}
              </Text>
            ))}
        </View>
      )}
    </>
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
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    marginRight: 7,
    fontFamily: 'Pretendard-Regular',
  },
  imageStyle: {
    alignSelf: 'center',
    width: 20,
    height: 20,
    marginRight: 5,
  },
});

export default Category;
