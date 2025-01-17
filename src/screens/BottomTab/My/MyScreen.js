import React, {useEffect} from 'react';
import {Button, View, Text} from 'react-native';

import {useAuth} from '../../../context/AuthContext';
import {testSetAccessTokenToken} from '../../../storage/tokenStorage';

const MyScreen = ({navigation}) => {
  const {logout} = useAuth();

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error('Log-Out Error:', error);
      Alert.alert('로그아웃 오류', '로그아웃 중 문제가 발생했습니다.');
    }
  };

  const handleTestSetToken = async () => {
    try {
      await testSetAccessTokenToken('!@#123ddasd123');
    } catch (error) {}
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Button title="걍 다 로그아웃" onPress={handleLogout} />
      <Button
        title="엑세스 토큰 일부러 망가뜨리기(리프레시)"
        onPress={handleTestSetToken}
      />
    </View>
  );
};

export default MyScreen;
