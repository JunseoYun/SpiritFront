import React from 'react';
import {Text, SafeAreaView, ScrollView, View, StyleSheet} from 'react-native';
import useSafeAndroidInsets from '../../../hooks/useSafeAndroidInsets';
import CustomText from '../../common/CustomText';

const Location_v20250401 = () => {
  const {bottom} = useSafeAndroidInsets();
  return (
    <SafeAreaView style={[styles.container, {paddingBottom: bottom}]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <CustomText style={styles.title}>제 1 조 (목적)</CustomText>
          <CustomText style={styles.text}>
            본 약관은 개인사업자 스피릿(이하 ‘운영자’라고 합니다)이 운영,
            제공하는 위치기반서비스(이하 ‘서비스’)를 이용함에 있어 운영자와 고객
            및 개인위치정보주체의 권리, 의무 및 책임 사항에 따른 이용조건 및
            절차 등 기본적인 사항을 규정함을 목적으로 합니다.
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>
            제 2 조 (이용약관의 효력 및 변경)
          </CustomText>
          <CustomText style={styles.text}>
            1. 본 약관은 서비스를 신청한 고객 또는 개인위치정보주체가 본 약관에
            동의하고 운영자가 정한 소정의 절차에 따라 서비스의 회원으로
            등록함으로써 효력이 발생합니다.
          </CustomText>
          <CustomText style={styles.text}>
            2. 신청자가 모바일 단말기, PC 등에서 약관의 ‘동의하기’ 버튼을
            선택하였을 경우 본 약관의 내용을 모두 읽고 이를 충분히 이해하였으며,
            그 적용에 동의한 것으로 봅니다.
          </CustomText>
          <CustomText style={styles.text}>
            3. 운영자는 위치정보의 보호 및 이용 등에 관한 법률, 콘텐츠산업
            진흥법, 전자상거래 등에서의 소비자보호에 관한 법률, 소비자 기본법
            약관의 규제에 관한 법률 등 관련 법령을 위배하지 않는 범위에서 본
            약관을 변경할 수 있습니다.
          </CustomText>
          <CustomText style={styles.text}>
            4. 운영자가 약관을 변경할 경우에는 변경된 약관과 사유, 적용일자를
            명시하여 그 적용일자 10일 전부터 적용일 이후 상당한 기간 동안
            공지만을 하고, 개정 내용이 회원에게 불리한 경우에는 그 적용일자 30일
            전부터 적용일 이후 상당한 기간 동안 각각 이를 서비스내 게시하거나
            회원에게 전자적 형태(전자우편, SMS 등)로 약관 개정 사실을 발송하여
            고지합니다.
          </CustomText>
          <CustomText style={styles.text}>
            5. 운영자가 전항에 따라 회원에게 통지하면서 공지일로부터 적용일 7일
            후까지 거부의사를 표시하지 아니하면 개정 약관에 승인한 것으로
            간주합니다. 회원이 개정 약관에 동의하지 않을 경우 회원은 이용계약을
            해지할 수 있습니다.
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>
            제 3 조 (관계법령의 적용)
          </CustomText>
          <CustomText style={styles.text}>
            본 약관은 신의성실의 원칙에 따라 공정하게 적용하며, 본 약관에
            명시되지 아니한 사항에 대하여는 관계법령 또는 상관례에 따릅니다
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>
            제 4 조 (개인위치 정보 서비스의 내용)
          </CustomText>
          <CustomText style={styles.text}>
            1. 운영자는 서비스 제공을 위하여 회원의 개인위치 정보를 이용할 수
            있으며, 회원은 이용약관에 동의함으로써 이에 동의한 것으로
            간주합니다.
          </CustomText>
          <CustomText style={styles.text}>
            2. 운영자는 개인위치정보주체의 현 위치를 이용하여 검색 및 추천
            결과를 제기합니다.
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>
            제 5 조 (개인위치정보주체의 권리)
          </CustomText>
          <CustomText style={styles.text}>
            1. 개인위치정보주체는 개인위치정보 수집, 이용 및 제공의 일부 또는
            전부에 대해 동의를 유보할 수 있습니다.
          </CustomText>
          <CustomText style={styles.text}>
            2. 개인위치정보주체는 개인위치정보의 수집, 이용 및 제공에 대한
            동의의 전부 또는 일부를 철회할 수 있습니다. 이 경우 운영자는 지체
            없이 해당 개인위치정보 및 위치정보 이용, 제공사실 확인자료를
            파기합니다. 단, 동의의 일부를 철회한 경우에는 철회된 범위에
            한합니다.
          </CustomText>
          <CustomText style={styles.text}>
            3. 개인위치정보주체는 언제든지 개인위치정보의 수집, 이용 또는 제공의
            일시적인 중지를 요구할 수 있습니다. 이 경우 운영자는 이를 거절하지
            않으며, 이를 위한 기술적 수단을 제공합니다.
          </CustomText>
          <CustomText style={styles.text}>
            4. 개인위치정보주체는 운영자에 대하여 본인의 위치정보 이용 및
            제공사실 확인자료에 대한 열람 또는 고지를 요구할 수 있으며, 해당
            자료에 오류가 있는 경우 그 정정을 요구할 수 있습니다. 이 경우
            운영자는 정당한 사유 없이 개인위치정보주체의 요구를 거절하지
            않습니다.
          </CustomText>
          <CustomText style={styles.text}>
            5. 개인위치정보주체는 본인의 개인위치정보가 위치정보의 보호 및 이용
            등에 관한 법률 또는 다른 법령의 규정에 따라 제3자에게 제공된 이유와
            내용을 운영자에게 요구할 수 있습니다.
          </CustomText>
          <CustomText style={styles.text}>
            6. 개인위치정보주체는 본 조에서 명시된 권리행사를 본 약관에 명시된
            운영자의 연락처를 이용하여 운영자에게 요구할 수 있습니다.
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>
            제 6 조 (개인위치정보 서비스의 변경 및 중지)
          </CustomText>
          <CustomText style={styles.text}>
            1. 운영자는 위치정보사업자의 정책 변경, 법적 제한, 또는 서비스
            운영상의 이유로 개인위치정보 서비스를 전부 또는 일부 변경하거나
            중단할 수 있습니다.
          </CustomText>
          <CustomText style={styles.text}>
            2. 개인위치정보 서비스가 변경 또는 중단되는 경우, 운영자는 사전에
            서비스 초기 화면 공지 또는 개인위치정보주체에게 통지합니다. 다만,
            긴급한 사유로 인해 사전 통지가 어려운 경우에는 사후에 이를
            안내합니다.
          </CustomText>
          <CustomText style={styles.text}>
            3. 불특정 다수인에게 통지가 필요한 경우, 운영자는 공식 웹사이트나
            기타 공지 채널을 통해 안내를 대신할 수 있습니다.
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>
            제 7 조 (서비스 이용 요금)
          </CustomText>
          <CustomText style={styles.text}>
            위치기반서비스의 이용요금은 무료입니다. 다만 위치정보를 확인하기
            위하여 이동통신망에 접속할 때 발생하는 비용인 통신요금이 발생할 수
            있습니다. 통신 요금은 고객의 데이터 사용량, 이동통신사 등에 따라
            변동될 수 있습니다.
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>
            제 8 조 (위치정보관리 책임자의 지정)
          </CustomText>
          <CustomText style={styles.text}>
            1. 운영자는 위치정보를 적절히 관리, 보호하고 개인위치정보주체의
            불만을 원활히 처리할 수 있도록 실질적인 책임을 질 수 있는 지위에
            있는 자를 위치정보관리책임자로 지정해 운영합니다.
          </CustomText>
          <CustomText style={styles.text}>
            2. 위치정보관리 책임자의 구체적인 사항은 본 약관의 부칙에 따릅니다.
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>
            제 9 조 (손해배상의 범위)
          </CustomText>
          <CustomText style={styles.text}>
            1. 운영자가 위치정보의보호및이용등에관한법률 15조 내지 26조의 규정의
            위반한 행위로 회원에게 손해가 발생한경우회원은 운영자에 대해
            손해배상을 청구할 수 있습니다. 이 경우 운영자는 고의 또는 과실이
            없음을 입증하지 아니하면 책임을 면할 수 없습니다.
          </CustomText>
          <CustomText style={styles.text}>
            2. 회원이 본 약관의 규정을 위반하여 운영자에게 손해가 발생한 경우
            운영자는 회원에 대해 손해배상을 청구할 수 있습니다. 이 경우 회원은
            고의 또는 과실이 없음을 입증하지 아니하면 책임을 면할 수 없습니다.
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>제 10 조 (면책)</CustomText>
          <CustomText style={styles.text}>
            1. 운영자는 다음 각 호의 경우로 서비스를 제공할 수 없는 경우 이로
            인하여 회원에게 발생한 손해에 대해서는 책임을 부담하지 않습니다.
          </CustomText>
          <CustomText style={styles.subtext}>
            1) 천재지변 또는 이에 준하는 불가항력의 상태가 있는 경우
          </CustomText>
          <CustomText style={styles.subtext}>
            2) 서비스 제공을 위하여 운영자와 서비스 제휴계약을 체결한 제 3자의
            고의적인 서비스 방해가 있는 경우
          </CustomText>
          <CustomText style={styles.subtext}>
            3) 회원의 귀책사유로 서비스 이용에 장애가 있는 경우
          </CustomText>
          <CustomText style={styles.subtext}>
            4) 제1호 내지 제3호를 제외한 기타 운영자의 고의, 과실이 없는 사유로
            인한 경우
          </CustomText>
          <View style={{marginTop: 10}} />
          <CustomText style={styles.text}>
            2. 운영자는 서비스 및 서비스에 게재된 정보, 자료, 사실의 신뢰도,
            정확성 등에 대해서는 보증을 하지 않으며 이로 인해 발생한 회원의
            손해에 대하여는 책임을 부담하지 아니합니다.
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>제 11 조 (규정의 준용)</CustomText>
          <CustomText style={styles.text}>
            1. 본 약관은 대한민국 법령에 의하여 규정되고 이행됩니다.
          </CustomText>
          <CustomText style={styles.text}>
            2. 본 약관에 규정되지 않은 사항에 대해서는 관계법령 및 상관습에
            의합니다
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>
            제 12 조 (분쟁의 조정 및 기타)
          </CustomText>
          <CustomText style={styles.text}>
            1. 운영자는 위치정보와 관련된 분쟁에 대해 당사자간 협의가 이루어지지
            아니하거나 협의를 할 수 없는 경우에는 위치정보의 보호 및 이용 등에
            관한 법률 제28조 규정에 의한 방송통신위원회에 재정을 신청할 수
            있습니다.
          </CustomText>
          <CustomText style={styles.text}>
            2. 위치정보와 관련된 분쟁에 대해 당사자간 협의가 이루어지지
            아니하거나 협의를 할 수 없는 경우에는 개인정보보호법 제43조 규정에
            의한 개인정보분쟁조정위원회에 조정을 신청할 수 있습니다.
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>
            제 13 조 (운영자의 연락처)
          </CustomText>
          <CustomText style={styles.text}>
            운영자의 정보는 아래와 같습니다.
          </CustomText>
          <CustomText style={styles.text}>1. 개인 사업자: 스피릿</CustomText>
          <CustomText style={styles.text}>
            2. 명칭: 한잔할까 서비스 운영팀
          </CustomText>
          <CustomText style={styles.text}>
            3. 주소: 경기 용인시 기흥구 사은로 126번길 48
          </CustomText>
          <CustomText style={styles.text}>
            4. 이메일 주소: team19spirit@gmail.com
          </CustomText>
        </View>
        <View>
          <CustomText style={styles.title}>부칙</CustomText>
          <CustomText style={styles.text}>
            제 1 조 (시행일) 본 약관은 2025년 4월 1일 부터 시행합니다.
          </CustomText>
          <CustomText style={styles.text}>
            제 2 조 위치정보 관리책임자는 아래와 같습니다.
          </CustomText>
          <CustomText style={styles.text}>위치정보 관리책임자</CustomText>
          <CustomText style={styles.text}>- 성명: 윤준서</CustomText>
          <CustomText style={styles.text}>
            - 연락처: team19spirit@gmail.com
          </CustomText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
    marginTop: -20,
    marginBottom: 70,
  },

  title: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    marginTop: 10,
    marginBottom: 3,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
    color: '#888',
    fontFamily: 'Pretendard-Regular',
    lineHeight: 18,
  },
  subtext: {
    width: '95%',
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    marginBottom: 3,
    color: '#999',
    alignSelf: 'flex-end',
  },
});
export default Location_v20250401;
