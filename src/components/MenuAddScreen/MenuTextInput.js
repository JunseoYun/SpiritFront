import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

const MenuTextInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#999',
  multiline = false,
  style = {},
}) => {
  return (
    <View style={styles.inputContainer}>
      {value && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, multiline && styles.textarea, style]}
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        multiline={multiline}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 20,
    width: '100%',
    paddingHorizontal: 18,
  },
  label: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
  },
  textarea: {
    textAlignVertical: 'top', // multiline에서 내용 정렬
  },
});

export default MenuTextInput;
