import React, {useEffect, useRef} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Platform,
  SafeAreaView,
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import {
  loginWithKakaoAccount,
  getProfile,
} from '@react-native-seoul/kakao-login';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {user_login} from '../../api/userApi';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useAuth} from '../../context/AuthContext';

const OAuthLoginScreen = ({navigation}) => {
  const {showAlert, AlertComponent} = useCustomAlert();
  const {login} = useAuth();

  useEffect(() => {
    GoogleSignin.configure({
      iosClientId:
        '55496276543-acp3mpj3folinp0067iogp03cstubo4r.apps.googleusercontent.com',
    });
  }, []);

  const handleLogin = async ({type, id, socialToken}) => {
    try {
      const response = await user_login(type, id, socialToken);
      await login(response.accessToken, response.refreshToken);
    } catch (error) {
      if (error.response) {
        const {status, data, headers} = error.response;
        if (status === 404) {
          showAlert({
            title: '등록된 회원 정보가 없습니다.',
            message: '해당 소셜 계정으로 \n회원가입을 진행하시겠습니까?',
            onConfirm: () => {
              navigation.navigate('AgreeScreen', {
                type: type,
                id: id,
                socialToken: socialToken,
              });
            }, // 함수 참조 전달
            onCancel: null,
            type: 'confirm',
          });
        }
      }
    }
  };

  const handleKaKaoLogin = async () => {
    try {
      const token = await loginWithKakaoAccount();
      const profile = await getProfile();

      const type = 'KAKAO';
      const id = profile.id;
      const socialToken = token.accessToken;
      handleLogin({type, id, socialToken});
    } catch (err) {
      showAlert({
        title: '카카오 로그인 오류',
        message: '카카오 로그인 중 오류가 발생했습니다',
        onConfirm: null,
        onCancel: null,
        type: 'ok',
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      const type = 'GOOGLE';
      const id = userInfo.data.user.id;
      const socialToken = tokens.accessToken;
      handleLogin({type, id, socialToken});
    } catch (error) {
      showAlert({
        title: '구글 로그인 오류',
        message: '구글 로그인 중 오류가 발생했습니다',
        onConfirm: null,
        onCancel: null,
        type: 'ok',
      });
    }
  };

  const handleAppleSignIn = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
      });
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user,
      );
      // Check if the user is authorized
      if (credentialState === appleAuth.State.AUTHORIZED) {
        const type = 'APPLE';
        const id = appleAuthRequestResponse.user;
        const socialToken = appleAuthRequestResponse.authorizationCode;
        handleLogin({type, id, socialToken});
      }
    } catch (error) {
      showAlert({
        title: '애플 로그인 오류',
        message: '애플 로그인 중 오류가 발생했습니다',
        onConfirm: null,
        onCancel: null,
        type: 'ok',
      });
    }
  };

  const handletempLogin = async () => {
    try {
      handleLogin({type: 'KAKAO', id: 444, token: 111});
    } catch (error) {
      showAlert({
        title: '임시 로그인 오류',
      });
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.logoView}>
        <Text style={styles.Logo}>한잔할까</Text>

        <Text style={styles.subText}>
          내 주변 주점을 한눈에!{'\n'}한잔할까에서 쉽고 빠르게 찾으세요.
        </Text>
      </View>
      <View style={styles.loginView}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 10,
          }}>
          <View style={styles.line} />
          <Text style={styles.loginText}>다음으로 시작하기</Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity
          onPress={handleKaKaoLogin}
          style={styles.kakaoButtonContainer}>
          <Image
            source={require('../../assets/kakao_login.png')}
            style={styles.kakaoButton}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          style={styles.googleButtonContainer}>
          <View style={styles.googleView}>
            <View style={styles.googleLogoContainer}>
              <Image
                source={require('../../assets/g-logo.png')}
                style={styles.googleLogo}
              />
            </View>
            <Text style={styles.googleText}>Google 계정으로 계속하기</Text>
          </View>
        </TouchableOpacity>
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            onPress={handleAppleSignIn}
            style={styles.googleButtonContainer}>
            <View style={styles.googleView}>
              <View style={styles.googleLogoContainer}>
                <Image
                  source={require('../../assets/appleLogo.png')}
                  style={styles.appleLogo}
                />
              </View>
              <Text style={styles.appleText}>Apple로 로그인</Text>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handletempLogin}
          style={styles.googleButtonContainer}>
          <View style={styles.googleView}>
            <View style={styles.googleLogoContainer}>
              <Image
                source={require('../../assets/appleLogo.png')}
                style={styles.appleLogo}
              />
            </View>
            <Text style={styles.appleText}>임시 로그인</Text>
          </View>
        </TouchableOpacity>
      </View>

      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  logoView: {
    marginTop: 130,
    alignItems: 'center',
  },
  Logo: {
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 60,
    color: '#16BBFF',
  },
  subText: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 30,
  },
  loginView: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 150, // OS별 높이 설정
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  line: {
    width: 100,

    marginHorizontal: 1,
    backgroundColor: '#333',
    borderRadius: 10,
  },
  loginText: {
    fontSize: 17,
    color: '#333',
    marginHorizontal: 3,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
  },
  kakaoButtonContainer: {
    width: 340,
    height: 50,
    marginTop: 20,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  kakaoButton: {
    width: '100%',
    height: '100%',
  },
  googleButtonContainer: {
    width: 340,
    height: 50,
    marginTop: 40,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  googleButton: {
    width: 340,
    height: 50,
    borderRadius: 10,
  },
  googleLogo: {
    width: 30,
    height: 30,
    marginLeft: 3,
  },
  googleView: {
    width: 340,
    height: 50,
    backgroundColor: 'white',
    alignContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    padding: 10,
    borderRadius: 10,
  },
  googleText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 50,
  },
  appleLogo: {
    width: 50,
    height: 50,
    marginLeft: -5,
    borderRadius: 10,
  },
  appleText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 70,
  },
});

export default OAuthLoginScreen;
