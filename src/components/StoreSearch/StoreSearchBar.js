import React, {useState} from 'react';
import {View, TextInput, StyleSheet, Dimensions} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import {normalizeFont} from '../../hooks/normalizeFont';
import CancelText from '../CancelText/CancelText';

const screenWidth = Dimensions.get('window').width;

const StoreSearchBar = ({value, onChangeText, placeholder, onPress}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.container}>
      <EvilIcons style={styles.icon} name="search" size={24} color="gray" />
      <TextInput
        style={styles.textInput}
        placeholder={placeholder || '검색어를 입력해주세요.'}
        placeholderTextColor="#A9A9A9"
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search" // ✅ 키보드에 '검색' 버튼 표시 (iOS & Android)
        onSubmitEditing={onPress}
        allowFontScaling={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {value.length > 0 && focused && (
        <CancelText
          rightnum={10}
          topnum={11}
          paddingnum={4}
          handlecancel={onChangeText}
          size={20}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0', // 부드러운 배경색
    borderRadius: 10,
    paddingHorizontal: 15,
    height: 50,
    shadowColor: '#000', // 그림자
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2, // Android 그림자
    width: screenWidth * 0.9,
    alignSelf: 'center', // 중앙 정렬
    marginVertical: 10,
  },
  icon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: normalizeFont(18, 1.3),
    color: '#333', // 입력 텍스트 색상
    fontFamily: 'Pretendard-Medium',
    paddingRight: 30,
  },
});

export default StoreSearchBar;
