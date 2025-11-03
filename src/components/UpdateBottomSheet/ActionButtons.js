import React from 'react';
import {View, Pressable, Text, StyleSheet} from 'react-native';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';

const ActionButtons = ({onCancel, onSave, option}) => {
  const {bottom} = useSafeAndroidInsets();

  return (
    <View style={[styles.buttonView, {paddingBottom: bottom}]}>
      <Pressable style={styles.cancelButton} onPress={onCancel}>
        <Text style={styles.buttonText}>취소</Text>
      </Pressable>

      {option !== 'delete' ? (
        <Pressable style={styles.saveButton} onPress={onSave}>
          <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
        </Pressable>
      ) : (
        <Pressable style={styles.saveButton} onPress={onSave}>
          <Text style={[styles.buttonText, {color: '#fff'}]}>삭제</Text>
        </Pressable>
      )}
    </View>
  );
};

export default ActionButtons;

const styles = StyleSheet.create({
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelButton: {
    width: '49%',
    borderRadius: 7,
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
  },
  saveButton: {
    width: '49%',
    borderRadius: 7,
    backgroundColor: '#3CBBFF',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    padding: 12,
    color: '#555',
    fontFamily: 'Pretendard-Medium',
  },
});
