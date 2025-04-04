import React from 'react';
import {View, Text, TextInput, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AlcoholPrice = ({
  label,
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = '#999',
  multiline = false,
  style = {},
  isVariable,
  onToggleVariable,
}) => {
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
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={placeholderTextColor}
          multiline={multiline}
          keyboardType="numeric"
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
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginRight: 10,
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
    textAlignVertical: 'top',
  },
});

export default AlcoholPrice;
