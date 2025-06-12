import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

const MenuInput = ({
  label, // 입력 필드의 라벨
  value, // 입력 값
  onChangeText, // 값 변경 핸들러
  placeholder, // 플레이스홀더
  multiline = false, // 여러 줄 입력 여부
  maxLength,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = text => {
    const lines = text.split('\n'); // 줄바꿈 개수 확인
    if (lines.length > 2) return; // ✅ 3줄 초과 입력 방지

    if (onChangeText) {
      onChangeText(text);
    }
  };

  return (
    <View style={styles.container}>
      {value && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          multiline ? styles.inputMultiline : styles.input,
          {borderBottomColor: isFocused ? '#16BBFF' : '#F2F2F2'},
        ]}
        value={value}
        onChangeText={handleTextChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={maxLength}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginHorizontal: 20,
  },
  label: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    marginTop: 10,
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    fontSize: 20,
    fontWeight: '500',
    paddingVertical: 5,
    paddingLeft: 1,
    marginBottom: 20,
    color: 'black',
  },
  inputMultiline: {
    width: '100%',
    minHeight: 30,
    paddingVertical: 10,
    borderBottomWidth: 1,
    fontSize: 20,
    fontWeight: '500',
    textAlignVertical: 'top',
    marginBottom: 20,
    color: 'black',
  },
});

export default MenuInput;
