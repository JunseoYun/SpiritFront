import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

const MainAlcoholCheck = ({isChecked, onToggle}) => {
  return (
    <Pressable style={styles.container} onPress={onToggle}>
      <View
        style={[
          styles.checkBoxIndicator,
          isChecked && {backgroundColor: '#16BBFF'}, // 활성화된 상태 스타일
        ]}
      />
      <Text style={styles.checkBoxText}>대표 주종으로 설정</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '40%',
    marginHorizontal: 18,
    flexDirection: 'row',
    paddingVertical: 10,
    marginVertical: 20,
  },
  checkBoxIndicator: {
    width: 20,
    height: 20,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 10,
  },
  checkBoxText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default MainAlcoholCheck;
