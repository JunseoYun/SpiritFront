import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

const Service = ({route}) => {
  const {carrier} = route.params || {}; // ⭐️ carrier를 route에서 받아오기
  return (
    <View style={{alignItems: 'center'}}>
      <Text>서비스 이용약관 동의</Text>
      {carrier && <Text style={{marginTop: 10}}>선택한 통신사: {carrier}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({});

export default Service;
