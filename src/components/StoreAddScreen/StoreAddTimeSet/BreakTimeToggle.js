import React from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';

const BreakTimeToggle = ({hasBreaking, handleIsBreaking}) => {
  return (
    <Pressable onPress={handleIsBreaking} style={styles.addBreakButton}>
      <Text style={styles.addBreakText}>
        {hasBreaking ? '- 브레이크타임 제거' : '+ 브레이크타임 추가'}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  addBreakButton: {
    marginTop: 20,
    alignItems: 'center',
    marginBottom: 100,
  },
  addBreakText: {
    color: '#3CBBFF',
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
  },
});

export default BreakTimeToggle;
