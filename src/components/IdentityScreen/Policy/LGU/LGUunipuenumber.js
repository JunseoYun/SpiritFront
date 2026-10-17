import React from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import CustomText from '../../../../utils/CustomText';

const LGUunipuenumber = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CustomText style={styles.text}>
        고유식별정보 수집 및 이용 동의 및 주민등록번호 처리 안내{'\n'}
        {'\n'}
        ㈜엘지유플러스(이하 '회사')는 휴대폰 본인확인 서비스(이하 ‘서비스’)를
        제공하기 위해 본인의 고유식별정보 및 주민등록번호를 수집 및 이용합니다.
        {'\n'}
        {'\n'}
        1. 수집 및 이용 목적{'\n'}- 고객이 웹사이트 또는 Application 등에 입력한
        본인확인정보의 정확성 여부 확인{'\n'}- 해당 웹사이트 또는 Application
        등에 연계정보(CI)와 중복가입확인정보(DI) 전송{'\n'}- 서비스 관련 상담 및
        불만 처리{'\n'}
        {'\n'}
        2. 수집 및 이용 항목{'\n'}- ‘회사’가 보유하고 있는 고객의 주민등록번호와
        외국인등록번호{'\n'}
        (단, 주민등록번호의 경우 정보통신망 이용촉진 및 정보보호 등에 관한 법률
        제23조의3(본인확인기관의 지정 등)에 의해 처리합니다.){'\n'}
        {'\n'}
        3. 보유 및 이용기간:{'\n'}- 연계정보(CI) 및 중복가입확인정보(DI) 생성
        시까지{'\n'}
        {'\n'}※ 고객님은 위 동의를 거부할 권리가 있으나, 동의를 거부하실 경우
        서비스 가입 및 이용에 제약이 있을 수 있습니다. 더 자세한 내용에 대해서는
        [개인정보처리방침]을 참고하시기 바랍니다.
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

export default LGUunipuenumber;
