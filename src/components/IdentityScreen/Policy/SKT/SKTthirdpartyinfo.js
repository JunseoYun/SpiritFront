import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';

const SKTthirdpartyinfo = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.text}>
        본인확인서비스 제3자 정보제공 동의{'\n'}
        "알뜰폰(MVNO)"사업자는 다음과 같이 개인정보를 제3자에게 제공하고
        있습니다.{'\n'}
        {'\n'}
        제1조(알뜰폰(MVNO) 사업자){'\n'}
        SK텔레콤의 알뜰폰(MVNO) 사업자는 스마텔(스마텔),
        LG헬로비전(헬로모바일),토스모바일㈜,㈜큰사람커넥트(이야기모바일),㈜프리텔레콤(프리티),㈜아이즈비전(아이즈모바일),스테이지파이브(핀다이렉트),KB국민은행(KB리브모바일),㈜유니컴즈(모빙),에스원(안심모바일),㈜한국케이블텔레콤(티플러스),SK텔링크(SK세븐모바일),조이텔(조이텔)입니다.
        {'\n'}
        {'\n'}
        제2조(제공목적){'\n'}본 동의는 본인확인서비스를 제공하기 위하여
        본인확인기관인 SK텔레콤와 본인확인서비스 이용자간 본인확인서비스 이용에
        필요한 고객정보를 위탁하여 본인확인서비스를 제공하는 것에 대해
        동의합니다.{'\n'}
        {'\n'}
        제3조(제공정보){'\n'}
        휴대폰 본인확인서비스 제공에 필요한 개인정보로 성명, 휴대폰번호,
        생년월일, 내·외국인구분, 성별 정보입니다.{'\n'}
        {'\n'}
        제4조(제공받는자){'\n'}
        SK텔레콤{'\n'}
        {'\n'}
        제5조(제공기간){'\n'}
        서비스 제공 완료시까지{'\n'}
        {'\n'}위 개인정보 수집,이용 및 취급위탁에 동의하지 않을 권리가 있으며,
        동의하지 않으실 경우 서비스를 이용할 수 없습니다.
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

export default SKTthirdpartyinfo;
