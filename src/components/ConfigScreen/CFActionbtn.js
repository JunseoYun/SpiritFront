import React from 'react';
import {View, Pressable, Text, StyleSheet, Button} from 'react-native';
import {useAuth} from '../../context/AuthContext';

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
