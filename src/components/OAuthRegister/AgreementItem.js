import React from 'react';
import {View, Text, TouchableOpacity, Pressable} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const AgreementItem = ({onPress, checked, text, onInfoPress}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 5,
        marginHorizontal: 20,
        marginVertical: 20,
      }}>
      <TouchableOpacity
        onPress={onPress}
        style={{flexDirection: 'row', alignItems: 'center'}}>
        <Entypo
          name="check"
          size={25}
          color={checked ? '#16BBFF' : '#E7E7E7'}
        />
        <Text
          style={{
            fontSize: 15,
            color: '#333',
            fontWeight: '600',
            marginLeft: 10,
          }}>
          {text}
        </Text>
      </TouchableOpacity>
      <Pressable onPress={onInfoPress}>
        <Entypo name="chevron-small-right" size={25} color="#999" />
      </Pressable>
    </View>
  );
};

export default AgreementItem;
