import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MenupriceInput = ({
  label, // 입력 필드의 라벨
  value, // 입력 값
  onChangeText, // 값 변경 핸들러
  placeholder, // 플레이스홀더
  multiline = false, // 여러 줄 입력 여부
  maxLength,
  onToggleVariable,
  isVariable,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = text => {
    const lines = text.split('\n'); // 줄바꿈 개수 확인
    if (lines.length > 2) return; // ✅ 3줄 초과 입력 방지

    if (onChangeText) {
      onChangeText(text);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {(isVariable || value) && <Text style={styles.label}>{label}</Text>}
        <Pressable
          onPress={() => {
            onToggleVariable?.();
          }}
          style={styles.checkRow}>
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
          style={[
            multiline ? styles.inputMultiline : styles.input,
            {borderBottomColor: isFocused ? '#16BBFF' : '#F2F2F2'},
          ]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
          keyboardType="numeric"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
  },
  input: {
    marginHorizontal: 20,
    width: '100%',
    borderBottomWidth: 1,
    fontSize: 20,
    fontWeight: '500',
    paddingVertical: 5,
    paddingLeft: 1,
    marginBottom: 20,
  },
  inputMultiline: {
    width: '100%',
    minHeight: 30,
    paddingVertical: 10,
    borderBottomWidth: 1,
    fontSize: 20,
    fontWeight: '500',
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginVertical: 5,
    marginLeft: 20,
    marginTop: 10,
  },
  labelText: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
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
});

export default MenupriceInput;
