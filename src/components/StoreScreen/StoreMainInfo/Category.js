import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import Entypo from 'react-native-vector-icons/Entypo';

const Category = ({handleEdit, storedata, isUpdate, translateCategory}) => {
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
});

export default Category;
