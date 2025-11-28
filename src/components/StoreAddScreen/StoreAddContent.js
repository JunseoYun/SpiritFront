import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import ColorUtil from '../../utils/ColorUtil';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';

const MAX_CONTENT_LENGTH = 500;

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
          {!isRegistration && (
            <CustomText style={styles.label}>매장 소개</CustomText>
          )}
          <View style={styles.inputContainer}>
            <CustomTextInput
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
              onChangeText={setStoreContent}
              maxLength={MAX_CONTENT_LENGTH}
              placeholder="매장 소개는 최대 500자입니다.(선택)"
              placeholderTextColor={ColorUtil.placeholderText}
              onFocus={() => {
                setFocusedInput(true);
                onFocusInput?.(storeContentInputRef, 120);
              }}
              onBlur={() => setFocusedInput(false)}
              returnKeyType="done"
            />
          </View>
          <View style={styles.charCountRow}>
            <CustomText style={styles.charCountText}>
              {storeContent.length}/{MAX_CONTENT_LENGTH}
            </CustomText>
          </View>
        </View>

        {errors.storeContent && (
          <CustomText style={styles.errorText}>
            {errors.storeContent}
          </CustomText>
        )}
      </View>
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
    paddingRight: 14,
    paddingTop: 16,
    paddingBottom: 16,
    textAlignVertical: 'top',
  },
  focusedInput: {
    borderColor: '#333',
  },
  charCountRow: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  charCountText: {
    color: '#666',
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
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
