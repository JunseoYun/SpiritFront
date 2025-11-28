import React from 'react';
import {View, Text, TouchableOpacity, Pressable} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import CustomText from '../../utils/CustomText';

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
          color={checked ? '#5CCEFF' : '#E7E7E7'}
        />
        <CustomText
          style={{
            fontSize: 15,
            color: '#181A1A',
            fontFamily: 'Pretendard-Medium',
            marginLeft: 10,
          }}>
          {text}
        </CustomText>
      </TouchableOpacity>
      <Pressable onPress={onInfoPress}>
        <Entypo name="chevron-small-right" size={25} color="#999" />
      </Pressable>
    </View>
  );
};

export default AgreementItem;
