import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';
import Postcode from '@actbase/react-daum-postcode';
import {getLatLngFromAddress} from '../../hooks/useLocation';

const LocationSearchScreen = ({navigation, route}) => {
  const handleAddressSelect = async data => {
    try {
      const {address} = data;
      const coords = await getLatLngFromAddress(address);

      // `route.params?.onAddressSelect`가 있을 경우에만 호출
      if (route.params?.onAddressSelect) {
        route.params.onAddressSelect({address, coords});
      }

      // 이전 화면으로 돌아가기
      navigation.goBack();
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

export default LocationSearchScreen;
