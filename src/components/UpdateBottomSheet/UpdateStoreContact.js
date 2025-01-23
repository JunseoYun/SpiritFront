import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트

const UpdateStoreContact = ({
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
}) => {
  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>매장 번호</Text>
      <TextInput
        style={styles.input}
        defaultValue={updatedValue}
        onChangeText={text => setUpdatedValue(text)}
        placeholder="매장 번호 입력"
        keyboardType="phone-pad"
      />
      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreContact;

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    fontSize: 20,
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#999',
    padding: 10,
    paddingVertical: 15,
  },
});
