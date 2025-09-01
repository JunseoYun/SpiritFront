import React, {useState} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Keyboard,
} from 'react-native';

import EvilIcons from 'react-native-vector-icons/EvilIcons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ResultTopBar = ({searchWord, setSearchWord, navigation, onSearch}) => {
  const [isSearching, setIsSearching] = useState(false); // 검색 버튼 활성화 여부
  const [tempSearchWord, setTempSearchWord] = useState(searchWord); // 검색어 입력값 (즉시 반영 안됨)

  // ✅ 검색 버튼 클릭 시 실행될 함수 (입력 중인 검색어로 검색 실행)
  const onSearchPress = () => {
    if (tempSearchWord.trim()) {
      onSearch(tempSearchWord.trim()); // 새로운 검색 실행
      setIsSearching(false); // 검색 후 버튼 숨기기
      Keyboard.dismiss();
    }
  };

  return (
    <View style={styles.topView}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <AntDesign name="arrowleft" size={22} color={'#111'} />
      </TouchableOpacity>

      {/* ✅ 검색창 */}
      <View style={styles.search}>
        <TextInput
          style={styles.searchTextInput}
          placeholder="검색어를 입력하세요"
          placeholderTextColor="#999"
          value={tempSearchWord}
          onChangeText={text => {
            setTempSearchWord(text); // 입력 값만 변경 (검색 실행 X)
            setIsSearching(text.length > 0); // 검색 버튼 표시 여부 조정
          }}
          onFocus={() => setIsSearching(true)}
          onBlur={() => setIsSearching(false)}
          returnKeyType="search" // ✅ 키보드에 '검색' 버튼 표시 (iOS & Android)
          onSubmitEditing={onSearchPress}
        />
      </View>
      <TouchableOpacity style={styles.homeButton} onPress={onSearchPress}>
        <AntDesign name="search1" size={22} color={'#111'} />
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
    fontSize: 18,
    color: '#181A1A',
    flex: 1, // 입력 필드가 남은 공간을 차지하도록 설정
  },
  searchButton: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#45C9FF',
  },
});

export default ResultTopBar;
