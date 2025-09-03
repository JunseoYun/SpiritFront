import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';

const SearchBar = ({value, onChangeText, placeholder, onPress}) => {
  return (
    <View
      style={[styles.topView, Platform.OS === 'android' && {paddingTop: 10}]}>
      <TouchableOpacity style={styles.searchButton}>
        <AntDesign name="search1" size={20} color={'#A9A9A9'} />
      </TouchableOpacity>

      {/* ✅ 검색창 */}
      <View style={styles.search}>
        <TextInput
          style={styles.textInput}
          placeholder={placeholder || '검색어를 입력해주세요.'}
          placeholderTextColor="#A9A9A9"
          value={value}
          onChangeText={onChangeText}
          returnKeyType="search" // ✅ 키보드에 '검색' 버튼 표시 (iOS & Android)
          onSubmitEditing={onPress}
        />
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
    elevation: 3,
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
    fontSize: 16,
    color: '#121212', // 입력 텍스트 색상
    fontFamily: 'Pretendard-Medium',
  },
});

export default SearchBar;
