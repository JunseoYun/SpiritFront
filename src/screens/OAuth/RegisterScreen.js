import React, {useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import useCustomAlert from '../../hooks/useCustomAlert';
import {check_nickName, user_register, user_login} from '../../api/userApi';
import Entypo from 'react-native-vector-icons/Entypo';
import forbiddenWords from '../../hooks/forbiddenWords';
import filterWords from '../../hooks/filterWords';
import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';
import Loading from '../../hooks/Loading';
import {getFcmToken} from '../../hooks/useNotificationPermission';

const RegisterScreen = ({route, navigation}) => {
  // route.params를 통해 전달된 데이터 접근
  const {type, id, socialToken} = route.params;
  const [nickname, setNickname] = useState('');
  const [nicknameCheck, setNicknameCheck] = useState(false);
  const [checking, setChecking] = useState(false);
  const [nicknameError, setNicknameError] = useState(false); // 비속어 오류 상태
  const [nicknamelength, setNicknamelength] = useState(false);
  const [nicknamefilter, setNicknamefilter] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {loginauth} = useAuth();
  const {showToast} = useToast();
  const [isSameNick, setIsSameNick] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCheckNickname = async () => {
    const filteredText = nickname.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣0-9]/g, '');

    setNickname(filteredText); // 필터링된 값 반영 (선택적)

    if (!filteredText.trim()) {
      showAlert({
        title: '닉네임 미입력',
        message: '닉네임을 입력해주세요.',
      });
      return;
    }

    if (filteredText.length > 12) {
      setNicknamelength(true);
      setNicknameCheck(false);
      return;
    } else {
      setNicknamelength(false);
    }

    const containsForbiddenWord = forbiddenWords.some(word =>
      filteredText.includes(word),
    );
    if (containsForbiddenWord) {
      setNicknameError(true);
      setNicknameCheck(false);
      return;
    } else {
      setNicknameError(false);
    }

    const containsFilterWord = filterWords.some(word =>
      filteredText.includes(word),
    );
    if (containsFilterWord) {
      setNicknamefilter(true);
      setNicknameCheck(false);
      return;
    } else {
      setNicknamefilter(false);
    }

    try {
      setLoading(true);
      const isCheck = await check_nickName(filteredText);
      if (isCheck.isAvailable) {
        showToast('사용 가능한 닉네임입니다.');
        setNicknameCheck(true);
        setIsSameNick(false);
      } else {
        setIsSameNick(true);
        setChecking(false);
      }
    } catch (error) {
      showToast('중복된 닉네임입니다.');
      setChecking(false);
    } finally {
      setLoading(false);
    }
  };

  // 닉네임 입력 변경 시 비속어 확인
  const handleNicknameChange = text => {
    setNickname(text); // 원본 그대로 저장
    setIsSameNick(false);
    setChecking(false);
    setNicknameError(false);
    setNicknamefilter(false);
    setNicknameCheck(false); // <-- 이거 추가!
  };

  const handleRegister = async () => {
    if (nicknameError) {
      showAlert({
        title: '닉네임 오류',
        message: '비속어가 포함된 닉네임은 사용할 수 없습니다.',
      });
      return;
    } else if (!nicknameCheck) {
      showAlert({
        title: '닉네임 중복검사 미실시',
        message: '닉네임 중복검사를 실시해 주세요.',
      });
      return;
    }

    try {
      setLoading(true);
      // 회원가입이 완료될 때까지 기다림
      await user_register(type, id, nickname);

      try {
        const fcmToken = await getFcmToken();
        console.log('🔥 FCM Token:', fcmToken);
        const login_data = await user_login(type, id, socialToken);
        await loginauth(login_data.accessToken, login_data.refreshToken, null);
        // await loginauth(login_data.accessToken, login_data.refreshToken, 마케팅 알림 수신 여부);
        navigation.reset({
          index: 0,
          routes: [
            {name: 'MainBtmbar', state: {routes: [{name: 'MainScreen'}]}},
          ],
        });
      } catch (error) {
        showAlert({
          title: '로그인 오류',
          message:
            '로그인 시 오류가 발생하였습니다.\n잠시 후 다시 시도해주세요.',
        });
      }
    } catch (error) {
      showAlert({
        title: '중복된 닉네임',
        message: '닉네임 변경 후\n중복검사를 다시 시도해주세요.',
      });
      setNicknameCheck(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleView}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.titleNameText} allowFontScaling={false}>
            한잔할까
          </Text>
          <Text style={styles.titleText} allowFontScaling={false}>
            에서 활동할
          </Text>
        </View>
        <Text style={styles.titleText} allowFontScaling={false}>
          닉네임을 입력해 주세요
        </Text>
      </View>

      <View
        style={[
          styles.nicknameInputView,
          (nicknameError || nicknamefilter || nicknamelength) &&
            styles.errorInputView, // 비속어 입력 시 빨간 테두리
          nicknameCheck &&
            !nicknameError &&
            !nicknamelength &&
            !nicknamelength &&
            styles.checkInputView,
        ]}>
        <TextInput
          style={styles.nicknameInput}
          value={nickname}
          onChangeText={handleNicknameChange}
          placeholder="닉네임을 입력하세요"
          placeholderTextColor="#999"
        />
        {nicknameCheck && <Entypo name="check" size={25} color="#5CCEFF" />}
      </View>

      {/* 비속어 경고 메시지 */}
      {nicknameError && (
        <Text style={styles.errorText}>
          비속어 및 이용약관에 위배된 닉네임은 사용할 수 없습니다.
        </Text>
      )}
      {nicknamefilter && (
        <Text style={styles.errorText}>초성 닉네임은 사용할 수 없습니다.</Text>
      )}
      {isSameNick && (
        <Text style={styles.errorText}>중복된 닉네임 입니다.</Text>
      )}
      {nicknamelength && (
        <Text style={styles.errorText}>
          닉네임 최대 글자 수는 12글자 입니다.
        </Text>
      )}
      {checking && (
        <Text style={[styles.errorText, {color: '#333'}]}>
          이미 등록된 닉네임입니다.
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.checkButton,
          (!nickname || nicknameError || nicknamefilter || nicknamelength) &&
            styles.disabledButton,
        ]}
        disabled={
          !nickname || nicknameError || nicknamefilter || nicknamelength
        }
        onPress={nicknameCheck ? handleRegister : handleCheckNickname}>
        <Text style={styles.checkButtonText}>
          {nicknameCheck ? '시작하기' : '중복 검사'}
        </Text>
      </TouchableOpacity>

      <AlertComponent />
      <Loading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  disabledButton: {
    backgroundColor: '#CCC',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  titleView: {
    marginTop: 180,
    marginHorizontal: 20,
  },
  titleNameText: {
    color: '#5CCEFF',
    fontSize: 30,
    fontFamily: 'Pretendard-Medium',
    marginBottom: 3,
    marginRight: 1,
  },
  titleText: {
    color: '#333',
    fontSize: 28,
    fontFamily: 'Pretendard-Medium',
    marginBottom: 3,
  },
  nicknameInputView: {
    flexDirection: 'row',
    marginTop: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nicknameInput: {
    fontSize: 16,
    height: 50,
    color: '#333',
    fontFamily: 'Pretendard-Regular',
    flex: 1,
  },
  errorInputView: {
    borderColor: '#FF0000', // 빨간 테두리
  },
  checkInputView: {
    borderColor: '#16BBFF', // 빨간 테두리
  },
  errorText: {
    color: '#FF0000',
    marginHorizontal: 20,
    fontFamily: 'Pretendard-Regular',
    marginTop: 10,
    fontSize: 14,
    paddingLeft: 4,
  },
  checkButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#39C4FF',
    borderRadius: 7,
    paddingVertical: 14,
    alignItems: 'center',
  },
  checkButtonText: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
  },
  submitButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#39C4FF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
