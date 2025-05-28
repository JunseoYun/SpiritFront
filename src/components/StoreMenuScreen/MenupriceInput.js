import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, Switch} from 'react-native';

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
    <View style={styles.inputContainer}>
      <View style={styles.checkRow}>
        <Text
          style={[styles.checkLabel, {color: isVariable ? '#45C9FF' : '#999'}]}>
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
            keyboardType="number-pad"
            placeholderTextColor="#999"
          />
        )}
      </View>
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
    fontWeight: '500',
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
  inputMultiline: {
    width: '100%',
    minHeight: 30,
    paddingVertical: 10,
    borderBottomWidth: 1,
    fontSize: 20,
    fontWeight: '500',
    textAlignVertical: 'top',
    marginBottom: 20,
    color: 'black',
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
    marginBottom: 10,
  },
  checkLabel: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // ✅ 좌우로 정렬
  },
});

export default MenupriceInput;
