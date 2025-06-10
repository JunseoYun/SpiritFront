import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import forbiddenWords from '../../hooks/forbiddenWords';

const StoreInfo = ({storeData, setStoreData, error}) => {
  const [focusedInput, setFocusedInput] = useState(null);
  const [errors, setErrors] = useState({});
  const [overText, setOverText] = useState(false);

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

  const handleContentChange = text => {
    const lines = text.split('\n');
    const maxLines = 5;
    const maxChars = 100;

    if (lines.length > maxLines || text.length > maxChars) {
      setOverText(true);
      return;
    } else {
      setOverText(false);
    }

    handleChange('storeContent', text);
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

  const animatedLabelStyle = sharedValue =>
    useAnimatedStyle(() => {
      const isFocused = sharedValue.value === 1;
      return {
        position: 'absolute',
        left: 1,
        transform: [
          {
            translateY: withTiming(isFocused ? -8 : 16, {
              duration: 120,
            }),
          },
        ],
        fontSize: withTiming(isFocused ? 16 : 22, {
          duration: 120,
        }),
      };
    });

  const storeNumberLabelStyle = animatedLabelStyle(storeNumberLabelAnim);
  const storeContentLabelStyle = animatedLabelStyle(storeContentLabelAnim);

  return (
    <View>
      {/* 전화번호 입력 */}
      <View style={styles.storeinputview}>
        <View style={{position: 'relative'}}>
          <Animated.Text style={[styles.animatedLabel, storeNumberLabelStyle]}>
            전화번호
          </Animated.Text>
          <TextInput
            style={[
              styles.storeinput,
              isFocused('storeNumber') && styles.focusedInput,
              {paddingBottom: 7, paddingTop: 20, paddingLeft: 1},
            ]}
            value={storeData.storeNumber}
            onChangeText={text => handleChange('storeNumber', text)}
            keyboardType="number-pad"
            placeholder=""
            placeholderTextColor="#999"
            onFocus={() => setFocusedInput('storeNumber')}
            onBlur={() => setFocusedInput(null)}
            returnKeyType="done"
          />
        </View>
        {errors.storeNumber && (
          <Text style={styles.errorText}>{errors.storeNumber}</Text>
        )}
      </View>

      {/* 매장 소개 입력 */}
      <View style={[styles.storeinputview, {marginTop: 50}]}>
        <View style={{position: 'relative'}}>
          <Animated.Text style={[styles.animatedLabel, storeContentLabelStyle]}>
            매장을 간단하게 소개해주세요.
          </Animated.Text>
          <TextInput
            style={[
              styles.textarea,
              isFocused('storeContent') && styles.focusedInput,
              {paddingBottom: 7, paddingTop: 20, paddingLeft: 1},
            ]}
            multiline
            value={storeData.storeContent}
            onChangeText={handleContentChange}
            placeholder=""
            placeholderTextColor="#999"
            onFocus={() => setFocusedInput('storeContent')}
            onBlur={() => setFocusedInput(null)}
            returnKeyType="done"
          />
        </View>
        {errors.storeContent && (
          <Text style={styles.errorText}>{errors.storeContent}</Text>
        )}
        {overText && (
          <Text style={styles.errorText}>
            매장 소개는 최대 5줄, 최대 100자입니다.
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 10,
    marginHorizontal: 20,
  },
  storeinput: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    color: 'black',
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
    borderBottomColor: '#16BBFF',
    borderBottomWidth: 2,
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
