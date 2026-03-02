import React from 'react';
import {View, Text, TextInput, StyleSheet, Keyboard} from 'react-native';
import CancelText from '../CancelText/CancelText';
import {normalizeFont} from '../../hooks/normalizeFont';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';

const RRNInput = ({
  showrrfLabel,
  rrnFrontRef,
  rrnfplaceholder,
  rrnFront,
  setRrnFront,
  isrrnfFocused,
  setIsrrnfFocused,
  rrnBackRef,
  isrrnbFocused,
  rrnBack,
  setRrnBack,
  setIsrrnbFocused,
  error,
  phoneRef,
  phoneNumber,
}) => {
  return (
    <View style={{marginBottom: 20}}>
      <View style={styles.rrnContainer}>
        <View style={[styles.labeledInputContainer, {flex: 6}]}>
          {showrrfLabel && (
            <CustomText
              style={[
                styles.inputLabel,
                (isrrnfFocused || isrrnbFocused) && {
                  color: 'black',
                },
              ]}>
              주민등록번호
            </CustomText>
          )}
          <CustomTextInput
            ref={rrnFrontRef}
            style={[
              styles.input,
              isrrnfFocused && styles.inputFocused,
              error === 'rrnFront' && styles.errorFocused,
            ]}
            placeholder={rrnfplaceholder}
            placeholderTextColor="#999"
            keyboardType="number-pad"
            value={rrnFront}
            onChangeText={text => {
              setRrnFront(text);
              if (text.length === 6 && rrnBack == '') {
                setTimeout(() => rrnBackRef.current?.focus(), 50);
              }
              if (text.length === 6 && phoneNumber) {
                Keyboard.dismiss();
              }
            }}
            onFocus={() => setIsrrnfFocused(true)}
            onBlur={() => setIsrrnfFocused(false)}
            maxLength={6}
          />
          {rrnFront.length > 0 && isrrnfFocused && (
            <CancelText
              rightnum={10}
              topnum={12}
              paddingnum={4}
              handlecancel={setRrnFront}
              size={normalizeFont(20)}
            />
          )}
        </View>
        <CustomText
          style={{
            alignSelf: 'center',
            flex: 1,
            textAlign: 'center',
          }}>
          -
        </CustomText>
        <CustomTextInput
          ref={rrnBackRef}
          style={[
            styles.input,
            isrrnbFocused && styles.inputFocused,
            error === 'rrnBack' && styles.errorFocused,
            {flex: 1},
          ]}
          placeholder=""
          keyboardType="number-pad"
          value={rrnBack}
          onChangeText={text => {
            setRrnBack(text);
            if (text.length === 1 && phoneNumber == '') {
              setTimeout(() => phoneRef.current?.focus(), 50);
            }
            if (text.length === 1 && phoneNumber) {
              Keyboard.dismiss();
            }
          }}
          onFocus={() => setIsrrnbFocused(true)}
          onBlur={() => setIsrrnbFocused(false)}
          maxLength={1}
        />
        <CustomText
          style={{
            flex: 4,
            textAlign: 'center',
            paddingHorizontal: 5,
            textAlignVertical: 'center',
            fontSize: 12,
          }}
          maxScale={1}
          numberOfLines={1}
          ellipsizeMode="clip">
          ● ● ● ● ● ●
        </CustomText>
      </View>
      {(error === 'rrnFront' || error === 'rrnBack') && (
        <CustomText style={styles.errorMessage}>
          올바른 주민번호를 입력해주세요.
        </CustomText>
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
  rrnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
    marginHorizontal: 5,
    fontFamily: 'Pretendard-Medium',
  },
});

export default RRNInput;
