import React, {useState, forwardRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
const MenuTextInput = forwardRef(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      placeholderTextColor = '#999',
      multiline = false,
      style = {},
      maxLength,
      onSubmitEditing,
      returnKeyType = 'next',
    },
    ref,
  ) => {
    const handleTextChange = text => {
      if (onChangeText) {
        onChangeText(text);
      }
    };

    return (
      <View style={styles.inputContainer}>
        {value && <Text style={styles.label}>{label}</Text>}
        <TextInput
          style={[styles.input, multiline && styles.textarea, style]}
          value={value}
          ref={ref}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          multiline={multiline}
          maxLength={maxLength}
          numberOfLines={3}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
      </View>
    );
  },
);

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 20,
    width: '100%',
    paddingHorizontal: 18,
  },
  label: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  input: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 7,
    paddingLeft: 1,
    color: 'black',
  },
  textarea: {
    textAlignVertical: 'top', // ✅ multiline에서 내용 정렬
  },
});

export default MenuTextInput;
