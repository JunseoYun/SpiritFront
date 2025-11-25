import React from 'react';
import {View, Text, TextInput, StyleSheet, Keyboard} from 'react-native';
import CancelText from '../CancelText/CancelText';
import {normalizeFont} from '../../hooks/normalizeFont';
import CustomText from '../common/CustomText';
import CustomTextInput from '../common/CustomTextInput';

const PhoneInput = ({
  showphoneLabel,
  isphoneFocused,
  phoneRef,
  error,
  phoneplaceholder,
  phoneNumber,
  setPhoneNumber,
  selectedCarrier,
  setIsCarrierModalVisible,
  setIsphoneFocused,
}) => {
  return (
    <View style={[styles.labeledInputContainer, {marginBottom: 20}]}>
      {showphoneLabel && (
        <CustomText
          style={[
            styles.inputLabel,
            isphoneFocused && {
              color: 'black',
            },
          ]}>
          휴대폰 번호
        </CustomText>
      )}
      <CustomTextInput
        ref={phoneRef}
        style={[
          styles.input,
          isphoneFocused && styles.inputFocused,
          error === 'phoneNumber' && styles.errorFocused,
        ]}
        placeholder={phoneplaceholder}
        placeholderTextColor="#999"
        keyboardType="number-pad"
        value={phoneNumber}
        onChangeText={text => {
          setPhoneNumber(text);
          if (text.length === 11 && selectedCarrier == '') {
            setTimeout(() => {
              setIsCarrierModalVisible(true);
            }, 10);
          }
          if (text.length === 11 && selectedCarrier) {
            Keyboard.dismiss();
          }
        }}
        onFocus={() => setIsphoneFocused(true)}
        onBlur={() => setIsphoneFocused(false)}
        maxLength={11}
      />
      {error === 'phoneNumber' && (
        <CustomText style={styles.errorMessage}>
          정확한 번호를 작성해주세요.
        </CustomText>
      )}
      {phoneNumber.length > 0 && isphoneFocused && (
        <CancelText
          rightnum={10}
          topnum={12}
          paddingnum={4}
          handlecancel={setPhoneNumber}
          size={normalizeFont(20)}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  labeledInputContainer: {
    position: 'relative',
  },
  inputLabel: {
    position: 'absolute',
    top: -7,
    left: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    fontSize: 12,
    color: '#999',
    zIndex: 1,
    fontFamily: 'Pretendard-Medium',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputFocused: {
    borderWidth: 2,
    borderColor: 'black',
  },
  errorFocused: {
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
    marginHorizontal: 5,
    fontFamily: 'Pretendard-Medium',
  },
});

export default PhoneInput;
