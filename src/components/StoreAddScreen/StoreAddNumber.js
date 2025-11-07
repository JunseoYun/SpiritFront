import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import ColorUtil from '../../utils/ColorUtil';

const StorAddeNumber = ({
  storeNumber,
  setStoreNumber,
  error,
  onFocusInput,
  type = 'default',
}) => {
  const isRegistration = type === 'registration';
  const [focusedInput, setFocusedInput] = useState(false);
  const [errors, setErrors] = useState({});
  const storeNumberInputRef = useRef(null);
  const [overText, setOverText] = useState(false);

  // reanimated shared value
  const labelAnim = useSharedValue(storeNumber !== '' ? 1 : 0);

  useEffect(() => {
    labelAnim.value = withTiming(focusedInput || storeNumber !== '' ? 1 : 0, {
      duration: 120,
    });
  }, [focusedInput, storeNumber]);

  useEffect(() => {
    if (error === 'storeNumber' && storeNumberInputRef.current) {
      storeNumberInputRef.current.focus();
    }
  }, [error]);

  return (
    <View>
      <View
        style={[
          styles.storeinputview,
          isRegistration && styles.registrationSpacing,
        ]}>
        <View style={styles.inputWrapper}>
          {!isRegistration && <Text style={styles.label}>매장 연락처</Text>}
          <View style={styles.inputContainer}>
            <TextInput
              ref={storeNumberInputRef}
              style={[
                styles.storeinput,
                focusedInput && styles.focusedInput,
                storeNumber.length > 0 && {
                  color: '#333',
                }, // 입력됐을 때 색상 변경
              ]}
              value={storeNumber}
              onChangeText={text => {
                const maxChars = 50;
                if (text.length > maxChars) {
                  setOverText(true);
                  return; // 초과 입력 무시
                } else {
                  setOverText(false);
                }
                setStoreNumber(text);
              }}
              keyboardType="number-pad"
              placeholder="매장 연락처를 입력해주세요"
              placeholderTextColor={ColorUtil.placeholderText}
              onFocus={() => {
                setFocusedInput(true);
                onFocusInput?.(storeNumberInputRef, 60);
              }}
              onBlur={() => setFocusedInput(false)}
              returnKeyType="done"
            />
          </View>
        </View>

        {overText && (
          <Text style={styles.errorText}>
            매장 번호는 최대 50자까지 입력 가능합니다.
          </Text>
        )}
        {errors.storeNumber && (
          <Text style={styles.errorText}>{errors.storeNumber}</Text>
        )}
      </View>
      {error === 'storeNumber' && storeNumber === '' && (
        <Text style={styles.errorMessage}>매장 번호를 입력해주세요.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 30,
    marginHorizontal: 18,
  },
  registrationSpacing: {
    marginTop: 0,
  },
  label: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 15,
    marginBottom: 12,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
  },
  storeinput: {
    flex: 1,
    height: 52,
    borderColor: ColorUtil.placeholderBorder,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingRight: 42,
  },
  focusedInput: {
    borderColor: '#333',
  },

  errorText: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Pretendard-Medium',
  },
  errorMessage: {
    color: '#FF4816',
    marginTop: 5,
    marginHorizontal: 18,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
});

export default StorAddeNumber;
