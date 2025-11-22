import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Keyboard,
} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import {normalizeFont} from '../../../hooks/normalizeFont';
import CancelText from '../../CancelText/CancelText';

const ResultTopBar = ({searchWord, navigation, onSearch}) => {
  const [tempSearchWord, setTempSearchWord] = useState(searchWord); // 검색어 입력값 (즉시 반영 안됨)
  const [focused, setFocused] = useState(false);
  // ✅ 검색 버튼 클릭 시 실행될 함수 (입력 중인 검색어로 검색 실행)
  const onSearchPress = () => {
    if (tempSearchWord.trim()) {
      onSearch(tempSearchWord.trim()); // 새로운 검색 실행

      Keyboard.dismiss();
    }
  };

  return (
    <View
      style={[styles.topView, Platform.OS === 'android' && {paddingTop: 10}]}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <AntDesign name="arrowleft" size={20} color={'#111'} />
      </TouchableOpacity>

      {/* ✅ 검색창 */}
      <View style={styles.search}>
        <TextInput
          style={styles.searchTextInput}
          placeholder="술집이나 메뉴를 검색하세요"
          placeholderTextColor="#A9A9A9"
          value={tempSearchWord}
          onChangeText={text => {
            setTempSearchWord(text); // 입력 값만 변경 (검색 실행 X)
          }}
          returnKeyType="search" // ✅ 키보드에 '검색' 버튼 표시 (iOS & Android)
          onSubmitEditing={onSearchPress}
          allowFontScaling={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {tempSearchWord.length > 0 && focused && (
          <CancelText
            rightnum={0}
            topnum={14}
            paddingnum={0}
            handlecancel={setTempSearchWord}
            size={20}
          />
        )}
      </View>
      <TouchableOpacity style={styles.homeButton} onPress={onSearchPress}>
        <AntDesign name="search1" size={20} color={'#111'} />
      </TouchableOpacity>
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
  },
  backButton: {
    marginLeft: 18,
  },
  homeButton: {
    marginRight: 18,
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

  searchTextInput: {
    fontSize: normalizeFont(16, 1.3),
    color: '#121212',
    flex: 1, // 입력 필드가 남은 공간을 차지하도록 설정
    paddingRight: 20,
    fontFamily: 'Pretendard-Medium',
  },
});

export default ResultTopBar;
