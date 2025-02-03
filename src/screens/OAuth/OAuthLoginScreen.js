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
      webClientId:
        '55496276543-b5j0de5qpjjpg55874qi4dj6fpdd7srf.apps.googleusercontent.com',
      iosClientId:
        '55496276543-acp3mpj3folinp0067iogp03cstubo4r.apps.googleusercontent.com',
    });
    startWaveAnimation();
  }, []);

  const animations = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  const startWaveAnimation = () => {
    Animated.loop(
      Animated.stagger(
        200, // 💡 각 애니메이션 사이의 지연 시간 (200ms)
        animations.map(anim =>
          Animated.sequence([
            Animated.timing(anim, {
              toValue: -15, // 위로 이동
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0, // 원래 위치로 복귀
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
        ),
      ),
      {iterations: -1}, // 💡 무한 반복
    ).start();
  };

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
    <ImageBackground
      source={require('../../assets/background2.png')} // 배경 이미지 경로
      style={styles.background}
      resizeMode="cover">
      <SafeAreaView>
        <View style={styles.logoView}>
          {['한', '잔', '할', '까'].map((char, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.Logo,
                {transform: [{translateY: animations[index]}]},
              ]}>
              {char}
            </Animated.Text>
          ))}
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
        <AlertComponent />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoView: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
  },
  Logo: {
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 60,
    color: '#fff',
    marginHorizontal: 3,
  },

  kakaoButtonContainer: {
    width: 340,
    height: 50,
    marginTop: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#333',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.8,
        shadowRadius: 2,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  kakaoButton: {
    width: '100%',
    height: '100%',
  },
  googleButtonContainer: {
    width: 340,
    height: 50,
    marginTop: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#333',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.8,
        shadowRadius: 2,
      },
      android: {
        elevation: 5,
      },
    }),
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
