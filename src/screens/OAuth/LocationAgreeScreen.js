// src/screens/TermsAgreeScreen.js

import React, {useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import LocationMenu from '../../components/Agreement/Location/LocationMenu';
import Location_v20250401 from '../../components/Agreement/Location/Location_v20250401';
import CustomText from '../../utils/CustomText';

const LocationAgreeScreen = ({navigation}) => {
  const [selected, setSelected] = useState('[현행] 2025년 4월 1일 시행안'); // 선택된 메뉴
  const [ActiveComponent, setActiveComponent] = useState(
    <Location_v20250401 />,
  ); // 표시할 컴포넌트

  const handleMenuSelect = option => {
    setSelected(option);
    switch (option) {
      case '[현행] 2025년 4월 1일 시행안':
        setActiveComponent(<Location_v20250401 />);
        break;
      // case '2024년 12월 26일 시행안':
      //   setActiveComponent(<Location_v20241226 />);
      //   break;
      default:
        setActiveComponent(<CustomText>선택된 약관이 없습니다.</CustomText>);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 분리된 MenuComponent 사용 */}
      <LocationMenu selected={selected} onSelect={handleMenuSelect} />

      {/* 선택된 약관 표시 */}
      <View style={styles.contentContainer}>{ActiveComponent}</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    marginTop: 20,
  },
});

export default LocationAgreeScreen;
