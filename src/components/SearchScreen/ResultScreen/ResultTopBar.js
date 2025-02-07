import React, {useState} from 'react';
import {View, TextInput, TouchableOpacity, StyleSheet} from 'react-native';

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
    }
  };

  return (
    <View style={styles.topView}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <AntDesign name="arrowleft" size={25} color={'black'} />
      </TouchableOpacity>

      {/* ✅ 검색창 */}
      <View style={styles.search}>
        <EvilIcons
          style={styles.searchIcon}
          name="search"
          size={30}
          color={'gray'}
        />
        <TextInput
          style={styles.searchTextInput}
          placeholder="검색어를 입력하세요"
          placeholderTextColor="gray"
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

      {/* ✅ 검색 버튼 (검색어 입력 시만 표시) */}
      {isSearching ? (
        <TouchableOpacity style={styles.homeButton} onPress={onSearchPress}>
          <Ionicons name="paper-plane-sharp" size={25} color="#333" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => navigation.navigate('MainScreen')}>
          <Ionicons name={'home-outline'} size={25} color={'#333'} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  topView: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    marginLeft: 15,
  },
  homeButton: {
    marginRight: 15,
  },
  search: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F2',
    width: '70%', // 검색 버튼 공간 확보
    borderRadius: 7,
    alignItems: 'center',
  },
  searchIcon: {
    color: 'gray',
    marginTop: 12,
    marginBottom: 12,
    marginLeft: 10,
  },
  searchTextInput: {
    fontSize: 15,
    color: 'gray',
    flex: 1, // 입력 필드가 남은 공간을 차지하도록 설정
  },
});

export default ResultTopBar;
