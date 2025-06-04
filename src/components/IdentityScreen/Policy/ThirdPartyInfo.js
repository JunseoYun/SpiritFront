import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import SKTthirdpartyinfo from './SKT/SKTthirdpartyinfo';
import KTthirdpartyinfo from './KT/KTthirdpartyinfo';
import LGUthirdpartyinfo from './LGU/LGUthirdpartyinfo';

const ThirdPartyInfo = ({route}) => {
  const {carrier} = route.params || {}; // ⭐️ carrier를 route에서 받아오기

  if (carrier === 'SKT 알뜰폰') {
    return <SKTthirdpartyinfo />;
  }
  if (carrier === 'KT 알뜰폰') {
    return <KTthirdpartyinfo />;
  }
  if (carrier === 'LG U+ 알뜰폰') {
    return <LGUthirdpartyinfo />;
  }
};

const styles = StyleSheet.create({});

export default ThirdPartyInfo;
