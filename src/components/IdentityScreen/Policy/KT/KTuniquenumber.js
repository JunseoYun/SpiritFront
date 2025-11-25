import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import CustomText from '../../../common/CustomText';

const KTuniquenumber = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CustomText style={styles.text}>
        고유식별정보처리 동의{'\n'}
        {'\n'}
        [(주)케이티 귀중]{'\n'}
        {'\n'}
        (주)케이티 (이하 "본인확인기관")가 드림시큐리티(주) (이하 "회사")을 통해
        제공하는 휴대폰 본인확인 서비스 관련하여 이용자로부터 수집한
        고유식별정보를 이용하거나 타인에게 제공할 때에는 '정보통신망 이용촉진 및
        정보보호 등에 관한 법률'(이하 "정보통신망법")에 따라 이용자의 동의를
        얻어야 합니다.{'\n'}
        {'\n'}■ 제 1 조[고유식별정보의 처리 동의]{'\n'}
        "본인확인기관"은 정보통신망법 제23조의2 제2항에 따라 인터넷상에서
        주민등록번호를 입력하지 않고도 본인임을 확인할 수 있는 휴대폰
        본인확인서비스를 제공하기 위해 고유식별정보를 처리합니다.{'\n'}
        {'\n'}■ 제 2 조[고유식별정보의 제공 동의]{'\n'}
        "본인확인기관 지정 등에 관한 기준(방송통신위원회 고시)"에 따라 "회사"와
        계약한 정보통신서비스 제공자 의 연계서비스 및 중복가입확인을 위해 아래와
        같이 본인의 고유식별정보를 '다른 본인확인기관'에 제공하는 것에
        동의합니다.{'\n'}
        {'\n'}
        1. 제공자(본인확인기관){'\n'}
        (주)케이티
        {'\n'}
        2. 제공 받는자(본인확인기관){'\n'}
        코리아크레딧뷰로㈜, 서울평가정보㈜{'\n'}
        {'\n'}
        3. 제공하는 항목{'\n'}
        주민등록번호(내국인), 외국인등록번호(국내거주외국인){'\n'}
        {'\n'}
        4. 제공 목적{'\n'}
        CI(연계정보), DI(중복가입확인정보)의 생성 및 전달{'\n'}
        {'\n'}
        5. 보유 및 이용기간{'\n'}
        CI(연계정보), DI(중복가입확인정보) 생성 즉시 폐기{'\n'}
        {'\n'}
        6. 위 개인정보 수집,이용 및 취급위탁에 동의하지 않을 권리가 있으며,
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

export default KTuniquenumber;
