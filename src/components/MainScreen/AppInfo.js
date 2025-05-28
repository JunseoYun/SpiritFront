import React from 'react';
import {View, Pressable, Text, StyleSheet} from 'react-native';
import {Divider} from 'react-native-paper';

const AppInfo = ({handleAgreeScreen}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.buttonText}>사업자: 스피릿</Text>
      <Text style={styles.buttonText}>대표자: 윤준서 김민 김경모</Text>
      <Text style={styles.buttonText}>
        주소: 경기 용인시 기흥구 사은로 126번길 48
      </Text>
      <Text style={styles.buttonText}>연락처: team19spirit@gmail.com</Text>

      <View style={{flexDirection: 'row'}}>
        <Pressable onPress={() => handleAgreeScreen('terms')}>
          <Text style={styles.buttonText}>서비스 이용약관</Text>
        </Pressable>

        <View style={styles.divider} />

        <Pressable onPress={() => handleAgreeScreen('privacy')}>
          <Text style={styles.buttonText}>개인정보 처리방침</Text>
        </Pressable>

        <View style={styles.divider} />
        <Pressable onPress={() => handleAgreeScreen('location')}>
          <Text style={styles.buttonText}>위치정보 이용약관</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'space-between',
    marginTop: 30,
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 18,
    paddingTop: 20,
  },
  buttonText: {
    fontSize: 12,
    color: '#777',
    paddingVertical: 5,
  },
  divider: {
    width: 1,
    backgroundColor: '#777',
    paddingVertical: 5,
    height: 10,
    alignSelf: 'center',
    marginHorizontal: 10,
  },
});

export default AppInfo;
