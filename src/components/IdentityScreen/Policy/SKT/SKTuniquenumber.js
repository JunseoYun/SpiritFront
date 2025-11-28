import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import CustomText from '../../../../utils/CustomText';

const SKTuniquenumber = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CustomText style={styles.text}>
        고유식별정보처리 동의{'\n'}
        {'\n'}
        [SK텔레콤 귀중]{'\n'}
        {'\n'}
        본인은 SK텔레콤㈜(이하 ‘회사’라 합니다)가 제공하는 본인확인서비스(이하
        ‘서비스’라 합니다)를 이용하기 위해, 다음과 같이 본인의 개인정보를 회사가
        아래 기재된 제3자에게 제공하는 것에 동의합니다.{'\n'}
        {'\n'}
        1. 개인정보를 제공받는 자{'\n'}- NICE평가정보㈜, 서울평가정보㈜{'\n'}
        {'\n'}
        2. 개인정보를 제공받는 자의 개인정보 이용 목적{'\n'}-
        연계정보(CI)/중복가입확인정보(DI) 생성 및 ‘회사’에 제공{'\n'}- 부정 이용
        방지 및 민원 처리{'\n'}
        {'\n'}
        3. 제공하는 개인정보 항목{'\n'}- ‘회사’가 보유하고 있는 이용자의
        주민등록번호 및 외국인등록번호{'\n'}
        {'\n'}
        4. 개인정보를 제공받는 자의 개인정보 보유 및 이용기간{'\n'}-
        연계정보(CI)/중복가입확인정보(DI) 생성 후 6개월{'\n'}
        {'\n'}
        5. 위 개인정보 수집,이용 및 취급위탁에 동의하지 않을 권리가 있으며,
        동의하지 않으실 경우 서비스를 이용할 수 없습니다.
      </CustomText>
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

export default SKTuniquenumber;
