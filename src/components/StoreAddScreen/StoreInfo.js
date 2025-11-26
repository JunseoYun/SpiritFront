import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import forbiddenWords from '../../hooks/forbiddenWords';
import ColorUtil from '../../utils/ColorUtil';
import CancelText from '../CancelText/CancelText';
import {normalizeFont} from '../../hooks/normalizeFont';
import CustomText from '../../utils/CustomText';
import CustomTextInput from '../../utils/CustomTextInput';

const StoreInfo = ({storeData, setStoreData, error}) => {
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});
  const [overText, setOverText] = useState(false);
  const storeNumberInputRef = useRef(null);

  const storeNumberLabelAnim = useSharedValue(
    storeData.storeNumber !== '' ? 1 : 0,
  );
  const storeContentLabelAnim = useSharedValue(
    storeData.storeContent !== '' ? 1 : 0,
  );

  const isFocused = key => focusedInput === key;

  const handleChange = (key, value) => {
    const containsForbiddenWord = forbiddenWords.some(word =>
      value.includes(word),
    );

    setErrors(prevErrors => ({
      ...prevErrors,
      [key]: containsForbiddenWord && '비속어 사용 금지',
    }));

    setStoreData({...storeData, [key]: value});
  };

  useEffect(() => {
    storeNumberLabelAnim.value = withTiming(
      isFocused('storeNumber') || storeData.storeNumber !== '' ? 1 : 0,
      {duration: 120},
    );
  }, [focusedInput, storeData.storeNumber]);

  useEffect(() => {
    storeContentLabelAnim.value = withTiming(
      isFocused('storeContent') || storeData.storeContent !== '' ? 1 : 0,
      {duration: 120},
    );
  }, [focusedInput, storeData.storeContent]);

  const handleClearStoreNumber = () => {
    handleChange('storeNumber', '');
    requestAnimationFrame(() => {
      storeNumberInputRef.current?.focus();
    });
  };

  return (
    <View>
      {/* 전화번호 입력 */}
      <View style={styles.storeinputview}>
        <View style={{position: 'relative'}}>
          <CustomText style={styles.label}>매장 번호</CustomText>
          <View style={styles.inputContainer}>
            <CustomTextInput
              style={[
                styles.storeinput,
                isFocused('storeNumber') && styles.focusedInput,
              ]}
              ref={storeNumberInputRef}
              value={storeData.storeNumber}
              onChangeText={text => handleChange('storeNumber', text)}
              keyboardType="number-pad"
              placeholder="매장 번호를 입력해주세요"
              placeholderTextColor={ColorUtil.placeholderText}
              onFocus={() => setFocusedInput('storeNumber')}
              onBlur={() => setFocusedInput(null)}
              returnKeyType="done"
            />
            {storeData.storeNumber?.length > 0 && isFocused('storeNumber') && (
              <CancelText
                rightnum={12}
                paddingnum={0}
                handlecancel={handleClearStoreNumber}
                size={normalizeFont(22)}
                centerVertical
              />
            )}
          </View>
        </View>
        {errors.storeNumber && (
          <CustomText style={styles.errorText}>{errors.storeNumber}</CustomText>
        )}
      </View>

      {/* 매장 소개 입력 */}
      <View style={[styles.storeinputview, {marginTop: 50}]}>
        <View style={{position: 'relative'}}>
          <CustomText style={styles.label}>매장 소개</CustomText>
          <CustomTextInput
            style={[
              styles.textarea,
              isFocused('storeContent') && styles.focusedInput,
              {paddingBottom: 7, paddingTop: 20, paddingLeft: 1},
            ]}
            multiline
            value={storeData.storeContent}
            onChangeText={text => {
              const maxChars = 500;
              if (text.length > maxChars) {
                setOverText(true);
                return; // 초과 입력 무시
              } else {
                setOverText(false);
              }
              handleChange('storeContent', text);
            }}
            placeholder=""
            placeholderTextColor="#999"
            onFocus={() => setFocusedInput('storeContent')}
            onBlur={() => setFocusedInput(null)}
            returnKeyType="done"
          />
        </View>
        {errors.storeContent && (
          <CustomText style={styles.errorText}>
            {errors.storeContent}
          </CustomText>
        )}
        {overText && (
          <CustomText style={styles.errorText}>
            매장 소개는 최대 500자입니다.
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
  inputContainer: {
    position: 'relative',
    justifyContent: 'center',
    width: '100%',
  },
  label: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 16,
    marginBottom: 12,
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
  textarea: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontFamily: 'Pretendard-SemiBold',
    paddingVertical: 5,
    paddingLeft: 1,
    maxHeight: 120,
    color: 'black',
  },
  focusedInput: {
    borderColor: '#333',
  },
  animatedLabel: {
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  errorText: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
    fontFamily: 'Pretendard-Medium',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 15,
    marginTop: 5,
    marginHorizontal: 18,
    fontFamily: 'Pretendard-Medium',
  },
});

export default StoreInfo;
