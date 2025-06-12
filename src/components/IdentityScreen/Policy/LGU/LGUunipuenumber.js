import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

const LGUunipuenumber = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.text}>
        고유식별정보처리 동의{'\n'}
        {'\n'}
        [LG유플러스㈜ 귀중]{'\n'}
        {'\n'}
        LG유플러스㈜ (이하 ‘회사’)가 휴대폰본인확인서비스(이하’서비스’)를
        제공하기 위해 고유식별정보를 다음과 같이 제3자에게 제공 및 처리하는 데에
        동의합니다.{'\n'}
        {'\n'}
        1. 고유식별정보를 제공받는 자{'\n'}- NICE평가정보㈜, 서울평가정보㈜,
        코리아크레딧뷰로㈜{'\n'}
        {'\n'}
        2. 고유식별정보를 제공받는 자의 목적{'\n'}- CI(연계정보)와
        DI(중복가입확인정보)의 생성 및 ‘회사’ 제공{'\n'}- 부정 이용 방지 및 민원
        처리{'\n'}
        {'\n'}
        3. 고유식별정보 제공 항목{'\n'}- ‘회사’가 보유하고 있는 고객의
        주민등록번호와 외국인등록번호{'\n'}
        {'\n'}
        4. 고유식별정보를 제공받는 자의 보유 및 이용기간{'\n'}- 제공받는 자의
        개인정보취급방침에 따름{'\n'}
        {'\n'}
        5. 상기 고유식별정보 처리에 대한 내용에 동의하지 않으실 경우, ‘서비스’를
        이용할 수 없습니다. 상기와 같이 고유식별정보 이용 및 처리에 동의합니다.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  text: {
    fontSize: 13,
    lineHeight: 22,
    color: '#333',
  },
});

export default LGUunipuenumber;
