// src/screens/TermsAgreeScreen.js

import React, {useState} from 'react';
import {View, Text, StyleSheet, SafeAreaView} from 'react-native';
import TermsMenu from '../../components/Agreement/Terms/TermsMenu';
import Terms_v20250401 from '../../components/Agreement/Terms/Terms_v20250401';
import Terms_v20260115 from '../../components/Agreement/Terms/Terms_v20260115';
import CustomText from '../../utils/CustomText';

const TermsAgreeScreen = ({navigation}) => {
  const [selected, setSelected] = useState('[현행] 2026년 1월 15일 시행안'); // 선택된 메뉴
  const [ActiveComponent, setActiveComponent] = useState(<Terms_v20260115 />); // 표시할 컴포넌트

  const handleMenuSelect = option => {
    setSelected(option);
    switch (option) {
      case '[현행] 2026년 1월 15일 시행안':
        setActiveComponent(<Terms_v20260115 />);
        break;
      case '[현행] 2025년 4월 1일 시행안':
        setActiveComponent(<Terms_v20250401 />);
        break;
      // case '2024년 12월 26일 시행안':
      //   setActiveComponent(<Terms_v20241226 />);
      //   break;
      default:
        setActiveComponent(<CustomText>선택된 약관이 없습니다.</CustomText>);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 분리된 MenuComponent 사용 */}
      <TermsMenu selected={selected} onSelect={handleMenuSelect} />

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

export default TermsAgreeScreen;
