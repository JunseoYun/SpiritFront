import React from 'react';

import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

import Entypo from 'react-native-vector-icons/Entypo';

const Alcohol = ({isUpdate, storedata, handleEdit, translateAlcohol}) => {
  return (
    <>
      {isUpdate ? (
        <TouchableOpacity
          style={[styles.timeview, {marginTop: 12}]}
          onPress={
            isUpdate
              ? () => handleEdit('mainDrinkDtos', storedata?.mainDrinkDtos)
              : null
          }>
          {storedata?.mainDrinkDtos && storedata.mainDrinkDtos.length > 0 ? (
            storedata.mainDrinkDtos.map((drink, index) => (
              <Text
                key={index}
                style={[
                  styles.timetextnow,
                  {color: '#10BEFB', marginBottom: 5, marginRight: 7},
                  isUpdate && {color: '#333'},
                ]}>
                {translateAlcohol(drink.type)} {drink.price.toLocaleString()}원
              </Text>
            ))
          ) : (
            <Text style={[styles.alcoholText, {color: '#333'}]}>
              대표 주종 미설정
            </Text>
          )}
          <View style={{right: 30, position: 'absolute', alignSelf: 'center'}}>
            <Entypo name="chevron-small-right" size={25} color="#333" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.timeview}>
          {storedata?.mainDrinkDtos && storedata.mainDrinkDtos.length > 0 ? (
            storedata.mainDrinkDtos.map((drink, index) => (
              <Text
                key={index}
                style={[
                  styles.timetextnow,
                  {color: '#10BEFB', marginBottom: 5, marginRight: 7},
                  isUpdate && {color: '#333'},
                ]}>
                {translateAlcohol(drink.type)} {drink.price.toLocaleString()}원
              </Text>
            ))
          ) : (
            <Text style={[styles.alcoholText, {color: '#333'}]}>
              대표 주종 미설정
            </Text>
          )}
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
    fontWeight: 'bold',
  },
  alcoholText: {
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default Alcohol;
