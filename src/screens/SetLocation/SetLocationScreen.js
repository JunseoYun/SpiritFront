import React, { useState, useEffect } from 'react';
import { Text, SafeAreaView, ScrollView, Pressable } from 'react-native';

const SetLocationScreen = ({ navigation, route }) => {
  const [address, setAddress] = useState('');
  const [coords, setCoords] = useState(null);

  // 이전 화면에서 전달된 데이터를 처리
  useEffect(() => {
    if (route.params?.address && route.params?.coords) {
      setAddress(route.params.address);
      setCoords(route.params.coords);
      console.log('선택된 주소:', route.params.address);
      console.log('선택된 좌표:', route.params.coords);
    }
  }, [route.params]);

  const searchAddressHandle = () => {
    navigation.navigate('LocationSearchScreen'); // 화면 이동
  };

  return (
    <SafeAreaView>
      <ScrollView>
        <Pressable onPress={searchAddressHandle}>
          <Text>주소 검색</Text>
        </Pressable>
        <Pressable>
          <Text>현재 위치로 설정</Text>
        </Pressable>
        <Text>선택된 주소: {address}</Text>
        <Text>위도: {coords?.latitude}, 경도: {coords?.longitude}</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SetLocationScreen;
