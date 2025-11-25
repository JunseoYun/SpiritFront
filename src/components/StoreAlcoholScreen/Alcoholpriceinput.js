import React, {useState} from 'react';
import {TextInput, Text, View, StyleSheet, Pressable} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomText from '../common/CustomText';
import CustomTextInput from '../common/CustomTextInput';

const Alcoholpriceinput = ({
  label,
  value,
  onChangeText,
  placeholder,
  isMultiline = false,
  onToggleVariable = () => {},
  isVariable,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <CustomText style={styles.label}>{label}</CustomText>

      <View style={styles.inputRow}>
        {!isVariable && (
          <CustomTextInput
            style={[
              isMultiline ? styles.inputMultiline : styles.input,
              {borderBottomColor: isFocused ? '#3CBBFF' : '#F2F2F2'},
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

      {/* ✅ 체크박스 변동 */}
      <Pressable style={styles.checkRow} onPress={onToggleVariable}>
        <View style={[styles.checkBox, isVariable && styles.checkBoxChecked]}>
          {isVariable && <Icon name="check" size={16} color="#fff" />}
        </View>
        <CustomText
          style={[styles.checkLabel, isVariable && styles.checkLabelActive]}>
          변동
        </CustomText>
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
    marginBottom: 8,
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
    minHeight: 30,
    paddingVertical: 12,
    borderBottomWidth: 1,
    fontSize: 18,
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
  checkLabel: {
    fontSize: 15,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  checkLabelActive: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
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
});

export default Alcoholpriceinput;
