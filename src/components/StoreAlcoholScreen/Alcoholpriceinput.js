import React, {useState} from 'react';
import {TextInput, Text, View, StyleSheet, Pressable} from 'react-native';
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
    <View>
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
  );
};

const styles = StyleSheet.create({
  input: {
    borderBottomWidth: 1,
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
    marginBottom: 40,
    marginHorizontal: 18,
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

export default Alcoholpriceinput;
