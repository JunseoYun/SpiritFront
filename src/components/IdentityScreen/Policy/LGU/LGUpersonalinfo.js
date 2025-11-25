import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import CustomText from '../../../common/CustomText';

const LGUpersonalinfo = () => {
  return (
    <View contentContainerStyle={styles.container}>
      <CustomText style={styles.text}>
        개인정보 이용 동의{'\n'}
        [LG유플러스㈜ 귀중]{'\n'}
        {'\n'}
        LG유플러스㈜(이하 ‘회사’라 함)가 제공하는 본인확인서비스를 이용하기
        위해, 다음과 같이 ‘회사’가 본인의 개인정보를 수집 및 이용하고,
        개인정보의 취급을 위탁하는 것에 동의합니다.{'\n'}
        {'\n'}
        1. 수집항목{'\n'}- 고객의 생년월일, 이동전화번호, 성명, 성별, 내/외국인
        구분{'\n'}- 연계정보(CI), 중복가입확인정보(DI){'\n'}- 고객이 이용하는
        웹사이트 등{'\n'}
        {'\n'}
        2. 이용목적{'\n'}- 고객이 웹사이트 또는 Application 등에 입력한
        본인확인정보의 정확성 여부 확인{'\n'}- 해당 웹사이트 또는 Application
        등에 연계정보(CI)와 중복가입확인정보(DI) 전송{'\n'}- 서비스 관련 상담 및
        불만 처리{'\n'}- 기타 법률에서 정한 목적{'\n'}
        {'\n'}
        3. 개인정보의 보유기간 및 이용기간{'\n'}- 고객이 서비스를 이용하는
        기간에 한하여 보유 및 이용을 원칙으로 하되, 법률에서 정하는 경우 해당
        기간까지 보유 및 이용{'\n'}
        (세부사항은 ‘회사’의 개인정보취급방침에 따름){'\n'}
      </CustomText>

      {/* ✅ 표 형태 삽입 */}
      <View style={{marginTop: 20}}>
        <CustomText style={styles.tableTitle}>
          4. 본인확인서비스 제공을 위한 개인정보의 처리 위탁
        </CustomText>

        {/* 표 헤더 */}
        <View style={[styles.tableRow, styles.tableHeader]}>
          <CustomText style={[styles.tableCell, {flex: 1}]}>
            위탁수탁자
          </CustomText>
          <CustomText style={[styles.tableCell, {flex: 2}]}>
            위탁업무내용
          </CustomText>
        </View>

        {/* 표 내용 */}
        <View style={styles.tableRow}>
          <CustomText style={[styles.tableCell, {flex: 1}]}>
            ㈜드림시큐리티
          </CustomText>
          <CustomText style={[styles.tableCell, {flex: 2}]}>
            본인확인 서비스 중계 업무 제공
          </CustomText>
        </View>
        <View style={styles.tableRow}>
          <CustomText style={[styles.tableCell, {flex: 1}]}>
            씨에스리더, LB휴넷,{'\n'}㈜씨에스원파트너, 아인텔레서비스
          </CustomText>
          <CustomText style={[styles.tableCell, {flex: 2}]}>
            고객센터 운영
          </CustomText>
        </View>
        <View style={styles.tableRow}>
          <CustomText style={[styles.tableCell, {flex: 1}]}>
            미디어로그
          </CustomText>
          <CustomText style={[styles.tableCell, {flex: 2}]}>
            PASS 어플리케이션 및 웹사이트 운영/관리
          </CustomText>
        </View>
        <View style={styles.tableRow}>
          <CustomText style={[styles.tableCell, {flex: 1}]}>아톤</CustomText>
          <CustomText style={[styles.tableCell, {flex: 2}]}>
            PASS 서비스 장애 및 VOC 처리
          </CustomText>
        </View>
      </View>

      {/* 이어지는 텍스트 */}
      <CustomText style={styles.text}>
        {'\n'}
        5. 고객은 개인정보 수집 및 이용 동의를 거부할 권리가 있습니다.{'\n'}
        다만 동의하지 않을 경우 서비스를 이용할 수 없습니다.{'\n'}
        ‘회사’가 제공하는 서비스의 개인정보 취급과 관련된 사항은 아래의 ‘회사’
        홈페이지에 기재된 개인정보취급방침에 따릅니다.{'\n'}- LG유플러스㈜:
        https://www.lguplus.com/{'\n'}
        {'\n'}
        본인은 상기 내용을 숙지하였으며 이에 동의합니다.{'\n'}
        {'\n'}
        [㈜드림시큐리티 귀중]{'\n'}
        ㈜드림시큐리티 (이하 "회사")는 LG유플러스㈜ 통신사로부터 위탁받아
        제공하는 휴대폰 본인인증 서비스와 관련하여 고객으로부터 수집한
        개인정보를 이용 및 제공하고자 합니다.{'\n'}
        이에 본인은 “회사”가 아래와 같이 개인정보를 이용 및 제공하는 데
        동의합니다.{'\n'}
        {'\n'}
        제1조 (개인정보의 수집 및 이용 목적){'\n'}
        "회사"는 "고객"의 개인정보를 아래의 목적으로 이용할 수 있습니다.{'\n'}①
        휴대폰기반 본인확인 서비스 제공{'\n'}② 휴대폰 본인인증 서비스 문의사항
        응대{'\n'}③ 휴대폰번호도용방지서비스 가입여부확인 (서비스 가입자에 한함)
        {'\n'}
        {'\n'}
        제2조 (수집하는 개인정보의 항목){'\n'}- 성명, 성별, 생년월일, 내/외국인
        구분{'\n'}- 연계정보(CI), 중복가입확인정보(DI){'\n'}- 휴대폰번호,
        이동통신사, IP주소{'\n'}
        {'\n'}
        제3조 (개인정보의 보유 및 이용기간){'\n'}
        "회사"는 법령에 따른 개인정보 보유•이용기간 또는 정보주체로부터
        개인정보를 수집 시에 동의받은 개인정보 보유•이용기간 내에서 개인정보를
        처리•보존합니다.{'\n'}① 휴대폰기반 본인확인 서비스 제공: 목적 달성 후
        즉시 파기{'\n'}② 휴대폰 본인인증 서비스 문의사항 응대: 3년{'\n'}③
        휴대폰번호도용방지서비스 가입여부확인: 목적 달성 후 즉시 파기{'\n'}
        {'\n'}
        제4조 (개인정보의 제공){'\n'}① 휴대폰기반 본인확인 서비스 제공{'\n'}-
        제공받는 자: “회사”와 계약을 체결한 사업자(가맹점){'\n'}- 제공 목적:
        휴대폰기반 본인확인{'\n'}- 제공 항목: 성명, 생년월일, 성별, 휴대폰번호,
        내/외국인 구분, 이동통신사, 연계정보(CI), 중복가입확인정보(DI){'\n'}-
        보유 기간: 처리목적 달성 후 즉시 파기 (단, 법령상 보존 필요 시 또는 사전
        동의 시 보관){'\n'}
        {'\n'}② 휴대폰번호도용방지서비스 가입여부확인 (서비스 가입자에 한함)
        {'\n'}- 제공받는 자: ㈜헥토파이낸셜{'\n'}- 제공 목적:
        휴대폰번호도용방지서비스 가입여부확인{'\n'}- 제공 항목: 휴대폰번호,
        이동통신사{'\n'}- 보유 기간: 처리목적 달성 후 즉시 파기 (법령상 보존
        필요 시 또는 사전 동의 시 보관){'\n'}
        {'\n'}※ 개인정보 수집•이용 및 제공에 따른 동의는 거부할 수 있습니다.
        {'\n'}
        다만, 동의 거부 시에는 서비스 이용이 제한될 수 있습니다.
      </CustomText>
    </View>
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
  tableTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  tableRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tableHeader: {
    backgroundColor: '#f3f3f3',
  },
  tableCell: {
    padding: 10,
    borderRightWidth: 1,
    borderRightColor: '#ccc',
    fontSize: 13,
    color: '#333',
  },
});

export default LGUpersonalinfo;
