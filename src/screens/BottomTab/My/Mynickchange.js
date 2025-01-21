import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  SafeAreaView,
} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import {useRoute, useNavigation} from '@react-navigation/native';
import forbiddenWords from '../../../hooks/forbiddenWords';
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

  const handleNicknameChange = text => {
    setNewnickname(text);

    // 비속어가 포함된 경우
    const containsForbiddenWord = forbiddenWords.some(word =>
      text.includes(word),
    );
    if (containsForbiddenWord) {
      setNicknameError(true);
      setNicknameCheck(false);
    } else {
      setNicknameError(false);
      setNicknameCheck(true);
    }
  };

  const handlePutnick = async () => {
    console.log(newnickname);
    if (nicknameError || !nicknameCheck || !newnickname.trim()) {
      showAlert({
        title: '닉네임 오류',
        message: '유효하지 않은 닉네임입니다.\n다시 시도해주세요.',
      });
      return;
    }
    try {
      await Userputnickname(newnickname);
      showAlert({
        title: '닉네임 변경 성공',
        message: '닉네임이 성공적으로 변경되었습니다!',
        onConfirm: () => {
          navigation.navigate('MyStack', {
            screen: 'MyScreen',
          });
        },
      });
    } catch (error) {
      if (error.response) {
        const statusCode = error.response.status; // 에러 코드 가져오기

        // 에러 코드별 처리
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
        // 네트워크 또는 다른 에러 처리
        console.error('Unexpected Error:', error);
        showAlert({
          title: '네트워크 오류',
          message: '인터넷 연결을 확인하고 다시 시도해주세요.',
        });
      }
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
    <SafeAreaView
      style={{
        backgroundColor: 'white',
        height: '100%',
        justifyContent: 'space-between',
      }}>
      <View style={styles.topview}>
        <Text style={styles.nickname}>새로운 닉네임</Text>
        <View
          style={[
            styles.nicknameInputView,
            nicknameError && styles.errorInputView, // 비속어 입력 시 빨간 테두리
            nicknameCheck && !nicknameError && styles.checkInputView,
          ]}>
          <TextInput
            style={styles.input}
            value={newnickname}
            placeholder={userdata.nickname}
            onChangeText={handleNicknameChange}
            placeholderTextColor="#999"
          />
          {nicknameCheck && !nicknameError && (
            <Entypo name="check" size={25} color="#16BBFF" />
          )}
        </View>
        {nicknameError && (
          <Text style={styles.errorText}>
            비속어 및 이용약관에 위배된 닉네임은 사용할 수 없습니다.
          </Text>
        )}
      </View>
      <Pressable style={styles.completebtn} onPress={handlePutnick}>
        <Text style={styles.completebtntext}>완료</Text>
      </Pressable>

      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topview: {
    marginTop: 50,
    marginHorizontal: 50,
  },
  nickname: {
    fontSize: 18,
    color: 'black',
    fontWeight: 'bold',
  },
  input: {
    flex: 1,
    paddingVertical: 10,
  },
  completebtn: {
    alignItems: 'center',
    marginBottom: 50,
    marginHorizontal: 50,
    borderRadius: 10,
    backgroundColor: '#16BBFF',
    paddingVertical: 12,
  },
  completebtntext: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
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
    borderColor: '#16BBFF',
  },
  errorText: {
    color: '#FF0000',
    marginHorizontal: 20,
    marginTop: 10,
    fontSize: 14,
  },
});

export default Mynickchange;
