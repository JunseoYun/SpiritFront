import React from 'react';
import {View, Pressable, Text, StyleSheet} from 'react-native';

const CFActionbtn = ({navigation}) => {
  return (
    <View style={styles.container}>
      <Pressable style={styles.row}>
        <Text style={styles.label}>로그아웃</Text>
      </Pressable>
      <View style={styles.row}>
        <Text style={styles.label}>회원 탈퇴</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 30,
    borderWidth: 2,
    borderColor: 'lightgray',
    borderRadius: 10,
  },
  row: {
    padding: 15,
    borderBottomWidth: 2,
    borderColor: 'lightgray',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CFActionbtn;
