import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';

const UpdateStoreDescription = ({
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
}) => {
  const [overText, setOverText] = useState(false);

  return (
    <View style={styles.bottomSheetContent}>
      <CustomText style={styles.title}>매장 소개</CustomText>
      <CustomTextInput
        multiline
        style={styles.input}
        value={updatedValue} // 🔥 `defaultValue` 대신 `value` 사용
        onChangeText={text => {
          const maxChars = 500;
          if (text.length > maxChars) {
            setOverText(true);
            return; // 초과 입력 무시
          } else {
            setOverText(false);
          }
          setUpdatedValue(text);
        }}
        placeholder="매장 소개를 입력하세요"
        textAlignVertical="top" // 🔥 입력 시 텍스트가 위쪽 정렬되도록 설정
        placeholderTextColor="#999"
      />
      {overText && (
        <CustomText style={styles.errorText}>
          매장 소개는 최대 500자까지 입력 가능합니다.
        </CustomText>
      )}
      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreDescription;

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
    fontSize: 15,
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#999',
    padding: 10,
    paddingVertical: 15,
    textAlignVertical: 'top', // 🔥 다중 줄 입력 시 텍스트 정렬 (위쪽 정렬)
    maxHeight: 150, // 🔥 5줄까지 표시할 수 있도록 설정
    color: 'black',
  },
  errorText: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
  },
});
