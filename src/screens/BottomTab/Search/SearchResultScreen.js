import React, {useState, useEffect} from 'react';
import {useRoute} from '@react-navigation/native';
import {
  Text,
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import ResultTopBar from '../../../components/SearchScreen/ResultScreen/ResultTopBar';
import ResultList from '../../../components/SearchScreen/ResultScreen/ResultList';
import {Store_getby_keyword} from '../../../api/storeApi';

const SearchResultScreen = ({navigation}) => {
  const route = useRoute();
  const {searchName, location} = route.params;
  const [searchWord, setSearchWord] = useState(searchName);
  const [trimmedSearchWord, setTrimmedSearchWord] = useState('');

  useEffect(() => {
    if (searchWord && location) {
      setTrimmedSearchWord(searchWord.trim());
    }
    console.log(location);
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
