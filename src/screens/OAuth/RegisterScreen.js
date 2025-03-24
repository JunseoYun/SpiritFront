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

const RegisterScreen = ({route, navigation}) => {
  // route.params를 통해 전달된 데이터 접근
  const {type, id, socialToken} = route.params;
  const [nickname, setNickname] = useState('');
  const [nicknameCheck, setNicknameCheck] = useState(false);
  const [nicknameError, setNicknameError] = useState(false); // 비속어 오류 상태
  const [nicknamelength, setNicknamelength] = useState(false);
  const [nicknamefilter, setNicknamefilter] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {loginauth} = useAuth();
  const {showToast} = useToast();

  const handleCheckNickname = async () => {
    if (!nickname.trim()) {
      showAlert({
        title: '닉네임 미입력',
        message: '닉네임을 입력해주세요.',
      });
      return;
    }
    try {
      const isCheck = await check_nickName(nickname);
      if (isCheck) {
        showToast('사용 가능한 닉네임입니다.');
        setNicknameCheck(true);
      }
    } catch (error) {
      showAlert({
        title: '오류 발생',
        message: '닉네임 중복 검사 중 문제가 발생했습니다.',
      });
    }
  };

  // 닉네임 입력 변경 시 비속어 확인
  const handleNicknameChange = text => {
    // 허용할 문자: 한글, 영문 대소문자, 숫자, `_`, `-` (기타 특수문자 및 이모티콘 차단)
    const filteredText = text.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣0-9]/g, '');

    // 최대 글자 수 제한
    if (filteredText.length > 12) {
      setNicknamelength(true);
    } else {
      setNicknamelength(false);
    }

    setNickname(filteredText);

    // 비속어가 포함된 경우
    const containsForbiddenWord = forbiddenWords.some(word =>
      filteredText.includes(word),
    );
    if (containsForbiddenWord) {
      setNicknameError(true);
      setNicknameCheck(false);
    } else {
      setNicknameError(false);
      setNicknameCheck(false);
    }

    const containsFilterWord = filterWords.some(word =>
      filteredText.includes(word),
    );
    if (containsFilterWord) {
      setNicknamefilter(true);
      setNicknameCheck(false);
    } else {
      setNicknamefilter(false);
      setNicknameCheck(false);
    }
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
      // 회원가입이 완료될 때까지 기다림
      await user_register(type, id, nickname);

      try {
        const login_data = await user_login(type, id, nickname);
        await loginauth(login_data.accessToken, login_data.refreshToken);
      } catch (error) {
        showAlert({
          title: '로그인 오류',
          message:
            '로그인 시 오류가 발생하였습니다.\n잠시 후 다시 시도해주세요.' +
            error,
        });
      }
    } catch (error) {
      showAlert({
        title: '회원가입 오류',
        message:
          '회원가입 시 오류가 발생하였습니다.\n잠시 후 다시 시도해주세요.' +
          error,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.titleView}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Text style={styles.titleNameText}>한잔할까</Text>
          <Text style={styles.titleText}>에서 활동할</Text>
        </View>
        <Text style={styles.titleText}>닉네임을 입력해 주세요</Text>
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
        {nicknameCheck && <Entypo name="check" size={25} color="#16BBFF" />}
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
      {nicknamelength && (
        <Text style={styles.errorText}>
          닉네임 최대 글자 수는 12글자 입니다.
        </Text>
      )}

      {!nicknameCheck &&
        !nicknameError &&
        !nicknamelength &&
        !nicknamefilter && (
          <TouchableOpacity
            style={styles.checkButton}
            onPress={handleCheckNickname}>
            <Text style={styles.checkButtonText}>중복 검사</Text>
          </TouchableOpacity>
        )}

      {nicknameCheck &&
        !nicknameError &&
        !nicknamelength &&
        !nicknamefilter && (
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleRegister}>
            <Text style={styles.submitButtonText}>시작하기</Text>
          </TouchableOpacity>
        )}

      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  titleView: {
    marginTop: 180,
    marginHorizontal: 20,
  },
  titleNameText: {
    color: '#16BBFF',
    fontSize: 30,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    marginBottom: 3,
    marginRight: 1,
  },
  titleText: {
    color: '#333',
    fontSize: 28,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
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
    marginTop: 10,
    fontSize: 14,
  },
  checkButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#16BBFF',
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: 'center',
  },
  checkButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    marginTop: 30,
    marginHorizontal: 20,
    backgroundColor: '#16BBFF',
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
