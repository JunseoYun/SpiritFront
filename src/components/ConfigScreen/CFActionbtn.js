import React from 'react';
import {View, Pressable, Text, StyleSheet, Platform} from 'react-native';
import {useAuth} from '../../context/AuthContext';
import useCustomAlert from '../../hooks/useCustomAlert';
import CustomText from '../../utils/CustomText';

const CFActionbtn = ({navigation}) => {
  const {showAlert, AlertComponent} = useCustomAlert();
  const {logout} = useAuth();
  // const {logout, unLogin} = useAuth();

  const handleLogout = async () => {
    navigation.reset({
      index: 0,
      routes: [
        {name: 'OAuthStack', state: {routes: [{name: 'OAuthLoginScreen'}]}},
      ],
    });
    try {
      // await unLogin();
      await logout();
    } catch (error) {
      console.error('Log-Out Error:', error);
      showAlert({
        title: '로그아웃 오류',
        message: '로그아웃 중 문제가 발생했습니다.',
      });
    }
  };
  const handleWhithdraw = () => {
    navigation.navigate('WithdrawScreen');
  };

  return (
    <>
      <View style={styles.container}>
        <Pressable onPress={handleLogout}>
          <CustomText style={styles.label}>로그아웃</CustomText>
        </Pressable>
        <View style={styles.line} />
        <Pressable onPress={handleWhithdraw}>
          <CustomText style={styles.label}>회원탈퇴</CustomText>
        </Pressable>
        <AlertComponent />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 36,
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
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
  },
});

export default CFActionbtn;
