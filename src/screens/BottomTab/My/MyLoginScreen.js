import React, {useEffect, useRef} from 'react';
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
import {user_login} from '../../../api/userApi';
import {useAuth} from '../../../context/AuthContext';
import Config from 'react-native-config';
import FastImage from 'react-native-fast-image';
import {setUnLogin, clearUnLogin} from '../../../storage/tokenStorage';
const MyLoginScreen = ({navigation}) => {
  const {loginauth, clearUnLogout} = useAuth();

  useEffect(() => {
    GoogleSignin.revokeAccess();
    GoogleSignin.configure({
      webClientId: Config.GOOGLE_WEB_CLIENT_ID,
      iosClientId: Config.GOOGLE_CLIENT_ID,
    });
  }, []);

  const handleLogin = async ({type, id, socialToken}) => {
    try {
      const response = await user_login(type, id, socialToken);
      await loginauth(response.accessToken, response.refreshToken);
      clearUnLogout();
    } catch (error) {
      if (error.response) {
        const {status, data, headers} = error.response;
        if (status === 404) {
          // navigation.navigate('AgreeScreen', {
          //   type: type,
          //   id: id,
          //   socialToken: socialToken,
          // });

          navigation.navigate('OAuthStack', {
            screen: 'AgreeScreen',
            params: {
              type: type,
              id: id,
              socialToken: socialToken,
            },
          });
        }
      }
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
      const type = 'KAKAO';
      const id = profile.id;
      const socialToken = token.accessToken;
      handleLogin({type, id, socialToken});
    } catch (err) {}
  };

  const handleGoogleSignIn = async () => {
    try {
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      const type = 'GOOGLE';
      const id = userInfo.data.user.id;
      const socialToken = userInfo.data.idToken;
      handleLogin({type, id, socialToken});
    } catch (error) {
      console.log(error);
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
        const socialToken = appleAuthRequestResponse.identityToken;
        handleLogin({type, id, socialToken});
      }
    } catch (error) {}
  };

  const unLoginHandle = async () => {
    await setUnLogin();
  };

  return (
    <SafeAreaView style={styles.background}>
      {/* <View style={{height: 7, backgroundColor: '#EDEDED', marginTop: 30}} /> */}
      <View style={styles.logoView}>
        <Text style={styles.title}>로그인이 필요합니다</Text>
        <Text style={styles.subText}>
          찜한 매장 보기, 리뷰 작성, 매장 등록 등{'\n'}
          다양한 기능을 사용하려면 로그인이 필요해요.
        </Text>
      </View>
      <View style={styles.loginView}>
        <TouchableOpacity
          onPress={handleKaKaoLogin}
          style={styles.kakaoButtonContainer}>
          <View style={styles.kakaoButton}>
            <FastImage
              source={require('../../../assets/kakao-symbol.png')}
              style={styles.googleLogo}
              resizeMode={FastImage.resizeMode.contain}
            />

            <View />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleGoogleSignIn}
          style={styles.googleButtonContainer}>
          <View style={styles.googleView}>
            <FastImage
              source={require('../../../assets/g-logo.png')}
              style={styles.googleLogo}
              resizeMode={FastImage.resizeMode.contain}
            />
          </View>
        </TouchableOpacity>
        {Platform.OS === 'ios' ? (
          <TouchableOpacity
            onPress={handleAppleSignIn}
            style={styles.googleButtonContainer}>
            <View style={[styles.googleView, {padding: 3}]}>
              <FastImage
                source={require('../../../assets/appleLogo.png')}
                style={styles.appleLogo}
                resizeMode={FastImage.resizeMode.contain}
              />
            </View>
          </TouchableOpacity>
        ) : (
          <View style={{height: 50, marginTop: 20}} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  logoView: {
    alignItems: 'center',
  },
  Logo: {
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 60,
    color: '#45C9FF',
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },

  subText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'Pretendard-Regular', // 커스텀 폰트 적용
    marginTop: 10,
    lineHeight: 30,
  },
  loginView: {
    alignItems: 'center',
    flexDirection: 'row',
    padding: 12,
    justifyContent: 'center',
    marginTop: 30,
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
    marginHorizontal: 20,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 5,
    borderRadius: 50,
    backgroundColor: '#FEE500',
  },
  kakaoButton: {
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    textAlign: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#FEE500',
  },
  googleButtonContainer: {
    marginHorizontal: 20,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 2,
    borderRadius: 50,
    elevation: 5,
  },
  googleLogo: {
    width: 23,
    height: 23,
    resizeMode: 'contain',
    borderRadius: 50,
  },
  googleView: {
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignContent: 'center',
    textAlign: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 50,
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

    borderRadius: 50,
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

export default MyLoginScreen;
