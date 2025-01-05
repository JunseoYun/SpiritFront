import React, { useState, useEffect } from 'react';
import { useRoute } from '@react-navigation/native';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Pressable,
  Image,
  SafeAreaView,
  ScrollView
} from 'react-native';
import MapCategory from '../../../hooks/MapCategory';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import ResultTopBar from '../../../components/SearchScreen/ResultScreen/ResultTopBar';
import ResultList from '../../../components/SearchScreen/ResultScreen/ResultList';

const SearchResultScreen = ({ navigation }) => {
  const route = useRoute();
  const { searchName, stores } = route.params;
  const [searchWord, setSearchWord] = useState(searchName);
  const [searchingStores, setSearchingStores] = useState([]);

  useEffect(() => {
    if (searchWord) {
      filteredStores();
    } else {
      console.log('fail');
    }
  }, [searchWord]);

  const filteredStores = () => {
    const trimmedSearchName = searchWord.trim();
    const searchStores = stores.filter(store =>
      store.storeName.includes(trimmedSearchName),
    );
    setSearchingStores(searchStores);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ResultTopBar
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        navigation={navigation}
      />
      <ResultList stores={searchingStores} navigation={navigation} />

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