import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MenupriceInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  maxLength,
  onToggleVariable,
  isVariable,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = text => {
    const lines = text.split('\n');
    if (lines.length > 2) return;

    if (onChangeText) {
      onChangeText(text);
    }
  };

  return (
    <View style={styles.inputContainer}>
      {(isVariable || value) && <Text style={styles.label}>{label}</Text>}

      <View style={styles.inputRow}>
        {!isVariable && (
          <TextInput
            style={[
              multiline ? styles.inputMultiline : styles.input,
              {borderBottomColor: isFocused ? '#3CBBFF' : '#F2F2F2'},
            ]}
            value={value}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            multiline={multiline}
            textAlignVertical={multiline ? 'top' : 'center'}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            maxLength={maxLength}
            keyboardType="number-pad"
            placeholderTextColor="#999"
          />
        )}
      </View>

      <Pressable style={styles.checkRow} onPress={onToggleVariable}>
        <View style={[styles.checkBox, isVariable && styles.checkBoxChecked]}>
          {isVariable && <Icon name="check" size={16} color="#fff" />}
        </View>
        <Text
          style={[styles.checkLabel, isVariable && styles.checkLabelActive]}>
          변동
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  input: {
    flex: 1,
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 7,
    paddingLeft: 1,
    color: 'black',
  },
  inputMultiline: {
    width: '100%',
    minHeight: 30,
    paddingVertical: 10,
    borderBottomWidth: 1,
    fontSize: 20,
    fontFamily: 'Pretendard-Medium',
    textAlignVertical: 'top',
    marginBottom: 20,
    color: 'black',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkBoxChecked: {
    backgroundColor: '#3CBBFF',
    borderColor: '#3CBBFF',
  },
  checkLabel: {
    fontSize: 15,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  checkLabelActive: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
  },
});

export default MenupriceInput;
