// import React from 'react';
// import {View, TextInput, StyleSheet, Dimensions} from 'react-native';

import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Keyboard,
  Dimensions,
} from 'react-native';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

import AntDesign from 'react-native-vector-icons/AntDesign';
const screenWidth = Dimensions.get('window').width;

const SearchBar = ({value, onChangeText, placeholder, onPress}) => {
  return (
    <View style={styles.topView}>
      <TouchableOpacity style={styles.searchButton}>
        <AntDesign name="search1" size={18} color={'#A9A9A9'} />
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
    color: '#333', // 입력 텍스트 색상
    fontWeight: '500', // 글씨 굵기
  },
});

export default SearchBar;
