import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

const PersonalInfo = ({route}) => {
  const {carrier} = route.params || {}; // ⭐️ carrier를 route에서 받아오기
  if (carrier === 'SKT' || carrier === 'SKT 알뜰폰') {
    return (
      <View style={{alignItems: 'center', marginTop: 20}}>
        <Text>SK</Text>
      </View>
    );
  }
  if (carrier === 'KT' || carrier === 'KT 알뜰폰') {
    return (
      <View style={{alignItems: 'center', marginTop: 20}}>
        <Text>KT</Text>
      </View>
    );
  }
  if (carrier === 'LG U+' || carrier === 'LG U+ 알뜰폰') {
    return (
      <View style={{alignItems: 'center', marginTop: 20}}>
        <Text>KT</Text>
      </View>
    );
  }
};

const styles = StyleSheet.create({});

export default PersonalInfo;
