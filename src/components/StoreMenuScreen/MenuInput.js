import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

const MenuInput = ({
  label, // 입력 필드의 라벨
  value, // 입력 값
  onChangeText, // 값 변경 핸들러
  placeholder, // 플레이스홀더
  multiline = false, // 여러 줄 입력 여부
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {value && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          multiline ? styles.inputMultiline : styles.input,
          {borderBottomColor: isFocused ? '#16BBFF' : '#F2F2F2'},
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    marginHorizontal: 20,
  },
  label: {
    marginVertical: 5,
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
    paddingVertical: 7,
    paddingLeft: 1,
    marginBottom: 20,
  },
  inputMultiline: {
    width: '100%',
    minHeight: 30,
    paddingVertical: 12,
    borderBottomWidth: 1,
    fontSize: 20,
    fontWeight: '500',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
});

export default MenuInput;
