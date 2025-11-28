import React from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import SKTpersonalinfo from './SKT/SKTpersonalinfo';
import KTpersonalinfo from './KT/KTpersonalinfo';
import LGUpersonalinfo from './LGU/LGUpersonalinfo';
import CustomText from '../../../utils/CustomText';

const PersonalInfo = ({route}) => {
  const {carrier} = route.params || {}; // ⭐️ carrier를 route에서 받아오기

  return (
    <View style={{backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={styles.container}>
        <CustomText style={styles.title}>개인정보 수집 및 이용 동의</CustomText>
        {(carrier === 'SKT' || carrier === 'SKT 알뜰폰') && <SKTpersonalinfo />}
        {(carrier === 'KT' || carrier === 'KT 알뜰폰') && <KTpersonalinfo />}
        {(carrier === 'LG U+' || carrier === 'LG U+ 알뜰폰') && (
          <LGUpersonalinfo />
        )}
        <View
          style={{
            height: 2,
            backgroundColor: '#ccc',
            marginHorizontal: -20,
            marginBlock: 12,
          }}></View>
        <CustomText style={styles.text}>
          ㈜드림시큐리티는 휴대폰본인확인 서비스 이용과 관련하여, 본인의
          개인정보를 수집, 이용하고자 하는 경우에는 개인정보 보호법 제15조 및
          제22조에 따라 동의를 얻어야 합니다. 이에 본인은
          귀사(“㈜드림시큐리티”)가 아래의 내용과 같이 본인의 개인정보를 수집,
          이용하는데 동의합니다.
        </CustomText>

        <CustomText style={styles.sectionTitle}>
          휴대폰본인확인 서비스
        </CustomText>

        <View style={styles.table}>
          <View style={[styles.row, styles.headerRow]}>
            <CustomText style={[styles.cell, styles.headerCell, {flex: 2}]}>
              개인정보 수집 목적
            </CustomText>
            <CustomText style={[styles.cell, styles.headerCell, {flex: 3}]}>
              수집하는 개인정보 항목
            </CustomText>
            <CustomText style={[styles.cell, styles.headerCell]}>
              보유기간
            </CustomText>
          </View>

          <View style={styles.row}>
            <CustomText style={[styles.cell, {flex: 2}]}>
              휴대폰기반 본인확인 서비스제공
            </CustomText>
            <CustomText style={[styles.cell, {flex: 3}]}>
              성명, 생년월일, 성별, 휴대폰번호, 내/외국인 구분, 이동통신사,
              연계정보(CI), 중복가입확인정보(DI)
            </CustomText>
            <CustomText style={styles.cell}>즉시파기</CustomText>
          </View>

          <View style={styles.row}>
            <CustomText style={[styles.cell, {flex: 2}]}>
              ‘서비스’ 문의사항 응대
            </CustomText>
            <CustomText style={[styles.cell, {flex: 3}]}>
              성명, 생년월일, 휴대폰번호
            </CustomText>
            <CustomText style={styles.cell}>2년</CustomText>
          </View>

          <View style={styles.row}>
            <CustomText style={[styles.cell, {flex: 2}]}>
              부정사용 방지
            </CustomText>
            <CustomText style={[styles.cell, {flex: 3}]}>
              성명, 생년월일, 휴대폰번호, 성별, 내/외국인 구분, 이동통신사
            </CustomText>
            <CustomText style={styles.cell}>2년</CustomText>
          </View>

          <View style={styles.row}>
            <CustomText style={[styles.cell, {flex: 2}]}>
              휴대폰인증보호서비스/휴대폰번호도용방지 서비스 가입여부 확인
            </CustomText>
            <CustomText style={[styles.cell, {flex: 3}]}>
              휴대폰번호, 이동통신사
            </CustomText>
            <CustomText style={styles.cell}>즉시파기</CustomText>
          </View>
        </View>

        <CustomText style={styles.text}>
          ※ 동의를 거부할 수 있습니다.{'\n'}
          단, 동의 거부 시 휴대폰본인확인 서비스 이용에 따른 제약이 있을 수
          있습니다.
        </CustomText>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginVertical: 10,
    color: '#000',
  },
  text: {
    fontSize: 13,
    lineHeight: 21,
    color: '#333',
    marginBottom: 10,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  headerRow: {
    backgroundColor: '#f2f2f2',
  },
  cell: {
    flex: 1,
    padding: 10,
    fontSize: 12,
    color: '#333',
  },
  headerCell: {
    fontWeight: 'bold',
  },
});

export default PersonalInfo;
