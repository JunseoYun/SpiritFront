import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import forbiddenWords from '../../hooks/forbiddenWords';

const StoreAddname = ({storename, setStorename, error}) => {
  const [focusedInput, setFocusedInput] = useState(false);
  const [errors, setErrors] = useState({});
  const storeNameInputRef = useRef(null);

  // Animated 값
  const labelAnim = useRef(new Animated.Value(storename ? 1 : 0)).current;

  // 애니메이션 트리거
  useEffect(() => {
    Animated.timing(labelAnim, {
      toValue: focusedInput || storename !== '' ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: false,
    }).start();
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

  // 라벨 애니메이션 스타일
  const labelStyle = {
    position: 'absolute',
    left: 1,
    top: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: labelAnim.interpolate({
      inputRange: [0, 1],
      outputRange: [22, 16],
    }),
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  };

  return (
    <View>
      <View style={styles.storeinputview}>
        <View style={{position: 'relative'}}>
          <Animated.Text style={labelStyle}>매장 이름*</Animated.Text>
          <TextInput
            ref={storeNameInputRef}
            style={[styles.storeinput, focusedInput && styles.focusedInput]}
            value={storename}
            onChangeText={handleChange}
            placeholder="" // placeholder 제거
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
  storeinput: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontFamily: 'Pretendard-Medium',
    paddingBottom: 7,
    paddingTop: 20,
    paddingLeft: 1,
  },
  focusedInput: {
    borderBottomColor: '#16BBFF',
    borderBottomWidth: 2,
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
