import React from 'react';
import Postcode from '@actbase/react-daum-postcode';
import {getLatLngFromAddress} from '../../hooks/useLocation';

const LocationSearchScreen = ({route}) => {
  const handleAddressSelect = async data => {
    try {
      const {address} = data;
      const coords = await getLatLngFromAddress(address);

      if (route.params?.onAddressSelect) {
        route.params.onAddressSelect({address, coords});
      }
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
