import React from 'react';

import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import Entypo from 'react-native-vector-icons/Entypo';

const Alcohol = ({
  isUpdate,
  storeDrinkDtos,
  translateAlcohol,
  storeupdatedrink,
}) => {
  const drinkText =
    storeDrinkDtos && storeDrinkDtos.length > 0
      ? storeDrinkDtos
          .map(
            drink =>
              `${translateAlcohol(
                drink.type,
              )} ${drink.price.toLocaleString()}원`,
          )
          .join('   ')
      : null;

  return (
    <>
      {isUpdate ? (
        <TouchableOpacity
          style={[styles.timeview, {marginTop: 12}]}
          onPress={storeupdatedrink}>
          <Text style={[styles.timetextnow, {color: '#333'}]}>
            {drinkText || '대표 주종 미설정'}
          </Text>
          <View style={{right: 30, position: 'absolute', alignSelf: 'center'}}>
            <Entypo name="chevron-small-right" size={25} color="#333" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.timeview}>
          <Text style={[styles.timetextnow, {color: '#5CCEFF'}]}>
            {drinkText || '대표 주종 미설정'}
          </Text>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  timeview: {
    flexDirection: 'row',
    width: '100%',
    marginHorizontal: 18,
    alignItems: 'center',
  },
  timetextnow: {
    fontSize: 15,
    width: '85%',
    fontFamily: 'Pretendard-Bold',
  },
  alcoholText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Bold',
  },
});

export default Alcohol;
