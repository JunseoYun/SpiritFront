import React, { useEffect } from 'react';
import { Button, View, Text, ImageBackground } from 'react-native';
import { loginWithKakaoAccount, getProfile, logout } from '@react-native-seoul/kakao-login';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { setToken, removeToken } from '../../../storage/tokenStorage';
import { useAuth } from '../../../context/AuthContext';


const OAuthTestScreen = ({ navigation }) => {
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




  return (
    <ImageBackground
      source={require('../../../assets/loginBackground.png')}
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <Button title="카카오 로그인" onPress={handleKaKaoLogin} />
      <Button title="구글 로그인" onPress={handleGoogleSignIn} />
    </ImageBackground>
  );
};



export default OAuthTestScreen;
