import React, {useState} from 'react';
import {TextInput, Text, View, StyleSheet, Switch} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Alcoholpriceinput = ({
  label,
  value,
  onChangeText,
  placeholder,
  isMultiline = false,
  onToggleVariable = false,
  isVariable,
}) => {
  const [isFocused, setIsFocused] = useState(false);

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
              isMultiline ? styles.inputMultiline : styles.input,
              {borderBottomColor: isFocused ? '#16BBFF' : '#F2F2F2'},
            ]}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            multiline={isMultiline}
            keyboardType="number-pad"
            placeholderTextColor="#999"
            textAlignVertical={isMultiline ? 'top' : 'auto'}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
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
    minHeight: 30,
    paddingVertical: 12,
    borderBottomWidth: 1,
    fontSize: 18,
    textAlignVertical: 'top',
    marginBottom: 20,
    marginHorizontal: 18,
    color: 'black',
  },
  inputText: {
    marginVertical: 5,
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
    marginTop: 10,
    marginHorizontal: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginVertical: 5,
    marginTop: 10,
    marginLeft: 18,
  },
  label: {
    fontSize: 16,
    color: '#999',
    fontWeight: '500',
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // ✅ 좌우로 정렬
  },
});

export default Alcoholpriceinput;
