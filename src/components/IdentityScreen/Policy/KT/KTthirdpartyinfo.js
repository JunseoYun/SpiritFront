import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import CustomText from '../../../../utils/CustomText';

const KTthirdpartyinfo = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <CustomText style={styles.text}>
        개인정보의 제 3자 제공 동의{'\n'}
        {'\n'}
        제1조 (알뜰폰(MVNO) 사업자){'\n'}□ ㈜케이티의 알뜰폰(MVNO) 사업자는
        (주)LG헬로비전(헬로모바일), (주)니즈텔레콤(니즈모바일),
        (주)더원플랫폼(아이플러스유), (주)미니게이트(M2모바일),
        (주)스테이지파이브(핀플레이), (주)와이엘랜드(여유알뜰폰),
        (주)위너스텔(웰), (주)파인디지털, (주)한국케이블텔레콤(티플러스),
        ACN코리아(플래시모바일), KT스카이라이프(스카이라이프모바일),
        KT엠모바일(Kt M 모바일), KT텔레캅, 드림라인(주)(드림모바일),
        로카모빌리티(주), 토스모바일, 아이디스파워텔㈜,
        앤알커뮤니케이션(앤텔레콤), 에스원(안심모바일), 장성모바일,
        ㈜세종텔레콤(스노우맨), ㈜씨엔커뮤니케이션(씨앤컴),
        ㈜아이즈비전(아이즈모바일), ㈜에넥스텔레콤(A모바일),
        ㈜에이프러스(아시아모바일), ㈜유니컴즈(모빙), ㈜제이씨티,
        ㈜코드모바일(이지모바일), ㈜큰사람커넥트(이야기모바일),
        ㈜프리텔레콤(프리티), 한국피엠오(주)(밸류컴), (주)스마텔,
        KB국민은행(리브엠), ㈜더피엔엘, (주)에르엘은 본인확인서비스의 제공을
        위해 아래와 같이 이용자의 개인정보를 제3자에게 제공합니다.{'\n'}
        {'\n'}
        제2조 (제공받는 자의 개인정보 이용 목적){'\n'}
        본인확인서비스 제공{'\n'}
        {'\n'}
        제3조 (제공하는 개인정보의 항목){'\n'}
        성명, 휴대폰번호, 생년월일, 내•외국인구분, 성별{'\n'}
        {'\n'}
        제4조 (제공받는자){'\n'}
        주식회사 케이티(KT){'\n'}
        {'\n'}
        제5조 (보유기간 및 이용기간){'\n'}
        서비스 제공 완료시까지{'\n'}
        {'\n'}위 개인정보 수집,이용 및 취급위탁에 동의하지 않을 권리가 있으며,
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

export default KTthirdpartyinfo;
