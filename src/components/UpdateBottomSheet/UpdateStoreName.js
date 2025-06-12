import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트

const UpdateStoreName = ({updatedValue, setUpdatedValue, onCancel, onSave}) => {
  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>매장 이름</Text>
      <TextInput
        style={styles.input}
        defaultValue={updatedValue}
        onChangeText={text => setUpdatedValue(text)}
        placeholder="매장 이름*"
        placeholderTextColor="#999"
      />
      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreName;

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
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 20,
  },
  input: {
    fontSize: 20,
    fontFamily: 'Pretendard-Medium',
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#999',
    padding: 10,
    paddingVertical: 15,
    color: 'black',
  },
});
