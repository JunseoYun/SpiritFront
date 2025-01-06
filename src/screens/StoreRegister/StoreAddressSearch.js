import React, {useState} from 'react';
import {Text, View} from 'react-native';
import Postcode from '@actbase/react-daum-postcode';
import { getLatLngFromAddress } from '../../hooks/useLocation';

const StoreAddressSearch = ({navigation}) => {


  const handleAddressSelect = async data => {

    try {
      const {address} = data;
      const coords = await getLatLngFromAddress(address);
      navigation.navigate('StoreAddScreen', {
        address: address,
        coords: coords,
      });
    } catch (error) {
      console.error('에러 발생:', error);
    }
  };


  return (
    <Postcode
      style={{flex: 1, width: '100%', zIndex: 999}}
      jsOptions={{animation: true}}
      onSelected={handleAddressSelect}
    />
  );
};

export default StoreAddressSearch;
