import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Dimensions,
  Animated,
  Pressable,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import CancelText from '../CancelText/CancelText';
import {normalizeFont} from '../../hooks/normalizeFont';
import ColorUtil from '../../utils/ColorUtil';

const screenWidth = Dimensions.get('window').width;

const StoreSearchBar = ({value, onChangeText, placeholder, onPress}) => {
  const [focused, setFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(borderAnim, {
      toValue: focused ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [focused]);

  const animatedBorderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [ColorUtil.placeholderBorder, '#333'],
  });

  // ✅ 조건부 렌더링 정리
  const renderRightElement = () => {
    const hasValue = value.length > 0;

    if (!hasValue && !focused) {
      // 아무 입력 없고 포커스 없음 → 기본 검색 아이콘
      return (
        <Feather
          style={styles.icon}
          name="search"
          size={18}
          color={ColorUtil.placeholderText}
        />
      );
    }

    if (hasValue && focused) {
      // 입력 중 → X 버튼
      return (
        <CancelText
          rightnum={10}
          topnum={10}
          paddingnum={4}
          handlecancel={onChangeText}
          size={20}
        />
      );
    }

    if (hasValue && !focused) {
      // 입력 후 포커스 아웃 → 클릭 가능한 검색 아이콘
      return (
        <Pressable onPress={onPress}>
          <Feather style={styles.icon} name="search" size={18} color="#333" />
        </Pressable>
      );
    }

    return null;
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {borderColor: animatedBorderColor},
        focused && styles.focusedContainer,
      ]}>
      <TextInput
        style={styles.textInput}
        placeholder={placeholder || '어떤 술집을 찾고 계신가요?'}
        placeholderTextColor={ColorUtil.placeholderText}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={onPress}
        allowFontScaling={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {renderRightElement()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 15,
    height: 50,
    width: screenWidth * 0.9,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
    justifyContent: 'center',
  },
  icon: {
    marginRight: 7,
    alignSelf: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: normalizeFont(16, 1.3),
    color: '#222',
    fontFamily: 'Pretendard-Medium',
    paddingRight: 28,
  },
});

export default StoreSearchBar;
