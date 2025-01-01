import React, { useEffect } from 'react';
import { Button, View, Text } from 'react-native';
import { loginWithKakaoAccount, getProfile, logout } from '@react-native-seoul/kakao-login';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

const FindPwdScreen = ({ navigation }) => {

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

            // 사용자 프로필 정보 가져오기
            const profile = await getProfile();
            console.log('Kakao Profile:', profile.id);

        } catch (err) {
            console.error('Kakao Login Error:', err);
        }
    };

    const handleKaKaoLogout = async () => {
        try {
            await logout();  // 카카오 로그아웃
            console.log('Kakao Logout Success');
        } catch (err) {
            console.error('Kakao Logout Error:', err);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            const userInfo = await GoogleSignin.signIn();

            console.log('Google UserInfo:', userInfo.data.user);
            console.log('Google UserID:', userInfo.data.user.id);

            // 액세스 토큰과 리프레시 토큰을 얻기
            const tokens = await GoogleSignin.getTokens();
            console.log("Google Access Token: ", tokens.accessToken);
            console.log("Google Refresh Token: ", tokens.idToken);
        } catch (error) {
            console.error(error);
        }
    };

    const handleGoogleSignOut = async () => {
        try {
            await GoogleSignin.signOut();
            console.log('Google Logout Success');
        } catch (error) {
            console.error(error);
        }
    };



    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="카카오 로그인" onPress={handleKaKaoLogin} />
            <Button title="카카오 로그아웃" onPress={handleKaKaoLogout} />
            <Button title="구글 로그인" onPress={handleGoogleSignIn} />
            <Button title="구글 로그아웃" onPress={handleGoogleSignOut} />
        </View>
    );
};

export default FindPwdScreen;
