import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import SKTcarrieruse from './SKT/SKTcarrieruse';
import KTcarrieruse from './KT/KTcarrieruse';
import LGUcarrieruse from './LGU/LGUcarrieruse';

const CarrierUse = ({route}) => {
  const {carrier} = route.params || {}; // carrier 받기

  // ⭐️ SKT 또는 SKT 알뜰폰일 때 carrier만 보여주기
  if (carrier === 'SKT' || carrier === 'SKT 알뜰폰') {
    return <SKTcarrieruse />;
  }
  if (carrier === 'KT' || carrier === 'KT 알뜰폰') {
    return <KTcarrieruse />;
  }
  if (carrier === 'LG U+' || carrier === 'LG U+ 알뜰폰') {
    return <LGUcarrieruse />;
  }
};

const styles = StyleSheet.create({});

export default CarrierUse;
