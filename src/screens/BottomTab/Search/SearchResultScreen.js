import React, {useState, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import {StyleSheet, SafeAreaView} from 'react-native';
import ResultTopBar from '../../../components/SearchScreen/ResultScreen/ResultTopBar';
import ResultList from '../../../components/SearchScreen/ResultScreen/ResultList';

const SearchResultScreen = ({navigation}) => {
  const route = useRoute();
  const {searchName, location} = route.params;
  const [searchWord, setSearchWord] = useState(searchName);
  const [trimmedSearchWord, setTrimmedSearchWord] = useState(searchWord);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchWord && location) {
        setTrimmedSearchWord(searchWord.trim());
      }
    }, 1000); // 500ms 후에 갱신
    return () => clearTimeout(timer);
  }, [searchWord]);

  return (
    <SafeAreaView style={styles.container}>
      <ResultTopBar
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        navigation={navigation}
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
    backgroundColor: 'white',
    flex: 1, // 화면 전체를 차지하도록 설정
  },
});

export default SearchResultScreen;
