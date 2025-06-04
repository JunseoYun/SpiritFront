import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import SKTthirdpartyinfo from './SKT/SKTthirdpartyinfo';
import KTthirdpartyinfo from './KT/KTthirdpartyinfo';
import LGUthirdpartyinfo from './LGU/LGUthirdpartyinfo';

const ThirdPartyInfo = ({route}) => {
  const {carrier} = route.params || {}; // ⭐️ carrier를 route에서 받아오기

  if (carrier === 'SKT 알뜰폰') {
    return (
      <View style={styles.conatiner}>
        <SKTthirdpartyinfo />
      </View>
    );
  }
  if (carrier === 'KT 알뜰폰') {
    return (
      <View style={styles.conatiner}>
        <KTthirdpartyinfo />
      </View>
    );
  }
  if (carrier === 'LG U+ 알뜰폰') {
    return (
      <View style={styles.conatiner}>
        <LGUthirdpartyinfo />
      </View>
    );
  }
};

const styles = StyleSheet.create({
  conatiner: {
    flex: 1,
    backgroundColor: '#FFF',
  },
});

export default ThirdPartyInfo;
