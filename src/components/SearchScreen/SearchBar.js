import React, {useCallback, useRef, useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import {normalizeFont} from '../../hooks/normalizeFont';
import CancelText from '../CancelText/CancelText';
import {useFocusEffect} from '@react-navigation/native';

const SearchBar = ({value, onChangeText, placeholder, onPress}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }, []),
  );
  return (
    <View
      style={[styles.topView, Platform.OS === 'android' && {paddingTop: 10}]}>
      <TouchableOpacity style={styles.searchButton}>
        <AntDesign name="search1" size={20} color={'#A9A9A9'} />
      </TouchableOpacity>

      {/* ✅ 검색창 */}
      <View style={styles.search}>
        <TextInput
          ref={inputRef}
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
            rightnum={5}
            topnum={14}
            paddingnum={0}
            handlecancel={onChangeText}
            size={20}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#E5E5E5',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    marginBottom: 10,
  },
  searchButton: {
    marginLeft: 18,
  },

  search: {
    flexDirection: 'row',
    // backgroundColor: '#333',
    flex: 1,
    borderRadius: 7,
    alignItems: 'center',
    height: 50,
    marginHorizontal: 12,
  },
  textInput: {
    flex: 1,
    fontSize: normalizeFont(16, 1.3),
    color: '#121212', // 입력 텍스트 색상
    fontFamily: 'Pretendard-Medium',
    paddingRight: 20,
  },
});

export default SearchBar;
