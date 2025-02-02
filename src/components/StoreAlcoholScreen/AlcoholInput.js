import React, {useState} from 'react';
import {TextInput, Text, View, StyleSheet} from 'react-native';

const AlcoholInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  isMultiline = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View>
      {value && <Text style={styles.inputText}>{label}</Text>}
      <TextInput
        style={[
          isMultiline ? styles.inputMultiline : styles.input,
          {borderBottomColor: isFocused ? '#16BBFF' : '#F2F2F2'},
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={isMultiline}
        textAlignVertical={isMultiline ? 'top' : 'auto'}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
    marginBottom: 20,
    marginHorizontal: 18,
  },
  inputMultiline: {
    minHeight: 30,
    paddingVertical: 12,
    borderBottomWidth: 1,
    fontSize: 18,
    textAlignVertical: 'top',
    marginBottom: 20,
    marginHorizontal: 18,
  },
  inputText: {
    marginVertical: 5,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    marginTop: 10,
    marginHorizontal: 18,
  },
});

export default AlcoholInput;
