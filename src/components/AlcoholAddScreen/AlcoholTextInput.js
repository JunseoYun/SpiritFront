import React, {forwardRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

const AlcoholTextInput = forwardRef(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      placeholderTextColor = '#999',
      multiline = false,
      style = {},
      onSubmitEditing,
      returnKeyType = 'next',
    },
    ref,
  ) => {
    return (
      <View style={styles.inputContainer}>
        {value && <Text style={styles.label}>{label}</Text>}
        <TextInput
          style={[styles.input, multiline && styles.textarea, style]}
          value={value}
          ref={ref}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          multiline={multiline}
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
    color: 'black',
  },
  textarea: {
    textAlignVertical: 'top', // multiline에서 내용 정렬
  },
});

export default AlcoholTextInput;
