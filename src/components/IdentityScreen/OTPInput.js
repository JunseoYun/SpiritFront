import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const OTPInput = ({
  isotpcodeFocused,
  otpcodeRef,
  error,
  otpcode,
  setOTPCode,
  setIsOTPcodeFocused,
  formatTimeLeft,
  handleResend,
  timeLeft,
}) => {
  return (
    <View style={[styles.labeledInputContainer, {marginBottom: 20}]}>
      <Text style={[styles.inputLabel, isotpcodeFocused && {color: 'black'}]}>
        인증번호
      </Text>

      <View style={styles.inputWithTimerWrapper}>
        <TextInput
          ref={otpcodeRef}
          style={[
            styles.input,
            isotpcodeFocused && styles.inputFocused,
            error === 'otpcode' && styles.errorFocused,
          ]}
          placeholder={'6자리 입력'}
          placeholderTextColor="#999"
          keyboardType="number-pad"
          value={otpcode}
          onChangeText={text => {
            setOTPCode(text);
          }}
          onFocus={() => setIsOTPcodeFocused(true)}
          onBlur={() => setIsOTPcodeFocused(false)}
          maxLength={6}
        />
        <View style={styles.timerInsideInput}>
          <Text style={styles.timerText}>{formatTimeLeft(timeLeft)}</Text>
          <TouchableOpacity style={styles.resendbtn} onPress={handleResend}>
            <Text style={styles.resendText}>다시 받기</Text>
          </TouchableOpacity>
        </View>
      </View>
      {error === 'otpcode' && (
        <Text style={styles.errorMessage}>인증번호가 올바르지 않습니다.</Text>
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

  inputWithTimerWrapper: {
    position: 'relative',
  },

  timerInsideInput: {
    flexDirection: 'row',
    position: 'absolute',
    gap: 10,
    right: 20,
    height: '100%',
    alignItems: 'center',
  },

  timerText: {
    padding: 5,
    fontSize: 12,
    color: '#FF4816',
    fontFamily: 'Pretendard-Medium',
  },
  resendbtn: {
    padding: 5,
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 5,
  },
  resendText: {
    fontSize: 12,
    color: '#444',
    fontFamily: 'Pretendard-Medium',
  },
});
export default OTPInput;
