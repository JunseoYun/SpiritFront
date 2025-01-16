import React, { useEffect } from 'react';
import { Button, View, Text, ImageBackground, TouchableOpacity, Image, StyleSheet, Platform, SafeAreaView, Alert } from 'react-native';
import { loginWithKakaoAccount, getProfile, logout } from '@react-native-seoul/kakao-login';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { setToken, removeToken } from '../../../storage/tokenStorage';
import { useAuth } from '../../../context/AuthContext';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import { userLogin } from '../../../api/userApi';

const OAuthLoginScreen = ({ navigation }) => {
  const { login } = useAuth();


  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '55496276543-b5j0de5qpjjpg55874qi4dj6fpdd7srf.apps.googleusercontent.com',
      iosClientId:
        '55496276543-acp3mpj3folinp0067iogp03cstubo4r.apps.googleusercontent.com',
    });
  }, []);

  const handleLogin = async({type, id, socialToken}) => {
    try {
      const response = await userLogin(type, id, socialToken);
    } catch (error) {
      if (error.response) {
        const { status, data, headers } = error.response;
        if (status === 404) {
          Alert.alert("404 잡았다 이새끼 ㅋㅋ");
        }
      }
    }
  };

  const handleKaKaoLogin = async () => {
    try {
      const token = await loginWithKakaoAccount();
      const profile = await getProfile();

      const type = "KAKAO";
      const id = profile.id;
      const socialToken = token.accessToken;
      handleLogin(type, id, socialToken);

    } catch (err) {
      console.error('Kakao Login Error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userInfo = await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();

      const type = "GOOGLE";
      const id = userInfo.data.user.id;
      const socialToken = tokens.accessToken;
      handleLogin(type, id, socialToken);

    } catch (error) {
      console.error(error);
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
        const type = "APPLE";
        const id = appleAuthRequestResponse.user;
        const socialToken = appleAuthRequestResponse.authorizationCode;
        console.log(type, id, socialToken);
        handleLogin(type, id, socialToken);
      } 
    } catch (error) {
      Alert.alert('Apple 로그인 오류', '로그인 중 문제가 발생했습니다.');
    }
  };


  return (

    <SafeAreaView style={styles.background}>
      <Text style={styles.Logo}>한잔할까
      </Text>
      <TouchableOpacity onPress={handleKaKaoLogin} style={styles.kakaoButtonContainer}>
        <Image
          source={require('../../../assets/kakao_login.png')}
          style={styles.kakaoButton}
        />
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGoogleSignIn} style={styles.googleButtonContainer}>
        <View style={styles.googleView}>
          <View style={styles.googleLogoContainer}>
            <Image
              source={require('../../../assets/g-logo.png')}
              style={styles.googleLogo}
            />
          </View>
          <Text style={styles.googleText}>Google 계정으로 계속하기</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleAppleSignIn} style={styles.googleButtonContainer}>
        <View style={styles.googleView}>
          <View style={styles.googleLogoContainer}>
            <Image
              source={require('../../../assets/appleLogo.png')}
              style={styles.appleLogo}
            />
          </View>
          <Text style={styles.appleText}>Apple로 로그인</Text>
        </View>
      </TouchableOpacity>
    </SafeAreaView>

  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  Logo: {
    position: 'absolute',
    top: 200,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 50,
    color: 'rgb(16, 190, 251)',
  },
  kakaoButtonContainer: {
    width: 340,
    height: 50,
    marginTop: 400,
    ...Platform.select({
      ios: {
        shadowColor: '#333',
        shadowOffset: { width: 0, height: 2 },
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
        shadowOffset: { width: 0, height: 2 },
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
