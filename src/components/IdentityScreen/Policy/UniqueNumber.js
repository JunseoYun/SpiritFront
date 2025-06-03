import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

const UniqueNumber = ({route}) => {
  const {carrier} = route.params || {}; // ⭐️ carrier를 route에서 받아오기

  return (
    <View style={{alignItems: 'center'}}>
      <Text>고유식별번호 처리 동의</Text>
      {carrier && <Text style={{marginTop: 10}}>선택한 통신사: {carrier}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({});

export default UniqueNumber;
