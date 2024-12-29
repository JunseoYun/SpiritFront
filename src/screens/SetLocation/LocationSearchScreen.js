import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import Postcode from '@actbase/react-daum-postcode';
import useLatLngFromAddress from '../../hooks/useLatLngFromAddress';

const LocationSearchScreen = ({ navigation }) => {
  const { coords, isLoading, error, fetchLatLng } = useLatLngFromAddress();

  const handleAddressSelect = async data => {
    try {
      const { address } = data;
      const fetchedCoords = await fetchLatLng(address); // 커스텀 훅 사용

      // 이전 화면으로 데이터 전달
      navigation.navigate('SetLocationScreen', { address, coords: fetchedCoords });
    } catch (err) {
      console.error('에러 발생:', err);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Postcode
        style={{ flex: 1, width: '100%', zIndex: 999 }}
        jsOptions={{ animation: true }}
        onSelected={handleAddressSelect}
      />
      {isLoading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={{ color: 'red' }}>에러 발생: {error.message}</Text>}
    </View>
  );
};

export default LocationSearchScreen;
