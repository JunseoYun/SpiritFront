import React, {useEffect} from 'react';
import {Button, View, Text} from 'react-native';

import {useAuth} from '../../../context/AuthContext';
import {
  testSetAccessTokenToken,
  testSetRefreshTokenToken,
} from '../../../storage/tokenStorage';

const Logout = ({navigation}) => {
  const {logout} = useAuth();

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error('Log-Out Error:', error);
      Alert.alert('로그아웃 오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  const handleTestAccessSetToken = async () => {
    try {
      await testSetAccessTokenToken('!@#123ddasd123');
    } catch (error) {}
  };

  const handleTestRefreshSetToken = async () => {
    try {
      await testSetRefreshTokenToken('!@#123ddasd123');
    } catch (error) {}
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="걍 다 로그아웃" onPress={handleLogout} />
      <Button
        title="엑세스 토큰 일부러 망가뜨리기"
        onPress={handleTestAccessSetToken}
      />
      <Button
        title="리프레시 토큰 일부러 망가뜨리기"
        onPress={handleTestRefreshSetToken}
      />
      <Button
        title="MyScreen넘어가기"
        onPress={() => {
          navigation.navigate('MyStack', {
            screen: 'MyScreen',
          });
        }}
      />
    </View>
  );
};

export default Logout;
