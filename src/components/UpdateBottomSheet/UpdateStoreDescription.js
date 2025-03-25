import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트

const UpdateStoreDescription = ({
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
}) => {
  const [overText, setOverText] = useState(false);

  const handleContentChange = text => {
    const maxLines = 5; // 최대 줄 개수
    const maxChars = 100; // 최대 글자 수

    // 🔥 줄 개수 확인 (빈 줄 제외)
    const lines = text.split('\n'); // 🔥 입력된 줄 개수 확인
    if (lines.length > maxLines || text.length > maxChars) {
      setOverText(true);
      return;
    }

    setOverText(false);
    setUpdatedValue(text);
  };

  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>매장 소개</Text>
      <TextInput
        multiline
        style={styles.input}
        value={updatedValue} // 🔥 `defaultValue` 대신 `value` 사용
        onChangeText={handleContentChange}
        placeholder="매장 소개를 입력하세요"
        textAlignVertical="top" // 🔥 입력 시 텍스트가 위쪽 정렬되도록 설정
      />
      {overText && (
        <Text style={styles.errorText}>
          매장 소개는 최대 5줄, 최대 100자까지 입력 가능합니다.
        </Text>
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
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    fontSize: 15,
    fontWeight: '500',
    borderWidth: 1,
    borderRadius: 7,
    borderColor: '#999',
    padding: 10,
    paddingVertical: 15,
    textAlignVertical: 'top', // 🔥 다중 줄 입력 시 텍스트 정렬 (위쪽 정렬)
    maxHeight: 150, // 🔥 5줄까지 표시할 수 있도록 설정
  },
  errorText: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
  },
});
