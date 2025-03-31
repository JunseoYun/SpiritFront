import React from 'react';
import {View, Pressable, Text, StyleSheet} from 'react-native';

const ActionButtons = ({onCancel, onSave}) => (
  <View style={styles.buttonView}>
    <Pressable style={styles.cancelButton} onPress={onCancel}>
      <Text style={styles.buttonText}>취소</Text>
    </Pressable>
    <Pressable style={styles.saveButton} onPress={onSave}>
      <Text style={[styles.buttonText, {color: '#fff'}]}>저장</Text>
    </Pressable>
  </View>
);

export default ActionButtons;

const styles = StyleSheet.create({
  buttonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    width: '49%',
    borderRadius: 7,
    alignItems: 'center',
    backgroundColor: '#EDEDED',
  },
  saveButton: {
    width: '49%',
    borderRadius: 7,
    backgroundColor: '#5CCEFF',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 20,
    padding: 12,
    color: '#39C4FF',
  },
});
