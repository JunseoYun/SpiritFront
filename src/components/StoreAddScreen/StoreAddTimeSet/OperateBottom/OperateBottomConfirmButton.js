import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';

const OperateBottomConfirmButton = ({onPress, disabled}) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.pickerOkView, disabled && {backgroundColor: '#F2F2F2'}]}>
      <Text style={styles.pickerOkText}>확인</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pickerOkView: {
    width: '90%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#45C9FF',
    borderRadius: 7,
    paddingHorizontal: 18,
    alignSelf: 'center',
  },
  pickerOkText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
  },
});

export default OperateBottomConfirmButton;
