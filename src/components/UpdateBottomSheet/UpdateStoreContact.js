import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트

const UpdateStoreContact = ({
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
}) => {
  const handleInputChange = text => {
    const numericText = text.replace(/[^0-9]/g, '');
    setUpdatedValue(numericText);
  };

  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>매장 번호</Text>
      <TextInput
        style={styles.input}
        value={updatedValue} // defaultValue 대신 value 사용
        onChangeText={handleInputChange}
        placeholder="매장 번호 입력"
        keyboardType="number-pad" // 숫자 키패드
        placeholderTextColor="#999"
        maxLength={15} // 입력 가능 숫자 길이 제한 (선택 사항)
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
