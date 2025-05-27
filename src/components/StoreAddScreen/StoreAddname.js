import React, {useState, useEffect, useRef} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import forbiddenWords from '../../hooks/forbiddenWords';

const StoreAddname = ({storename, setStorename, error}) => {
  const [focusedInput, setFocusedInput] = useState(false);
  const [errors, setErrors] = useState({});
  const storeNameInputRef = useRef(null);

  // reanimated shared value
  const labelAnim = useSharedValue(storename !== '' ? 1 : 0);

  useEffect(() => {
    labelAnim.value = withTiming(focusedInput || storename !== '' ? 1 : 0, {
      duration: 120,
    });
  }, [focusedInput, storename]);

  useEffect(() => {
    if (error === 'storename' && storeNameInputRef.current) {
      storeNameInputRef.current.focus();
    }
  }, [error]);

  const handleChange = value => {
    const containsForbiddenWord = forbiddenWords.some(word =>
      value.includes(word),
    );

    setErrors({
      storename: containsForbiddenWord ? '비속어 사용 금지' : null,
    });

    if (!containsForbiddenWord) {
      setStorename(value);
    }
  };

  const animatedLabelStyle = useAnimatedStyle(() => {
    const isFocused = labelAnim.value === 1;

    return {
      position: 'absolute',
      left: 1, // 텍스트 정렬
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

  return (
    <View>
      <View style={styles.storeinputview}>
        <View style={styles.inputWrapper}>
          <Animated.Text style={[styles.animatedLabel, animatedLabelStyle]}>
            매장 이름*
          </Animated.Text>
          <TextInput
            ref={storeNameInputRef}
            style={[styles.storeinput, focusedInput && styles.focusedInput]}
            value={storename}
            onChangeText={handleChange}
            placeholder=""
            onFocus={() => setFocusedInput(true)}
            onBlur={() => setFocusedInput(false)}
            returnKeyType="done"
          />
        </View>
        {errors.storename && (
          <Text style={styles.errorText}>{errors.storename}</Text>
        )}
      </View>
      {error === 'storename' && storename === '' && (
        <Text style={styles.errorMessage}>매장이름을 입력해주세요.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  inputWrapper: {
    position: 'relative',
  },
  storeinput: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingBottom: 7,
    paddingTop: 20,
    paddingLeft: 1,
    color: 'black',
  },
  focusedInput: {
    borderBottomColor: '#16BBFF',
    borderBottomWidth: 2,
  },
  animatedLabel: {
    fontSize: 22,
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

export default StoreAddname;
