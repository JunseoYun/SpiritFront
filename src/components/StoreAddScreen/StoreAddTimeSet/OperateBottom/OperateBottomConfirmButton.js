import React from 'react';
import {Pressable, Text, StyleSheet, View} from 'react-native';

const OperateBottomConfirmButton = ({onPress, disabled}) => {
  return (
    <View style={styles.container}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={[styles.pickerOkView, disabled && {backgroundColor: '#F2F2F2'}]}>
        <Text style={styles.pickerOkText}>확인</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 18,
  },
  pickerOkView: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#3CBBFF',
    borderRadius: 7,
    alignSelf: 'center',
    width: '100%',
    marginHorizontal: 18,
  },
  pickerOkText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
  },
});

export default OperateBottomConfirmButton;
