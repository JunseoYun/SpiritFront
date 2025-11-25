import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

import ColorUtil from '../../utils/ColorUtil';
import CustomText from '../common/CustomText';
import CustomTextInput from '../common/CustomTextInput';

const StoreAddname = ({storename, setStorename, error, type = 'default'}) => {
  const isRegistration = type === 'registration';
  const [focusedInput, setFocusedInput] = useState(false);
  const [errors, setErrors] = useState({});
  const storeNameInputRef = useRef(null);
  const [overText, setOverText] = useState(false);

  // reanimated shared value

  useEffect(() => {
    if (error === 'storename' && storeNameInputRef.current) {
      storeNameInputRef.current.focus();
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
          {!isRegistration && (
            <CustomText style={styles.label}>매장 이름</CustomText>
          )}
          <View style={styles.inputContainer}>
            <CustomTextInput
              ref={storeNameInputRef}
              style={[
                styles.storeinput,
                focusedInput && styles.focusedInput,
                storename.length > 0 && {
                  color: '#333',
                }, // 입력됐을 때 색상 변경
              ]}
              value={storename}
              onChangeText={text => {
                const maxChars = 50;
                if (text.length > maxChars) {
                  setOverText(true);
                  return; // 초과 입력 무시
                } else {
                  setOverText(false);
                }
                setStorename(text);
              }}
              placeholder="매장 이름을 입력해주세요"
              placeholderTextColor={ColorUtil.placeholderText}
              onFocus={() => setFocusedInput(true)}
              onBlur={() => setFocusedInput(false)}
              returnKeyType="done"
            />
          </View>
        </View>

        {overText && (
          <CustomText style={styles.errorText}>
            매장 이름은 최대 50자까지 입력 가능합니다.
          </CustomText>
        )}
        {errors.storename && (
          <CustomText style={styles.errorText}>{errors.storename}</CustomText>
        )}
      </View>
      {error === 'storename' && storename === '' && (
        <CustomText style={styles.errorMessage}>
          매장이름을 입력해주세요.
        </CustomText>
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

export default StoreAddname;
