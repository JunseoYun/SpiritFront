import React from 'react';
import { Button, View, Text } from 'react-native';
import { loginWithKakaoAccount, getProfile, logout } from '@react-native-seoul/kakao-login';

const FindPwdScreen = ({ navigation }) => {
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

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="카카오 로그인" onPress={handleKaKaoLogin} />
            <Button title="카카오 로그아웃" onPress={handleKaKaoLogout} />
        </View>
    );
};

export default FindPwdScreen;
