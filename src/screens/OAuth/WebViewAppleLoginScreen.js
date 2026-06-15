import React from 'react';
import {View, Button, Alert} from 'react-native';
import {appleAuth} from '@invertase/react-native-apple-authentication';
import {
  getAuth,
  signInWithCredential,
  AppleAuthProvider,
} from '@react-native-firebase/auth';

const AppleLoginScreen = ({navigation}) => {
  const signInWithApple = async () => {
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      const {identityToken} = appleAuthRequestResponse;

      if (identityToken) {
        const authInstance = getAuth();
        const appleCredential = AppleAuthProvider.credential(identityToken);
        await signInWithCredential(authInstance, appleCredential);
        navigation.goBack(); // 또는 홈 화면 등 이동
      } else {
        Alert.alert('로그인 실패', '토큰을 가져올 수 없습니다.');
      }
    } catch (error) {
      Alert.alert('로그인 실패', 'Apple 로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="Apple 로그인" onPress={signInWithApple} />
    </View>
  );
};

export default AppleLoginScreen;
