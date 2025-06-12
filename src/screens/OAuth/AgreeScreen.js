import React, {useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import useCustomAlert from '../../hooks/useCustomAlert';
import AgreementItem from '../../components/OAuthRegister/AgreementItem';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const AgreeScreen = ({route, navigation}) => {
  const {socialType, socialId, socialToken, fcmToken} = route.params;

  const insets = useSafeAreaInsets();
  const {showAlert, AlertComponent} = useCustomAlert();

  // 체크박스 상태 관리
  const [agreements, setAgreements] = useState({
    all: false,
    terms: false,
    privacy: false,
    location: false,
  });

  // 체크 상태 변경 핸들러
  const handleCheck = key => {
    if (key === 'all') {
      // 전체 동의
      const newState = !agreements.all;
      setAgreements({
        all: newState,
        terms: newState,
        privacy: newState,
        location: newState,
      });
    } else {
      // 개별 동의
      const newAgreements = {...agreements, [key]: !agreements[key]};
      const allChecked =
        newAgreements.terms && newAgreements.privacy && newAgreements.location;
      setAgreements({...newAgreements, all: allChecked});
    }
  };

  // 모달 열기/닫기 핸들러
  const handleAgreeScreen = key => {
    if (key === 'terms') {
      navigation.navigate('TermsAgreeScreen');
    } else if (key === 'privacy') {
      navigation.navigate('PrivacyAgreeScreen');
    } else if (key === 'location') {
      navigation.navigate('LocationAgreeScreen');
    } else {
      return;
    }
  };

  // "다음" 버튼 클릭 핸들러
  const handleNext = () => {
    if (!agreements.terms || !agreements.privacy || !agreements.location) {
      showAlert({
        title: '약관 동의 필요',
        message: '필수 약관에 모두 동의해주세요.',
      });
      return;
    }

    navigation.navigate('IdentityScreen', {
      socialType: socialType,
      socialId: socialId,
      socialToken: socialToken,
      beforeScreen: 'Agree',
      fcmToken: fcmToken,
    });
  };

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.titleView}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.titleNameText} allowFontScaling={false}>
            한잔할까
          </Text>
          <Text style={styles.titleText} allowFontScaling={false}>
            {' '}
            서비스 이용을 위해
          </Text>
        </View>
        <Text style={styles.titleText} allowFontScaling={false}>
          약관에 동의해 주세요
        </Text>
        <Text style={styles.subText}>
          더 편리한 기능을 제공하기 위해 약관 동의가 필요해요!
        </Text>
      </View>

      <View style={styles.allAgreeView}>
        <TouchableOpacity
          onPress={() => handleCheck('all')}
          style={{flexDirection: 'row'}}>
          <View
            style={[
              styles.checkBoxIndicator,
              agreements.all && styles.checkedBox,
            ]}
          />
          <Text style={styles.allAgreeText}>전체 동의</Text>
        </TouchableOpacity>
      </View>
      <AgreementItem
        text="[필수] 오늘한잔 이용약관 동의"
        checked={agreements.terms}
        onPress={() => handleCheck('terms')}
        onInfoPress={() => handleAgreeScreen('terms')} // 약관 보기 모달 열기
      />
      <AgreementItem
        text="[필수] 개인정보 수집 및 이용 동의"
        checked={agreements.privacy}
        onPress={() => handleCheck('privacy')}
        onInfoPress={() => handleAgreeScreen('privacy')} // 약관 보기 모달 열기
      />
      <AgreementItem
        text="[필수] 위치 기반 서비스 약관 동의"
        checked={agreements.location}
        onPress={() => handleCheck('location')}
        onInfoPress={() => handleAgreeScreen('location')} // 약관 보기 모달 열기
      />

      <View style={{marginTop: 'auto', paddingBottom: insets.bottom + 10}}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            !(agreements.terms && agreements.privacy && agreements.location) &&
              styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={
            !(agreements.terms && agreements.privacy && agreements.location)
          }>
          <Text style={styles.nextButtonText}>다음</Text>
        </TouchableOpacity>
      </View>

      <AlertComponent />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  titleView: {
    marginTop: '30%',
    marginHorizontal: 20,
  },
  titleNameText: {
    color: '#5CCEFF',
    fontSize: 30,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 3,
    marginRight: 1,
  },
  titleText: {
    color: '#333',
    fontSize: 28,

    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 3,
  },
  subText: {
    color: '#888',
    fontSize: 15,
    marginBottom: 3,
    marginTop: 10,

    fontFamily: 'Pretendard-Medium',
  },
  allAgreeView: {
    marginTop: 30,
    flexDirection: 'row',
    marginHorizontal: 20,
    alignItems: 'center',
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#999',
    paddingHorizontal: 5,
  },
  allAgreeText: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  agreeView: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    marginHorizontal: 20,
    alignItems: 'center',
    paddingHorizontal: 5,
    justifyContent: 'space-between',
  },
  agreeText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
    marginLeft: 10,
  },
  checkBoxIndicator: {
    width: 25,
    height: 25,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    marginRight: 10,
  },
  checkedBox: {
    backgroundColor: '#5CCEFF',
    borderColor: '#5CCEFF',
  },
  nextButton: {
    marginHorizontal: 20,
    backgroundColor: '#39C4FF',
    borderRadius: 5,
    paddingVertical: 15,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#E7E7E7',
  },
  nextButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default AgreeScreen;
