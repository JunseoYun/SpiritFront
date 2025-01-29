import React from 'react';
import {View, Pressable, Text, StyleSheet, Button} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import {
  testSetAccessTokenToken,
  testSetRefreshTokenToken,
} from '../../storage/tokenStorage';

const CFActionbtn = ({navigation}) => {
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
    <>
      <View style={styles.container}>
        <Pressable onPress={handleLogout}>
          <Text style={styles.label}>로그아웃</Text>
        </Pressable>
        <View style={styles.line} />
        <Pressable>
          <Text style={styles.label}>회원탈퇴</Text>
        </Pressable>
        <View style={styles.line} />
        <Pressable onPress={handleTestAccessSetToken}>
          <Text style={styles.label}>엑세스 토큰 X</Text>
        </Pressable>
        <View style={styles.line} />
        <Pressable onPress={handleTestRefreshSetToken}>
          <Text style={styles.label}>리프레시 토큰 X</Text>
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 330,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
  },
  line: {
    height: '70%',
    width: 1,
    backgroundColor: '#999',
    marginHorizontal: 10,
  },
  label: {
    color: '#999',
  },
});

export default CFActionbtn;
