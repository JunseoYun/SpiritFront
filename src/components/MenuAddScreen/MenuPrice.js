import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MenuPrice = ({
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
}) => {
  const handleTextChange = text => {
    const lines = text.split('\n'); // 줄바꿈 개수 확인
    if (lines.length > 2) return; // ✅ 3줄 초과 입력 방지

    if (onChangeText) {
      onChangeText(text);
    }
  };

  return (
    <View style={styles.inputContainer}>
      <View style={styles.labelRow}>
        {(isVariable || value) && <Text style={styles.label}>{label}</Text>}

        <Pressable onPress={onToggleVariable} style={styles.checkRow}>
          <Icon
            name={isVariable ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={18}
            color={isVariable ? '#45C9FF' : '#999'}
          />
          <Text
            style={[
              styles.checkLabel,
              {color: isVariable ? '#45C9FF' : '#999'},
            ]}>
            변동
          </Text>
        </Pressable>
      </View>
      {!isVariable && (
        <TextInput
          style={[styles.input, multiline && styles.textarea, style]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          multiline={multiline}
          maxLength={maxLength}
          numberOfLines={3}
          keyboardType="number-pad"
        />
      )}
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
    marginRight: 10,
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
    textAlignVertical: 'top', // ✅ multiline에서 내용 정렬
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkLabel: {
    fontSize: 15,
    marginLeft: 4,
    fontFamily: 'Pretendard-Medium',
  },
});

export default MenuPrice;
