import React, {useState, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import {StyleSheet, SafeAreaView} from 'react-native';
import ResultTopBar from '../../../components/SearchScreen/ResultScreen/ResultTopBar';
import ResultList from '../../../components/SearchScreen/ResultScreen/ResultList';
import Loading from '../../../hooks/Loading';

const SearchResultScreen = ({navigation}) => {
  const route = useRoute();
  const {searchName, location} = route.params;
  const [searchWord, setSearchWord] = useState(searchName);
  const [trimmedSearchWord, setTrimmedSearchWord] = useState(searchWord);

  // ✅ 새로운 검색 실행 함수
  const handleSearch = newSearchWord => {
    setSearchWord(newSearchWord);
    setTrimmedSearchWord(newSearchWord);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ResultTopBar
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        navigation={navigation}
        onSearch={handleSearch} // ✅ 검색 버튼을 눌렀을 때만 검색 실행
      />
      <ResultList
        trimmedSearchWord={trimmedSearchWord}
        navigation={navigation}
        location={location}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
});

export default SearchResultScreen;
