import React, {forwardRef} from 'react';
import {View, Text, TextInput, StyleSheet, Switch} from 'react-native';

const AlcoholPrice = forwardRef(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      placeholderTextColor = '#999',
      multiline = false,
      style = {},
      isVariable,
      onToggleVariable,
      returnKeyType = 'done', // 기본값 설정
      onSubmitEditing,
    },
    ref,
  ) => {
    return (
      <View style={styles.inputContainer}>
        <View style={styles.checkRow}>
          <Text
            style={[
              styles.checkLabel,
              {color: isVariable ? '#45C9FF' : '#999'},
            ]}>
            변동
          </Text>
          <Switch
            value={isVariable}
            onValueChange={onToggleVariable}
            trackColor={{false: '#ccc', true: '#16BBFF'}}
            thumbColor={'#fff'}
          />
        </View>
        {(isVariable || value) && <Text style={styles.label}>{label}</Text>}

        <View style={[styles.inputRow, isVariable && null]}>
          {!isVariable && (
            <TextInput
              style={[styles.input, multiline && styles.textarea, style]}
              value={value}
              ref={ref}
              onChangeText={onChangeText}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              multiline={multiline}
              keyboardType="number-pad"
              returnKeyType={returnKeyType} // ✅ 전달받아 그대로 적용
              onSubmitEditing={onSubmitEditing}
            />
          )}
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  inputContainer: {
    marginVertical: 20,
    flex: 1,
    paddingLeft: 18,
  },
  label: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // ✅ 좌우로 정렬
  },
  input: {
    flex: 1, // ✅ 남는 공간 채우기
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
    color: 'black',
  },
  textarea: {
    textAlignVertical: 'top',
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  checkLabel: {
    fontSize: 15,
    marginRight: 5,
    fontFamily: 'Pretendard-Medium',
  },
});

export default AlcoholPrice;
