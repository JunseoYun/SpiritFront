import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  SafeAreaView,
} from 'react-native';
import {
  login,
  getProfile,
  loginWithKakaoAccount,
} from '@react-native-seoul/kakao-login';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {user_login} from '../../api/userApi';
import {useAuth} from '../../context/AuthContext';
import Config from 'react-native-config';
import FastImage from 'react-native-fast-image';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useToast} from '../../context/ToastContext';
import {getFcmToken} from '../../hooks/notification/useNotificationPermission';
import Loading from '../../hooks/Loading';
const OAuthLoginScreen = ({navigation}) => {
  const {loginauth} = useAuth();
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.revokeAccess();
    GoogleSignin.signOut();
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      iosClientId: Config.GOOGLE_CLIENT_ID,
    });
  }, []);

  const handleLogin = async ({socialType, socialId, socialToken}) => {
    setLoading(true);
    const fcmToken = await getFcmToken();

    try {
      const response = await user_login(
        socialType,
        socialId,
        socialToken,
        fcmToken,
      );

      if (response.isVerified === false) {
        navigation.navigate('IdentityScreen', {
          socialType: socialType,
          socialId: socialId,
          socialToken: socialToken,
          beforeScreen: 'Login',
          token: response,
          fcmToken: fcmToken,
        });
      } else {
        await loginauth(
          response.accessToken,
          response.refreshToken,
          response.marketingConsent,
        );
      }
    } catch (error) {
      if (error.response) {
        const {status, data, headers} = error.response;
        if (status === 404) {
          navigation.navigate('AgreeScreen', {
            socialType: socialType,
            socialId: socialId,
            socialToken: socialToken,
            fcmToken: fcmToken,
          });
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKaKaoLogin = async () => {
    try {
      let token;

      if (Platform.OS === 'android') {
        token = await login();
      } else if (Platform.OS === 'ios') {
        try {
          token = await login(); // 앱 로그인 시도
        } catch (e) {
          token = await loginWithKakaoAccount(); // 앱 로그인 실패 시, 웹 로그인 fallback
        }
      }
      const profile = await getProfile();
      const socialType = 'KAKAO';
      const socialId = profile.id;
      const socialToken = token.accessToken;
      handleLogin({socialType, socialId, socialToken});
    } catch (err) {}
  };

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      const socialType = 'GOOGLE';
      const socialId = userInfo.data.user.id;
      const socialToken = userInfo.data.idToken;
      handleLogin({socialType, socialId, socialToken});
    } catch (error) {
      console.log(error);
      if (error.code === '7') {
        showToast('인터넷 연결을 확인해 주세요.', 'center');
      } else {
        console.log('Google SignIn Error:', error);
        showToast('로그인 중 문제가 발생했어요.', 'center');
      }
    }
  };

  const handleAppleSignIn = async () => {
    if (Platform.OS === 'ios') {
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
          const socialType = 'APPLE';
          const socialId = appleAuthRequestResponse.user;
          const socialToken = appleAuthRequestResponse.identityToken;
          handleLogin({socialType, socialId, socialToken});
        }
      } catch (error) {}
    } else {
      //Android apple Login
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.logoView}>
        <FastImage
          source={require('../../assets/AppName.png')}
          style={styles.LogoName}
          resizeMode={FastImage.resizeMode.contain}
        />

        <Text style={styles.subText} allowFontScaling={false}>
          한잔하고 싶은 당신을 위한 서비스
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
          <Text style={styles.loginText} allowFontScaling={false}>
            다음으로 시작하기
          </Text>
          <View style={styles.line} />
        </View>
        <TouchableOpacity
          onPress={handleKaKaoLogin}
          style={styles.kakaoButtonContainer}>
          <View style={styles.kakaoButton}>
            <View style={styles.googleLogoContainer}>
              <FastImage
                source={require('../../assets/kakao-symbol.png')}
                style={styles.googleLogo}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
            <Text style={styles.googleText} allowFontScaling={false}>
              카카오 로그인
            </Text>
            <View style={{width: 30}} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          style={styles.googleButtonContainer}>
          <View style={styles.googleView}>
            <View style={styles.googleLogoContainer}>
              <FastImage
                source={require('../../assets/g-logo.png')}
                style={styles.googleLogo}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
            <Text style={styles.googleText} allowFontScaling={false}>
              Google 로그인
            </Text>
            <View style={{width: 30}} />
          </View>
        </TouchableOpacity>
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            onPress={handleAppleSignIn}
            style={[styles.googleButtonContainer, {marginBottom: 20}]}>
            <View style={styles.googleView}>
              <View style={styles.googleLogoContainer}>
                <FastImage
                  source={require('../../assets/appleLogo.png')}
                  style={styles.appleLogo}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <Text style={styles.appleText} allowFontScaling={false}>
                Apple 로그인
              </Text>
              <View style={{width: 30, marginTop: 20}} />
            </View>
          </TouchableOpacity>
        )}
      </View>
      {loading && <Loading loading={true} />}
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
  LogoName: {
    width: 210,
    height: 70,
  },
  logoView: {
    marginTop: 130,
    alignItems: 'center',
  },

  subText: {
    fontSize: 18,
    color: '#181A1A',
    textAlign: 'center',
    fontFamily: 'Pretendard-Medium', // 커스텀 폰트 적용
    marginTop: 10,
    lineHeight: 30,
  },
  loginView: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 70 : 120, // OS별 높이 설정
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
    fontFamily: 'Pretendard-SemiBold', // 커스텀 폰트 적용
  },
  kakaoButtonContainer: {
    width: 340,
    height: 50,
    marginTop: 20,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 5,
    borderRadius: 10,
    backgroundColor: '#FEE500',
  },
  kakaoButton: {
    width: 340,
    height: 50,
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    textAlign: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FEE500',
  },
  googleButtonContainer: {
    width: 340,
    height: 50,
    marginTop: 20,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 2,
    borderRadius: 10,
    elevation: 5,
  },
  googleLogo: {
    width: 23,
    height: 23,
    resizeMode: 'contain',
  },
  googleView: {
    width: 340,
    height: 50,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    textAlign: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    padding: 10,
    borderRadius: 10,
  },
  googleText: {
    color: '#333',
    fontSize: 16,
    marginHorizontal: 50,

    fontFamily: 'Pretendard-SemiBold', // 커스텀 폰트 적용
  },
  appleLogo: {
    width: 50,
    height: 50,
    marginLeft: -10,
    borderRadius: 10,
  },
  appleText: {
    color: '#333',
    fontSize: 16,
    paddingRight: 10,
    fontFamily: 'Pretendard-SemiBold', // 커스텀 폰트 적용
  },
  unLoginText: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Pretendard-Medium', // 커스텀 폰트 적용
    marginTop: 30,
  },
});

export default OAuthLoginScreen;
