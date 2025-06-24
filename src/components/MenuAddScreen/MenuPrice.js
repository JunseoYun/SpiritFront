import React, {useState, forwardRef} from 'react';
import {View, Text, TextInput, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MenuPrice = forwardRef(
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
      isVariable,
      onToggleVariable,
      returnKeyType = 'done',
      onSubmitEditing,
    },
    ref,
  ) => {
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

        {!isVariable && (
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
            keyboardType="number-pad"
            returnKeyType={returnKeyType}
            onSubmitEditing={onSubmitEditing}
          />
        )}

        <Pressable style={styles.checkboxRow} onPress={onToggleVariable}>
          <View
            style={[styles.checkboxIcon, isVariable && styles.checkboxChecked]}>
            {isVariable && <Icon name="check" size={14} color="#fff" />}
          </View>
          <Text
            style={[
              styles.checkboxLabel,
              isVariable && styles.checkboxLabelActive,
            ]}>
            변동
          </Text>
        </Pressable>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 20,
    flex: 1,
    paddingLeft: 18,
    paddingRight: 18,
  },
  label: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingVertical: 7,
    color: 'black',
  },
  textarea: {
    textAlignVertical: 'top',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkboxIcon: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#16BBFF',
    borderColor: '#16BBFF',
  },
  checkboxLabel: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#666',
  },
  checkboxLabelActive: {
    color: '#16BBFF',
  },
});

export default MenuPrice;
