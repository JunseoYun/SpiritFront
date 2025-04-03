import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';

const OperateBottomBreakToggle = ({onPress, hasBreakTime}) => {
  return (
    <Pressable onPress={onPress} style={styles.addBreakButton}>
      <Text style={styles.addBreakText}>
        {hasBreakTime ? '- 브레이크타임 제거' : '+ 브레이크타임 추가'}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  addBreakButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  addBreakText: {
    color: '#45C9FF',
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
  },
});

export default OperateBottomBreakToggle;
