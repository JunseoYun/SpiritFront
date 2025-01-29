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
  const [searchingStores, setSearchingStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  useEffect(() => {
    if (searchWord && location) {
      filteredStores(true); // 초기화 호출
    }
    console.log(location);
  }, [searchWord]);

  const filteredStores = async () => {
    const trimmedSearchWord = searchWord.trim();

    // if (!trimmedSearchWord || !location) {
    //   console.error('검색어 또는 위치 정보가 유효하지 않습니다.');
    //   return;
    // }

    setLoading(true);

    if (trimmedSearchWord || location) {
      try {
        const data = await Store_getby_keyword(
          page,
          location.latitude,
          location.longitude,
          trimmedSearchWord,
        );
        console.log(data);

        if (data.length === 0) {
          setIsEnd(true); // 데이터 끝
        } else {
          // 기존 데이터와 병합
          setSearchingStores(prevStores => {
            const mergedStores = [...prevStores, ...data];
            const uniqueStores = Array.from(
              new Map(mergedStores.map(store => [store.id, store])).values(),
            );
            return uniqueStores;
          });
          setPage(prevPage => prevPage + 1); // 페이지 증가
        }
      } catch (err) {
        console.error('오류 발생:', err.message);
      } finally {
        setLoading(false);
      }
    }
    // const searchStores = stores.filter(store =>
    //   store.storeName.includes(trimmedSearchName),
    // );
    // setSearchingStores(searchStores);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ResultTopBar
        searchWord={searchWord}
        setSearchWord={setSearchWord}
        navigation={navigation}
      />
      <ResultList
        stores={searchingStores}
        navigation={navigation}
        loading={loading}
        isEnd={isEnd}
        onEndReached={() => !loading && !isEnd && filteredStores()}
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
