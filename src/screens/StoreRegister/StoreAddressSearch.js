import React from 'react';
import Postcode from '@actbase/react-daum-postcode';
import {getLatLngFromAddress} from '../../hooks/useLocation';

const StoreAddressSearch = ({navigation, route}) => {
  // `route` 추가
  const handleAddressSelect = async data => {
    try {
      const address = data.roadAddress || data.autoRoadAddress;
      const coords = await getLatLngFromAddress(address);

      // `route.params?.onAddressSelect`가 있을 경우에만 호출
      if (route.params?.onAddressSelect) {
        route.params.onAddressSelect({address, coords});
      }

      // 이전 화면으로 돌아가기
      navigation.goBack();
    } catch (error) {
    }
  };

  return (
    <Postcode
      style={{flex: 1, width: '100%', zIndex: 999}}
      jsOptions={{
        animation: true,
        autoMapping: true, // ✅ 자동 도로명 매핑 활성화
      }}
      onSelected={handleAddressSelect}
    />
  );
};

export default StoreAddressSearch;
