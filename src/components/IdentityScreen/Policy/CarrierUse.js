import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const CarrierUse = ({route}) => {
  const {carrier} = route.params || {}; // carrier 받기

  // ⭐️ SKT 또는 SKT 알뜰폰일 때 carrier만 보여주기
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

export default CarrierUse;
