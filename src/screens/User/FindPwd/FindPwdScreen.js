import React from 'react';
import { Button, View, Text } from 'react-native';
import { loginWithKakaoAccount} from '@react-native-seoul/kakao-login';

const FindPwdScreen = ({ navigation }) => {
    const handleLogin = async () => {
        try {
            const token = await loginWithKakaoAccount();
            console.log('Kakao Login Token:', token);

        } catch (err) {
            console.error('Kakao Login Error:', err);
        }
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Button title="카카오 로그인" onPress={handleLogin} />
        </View>
    );
};



export default FindPwdScreen;