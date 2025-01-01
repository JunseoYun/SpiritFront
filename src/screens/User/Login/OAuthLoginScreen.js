import React, { useEffect } from 'react';
import { Button, View, Text, ImageBackground, TouchableOpacity, Image, StyleSheet, Platform, SafeAreaView, Alert } from 'react-native';
import { loginWithKakaoAccount, getProfile, logout } from '@react-native-seoul/kakao-login';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { setToken, removeToken } from '../../../storage/tokenStorage';
import { useAuth } from '../../../context/AuthContext';

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

  const handleKaKaoLogin = async () => {
    try {
      const token = await loginWithKakaoAccount();
      console.log('Kakao Login Token:', token);
      login(token.accessToken);

      const profile = await getProfile();
      console.log('Kakao Profile:', profile.id);
    } catch (err) {
      console.error('Kakao Login Error:', err);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userInfo = await GoogleSignin.signIn();
      console.log('Google UserInfo:', userInfo.data.user);
      console.log('Google UserID:', userInfo.data.user.id);

      const tokens = await GoogleSignin.getTokens();
      console.log("Google Access Token: ", tokens.accessToken);
      login(tokens.accessToken);
      console.log("Google Refresh Token: ", tokens.idToken);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAppleSignIn = async () => {
    Alert.alert("돈 없음 연회비 12만원 드가자")
  };

  return (
    <ImageBackground
      source={require('../../../assets/LoginBack.png')}
      style={styles.background}
    >
      <SafeAreaView>
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

    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
