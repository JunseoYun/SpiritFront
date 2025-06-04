import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import SKTuniquenumber from './SKT/SKTuniquenumber';
import KTuniquenumber from './KT/KTuniquenumber';
import LGUunipuenumber from './LGU/LGUunipuenumber';

const UniqueNumber = ({route}) => {
  const {carrier} = route.params || {}; // ⭐️ carrier를 route에서 받아오기

  if (carrier === 'SKT' || carrier === 'SKT 알뜰폰') {
    return <SKTuniquenumber />;
  }
  if (carrier === 'KT' || carrier === 'KT 알뜰폰') {
    return <KTuniquenumber />;
  }
  if (carrier === 'LG U+' || carrier === 'LG U+ 알뜰폰') {
    return <LGUunipuenumber />;
  }
};

const styles = StyleSheet.create({});

export default UniqueNumber;
