import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {useRoute, useNavigation} from '@react-navigation/native';
import forbiddenWords from '../../../hooks/forbiddenWords';
import filterWords from '../../../hooks/filterWords';
import useCustomAlert from '../../../hooks/useCustomAlert';
import {Userputnickname} from '../../../api/userApi';

const Mynickchange = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const {userdata} = route.params;
  const {showAlert, AlertComponent} = useCustomAlert();
  const [newnickname, setNewnickname] = useState('');
  const [nicknameError, setNicknameError] = useState(false);
  const [nicknameCheck, setNicknameCheck] = useState(false);
  const [nicknamelength, setNicknamelength] = useState(false);
  const [nicknamefilter, setNicknamefilter] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleNicknameChange = text => {
    const filteredText = text.replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣0-9]/g, '');

    // 최대 글자 수 제한
    if (filteredText.length > 12) {
      setNicknamelength(true);
    } else {
      setNicknamelength(false);
    }

    setNewnickname(filteredText);

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

  const handlePutnick = async () => {
    setLoading(true);
    try {
      await Userputnickname(newnickname);
      showAlert({
        title: '닉네임 변경 성공',
        message: '닉네임이 성공적으로 변경되었습니다!',
        onConfirm: () => {
          navigation.reset({
            index: 0, // 초기 화면 인덱스
            routes: [{name: 'MyScreen'}], // 이동할 화면
          });
        },
      });
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status;

        switch (statusCode) {
          case 400:
            showAlert({
              title: '닉네임 중복',
              message: '이미 사용중인 닉네임입니다.',
            });
            break;
          case 404:
            showAlert({
              title: '업로드 실패',
              message: '유저정보를 찾을 수 없습니다. 다시 시도해주세요.',
            });
            break;
          default:
            showAlert({
              title: '에러 발생',
              message: `다시 시도해주세요.`,
            });
            break;
        }
      } else {
        console.error('Unexpected Error:', error);
        showAlert({
          title: '네트워크 오류',
          message: '인터넷 연결을 확인하고 다시 시도해주세요.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (!userdata) {
    return (
      <SafeAreaView
        style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <View style={styles.topview}>
              <Text style={styles.nickname}>새로운 닉네임</Text>
              <View
                style={[
                  styles.nicknameInputView,
                  (nicknameError || nicknamelength || nicknamefilter) &&
                    styles.errorInputView,
                  nicknameCheck &&
                    !nicknameError &&
                    !nicknamelength &&
                    !nicknamefilter &&
                    styles.checkInputView,
                ]}>
                <TextInput
                  style={styles.input}
                  value={newnickname}
                  placeholder={userdata.nickname}
                  onChangeText={handleNicknameChange}
                  placeholderTextColor="#999"
                />
                {nicknameCheck && !nicknameError && !nicknamelength && (
                  <Entypo name="check" size={25} color="#16BBFF" />
                )}
              </View>
              <View
                style={[
                  styles.lengthview,
                  (nicknameError || nicknamelength) && styles.errorview,
                ]}>
                {nicknameError && (
                  <Text style={styles.errorText}>
                    비속어 및 이용약관에 위배된 닉네임은 사용할 수 없습니다.
                  </Text>
                )}
                {nicknamefilter && (
                  <Text style={styles.errorText}>
                    초성 닉네임은 사용할 수 없습니다.
                  </Text>
                )}
                {nicknamelength && (
                  <Text style={styles.errorText}>
                    최대 글자 수는 12글자 입니다.
                  </Text>
                )}
                <Text
                  style={[
                    styles.lengthtext,
                    nicknamelength && styles.errorText,
                  ]}>
                  {newnickname.length}/12
                </Text>
              </View>
            </View>
          </ScrollView>
          <Pressable
            style={[
              styles.completebtn,
              (!newnickname.trim() ||
                nicknameError ||
                nicknamelength ||
                nicknamefilter) &&
                styles.disabledbtn, // 비활성화 스타일
            ]}
            onPress={handlePutnick}
            disabled={
              !newnickname.trim() ||
              nicknameError ||
              nicknamelength ||
              nicknamefilter
            } // 비활성화 조건
          >
            <Text style={styles.completebtntext}>완료</Text>
          </Pressable>

          <AlertComponent />
        </SafeAreaView>
      </TouchableWithoutFeedback>
      {loading && (
        <View style={styles.footer}>
          <Text style={styles.loadingtext}>Loading...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topview: {
    marginTop: 50,
    marginHorizontal: 18,
  },
  nickname: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
    marginLeft: 3,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
  },
  completebtn: {
    width: '90%',
    backgroundColor: '#16BBFF',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    alignSelf: 'center',
    marginBottom: 10, // 여유 공간 추가
  },
  completebtntext: {
    color: 'white',
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
  },
  nicknameInputView: {
    flexDirection: 'row',
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  errorInputView: {
    borderColor: '#FF0000',
  },
  checkInputView: {
    borderColor: '#45C9FF',
  },
  errorText: {
    color: '#FF0000',
    marginTop: 7,
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
  },
  lengthtext: {
    marginTop: 7,
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#45C9FF',
    alignSelf: 'flex-end',
  },
  lengthview: {
    flex: 1,

    padding: 3,
  },
  errorview: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 3,
    flexWrap: 'wrap',
  },
  disabledbtn: {
    backgroundColor: '#CCCCCC', // 비활성화된 버튼 색상
  },
  footer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(194, 194, 194, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingtext: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default Mynickchange;
