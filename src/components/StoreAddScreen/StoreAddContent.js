import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import ColorUtil from '../../utils/ColorUtil';

const StoreAddContent = ({
  storeContent,
  setStoreContent,
  error,
  onFocusInput,
  type = 'default',
}) => {
  const isRegistration = type === 'registration';
  const [focusedInput, setFocusedInput] = useState(false);
  const [errors, setErrors] = useState({});
  const storeContentInputRef = useRef(null);
  const [overText, setOverText] = useState(false);

  // reanimated shared value
  const labelAnim = useSharedValue(storeContent !== '' ? 1 : 0);

  useEffect(() => {
    labelAnim.value = withTiming(focusedInput || storeContent !== '' ? 1 : 0, {
      duration: 120,
    });
  }, [focusedInput, storeContent]);

  useEffect(() => {
    if (error === 'storeContent' && storeContentInputRef.current) {
      storeContentInputRef.current.focus();
    }
  }, [error]);

  const handleClearStoreContent = () => {
    setStoreContent('');
    requestAnimationFrame(() => {
      storeContentInputRef.current?.focus();
    });
  };

  return (
    <View>
      <View
        style={[
          styles.storeinputview,
          isRegistration && styles.registrationSpacing,
        ]}>
        <View style={styles.inputWrapper}>
          {!isRegistration && <Text style={styles.label}>매장 소개</Text>}
          <View style={styles.inputContainer}>
            <TextInput
              ref={storeContentInputRef}
              style={[
                styles.storeinput,
                focusedInput && styles.focusedInput,
                storeContent.length > 0 && {
                  color: '#333',
                }, // 입력됐을 때 색상 변경
              ]}
              multiline
              value={storeContent}
              onChangeText={text => {
                const maxChars = 500;
                if (text.length > maxChars) {
                  setOverText(true);
                  return; // 초과 입력 무시
                } else {
                  setOverText(false);
                }
                setStoreContent(text);
              }}
              placeholder="매장 소개는 최대 500자입니다."
              placeholderTextColor={ColorUtil.placeholderText}
              onFocus={() => {
                setFocusedInput(true);
                onFocusInput?.(storeContentInputRef, 120);
              }}
              onBlur={() => setFocusedInput(false)}
              returnKeyType="done"
            />
          </View>
        </View>

        {overText && (
          <Text style={styles.errorText}>
            매장 소개는 최대 500자까지 입력 가능합니다.
          </Text>
        )}
        {errors.storeContent && (
          <Text style={styles.errorText}>{errors.storeContent}</Text>
        )}
      </View>
      {error === 'storeContent' && storeContent === '' && (
        <Text style={styles.errorMessage}>매장 소개를 입력해주세요.</Text>
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
    minHeight: 130,
    borderColor: ColorUtil.placeholderBorder,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Pretendard-Regular',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingRight: 42,
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
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

export default StoreAddContent;
