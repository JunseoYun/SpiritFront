import React, {useState, useEffect} from 'react';
import {
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Text,
  View,
} from 'react-native';
import ResultItem from './ResultItem';
import {Store_getby_keyword} from '../../../api/storeApi';

const ResultList = ({trimmedSearchWord, location, navigation}) => {
  const [searchingStores, setSearchingStores] = useState([]); // 검색된 가게 목록
  const [page, setPage] = useState(0); // 페이지 번호
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [isEnd, setIsEnd] = useState(false); // 데이터 끝 여부

  // 검색된 가게들을 필터링하는 함수
  const filteredStores = async currentPage => {
    setLoading(true);

    if (trimmedSearchWord || location) {
      try {
        const data = await Store_getby_keyword(
          currentPage,
          location.latitude,
          location.longitude,
          trimmedSearchWord,
        );

        if (data.length === 0) {
          setIsEnd(true); // 더 이상 데이터가 없으면
        } else {
          // 기존 데이터와 병합하고 중복 제거
          setSearchingStores(prevStores => {
            const mergedStores = [...prevStores, ...data];
            const uniqueStores = Array.from(
              new Map(mergedStores.map(store => [store.id, store])).values(),
            );
            return uniqueStores;
          });
        }
      } catch (err) {
        console.error('오류 발생:', err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // 초기 로딩 시, 검색어와 위치가 있을 때 데이터를 불러옴
  useEffect(() => {
    if (trimmedSearchWord && location) {
      setSearchingStores([]); // 기존 데이터 초기화
      setPage(0); // 페이지 초기화
      setIsEnd(false); // 데이터 끝 상태 초기화
      filteredStores(0); // 데이터 불러오기
    }
  }, [trimmedSearchWord, location]);

  const renderItem = ({item}) => (
    <ResultItem key={item.id} store={item} navigation={navigation} />
  );

  return (
    <FlatList
      data={searchingStores}
      renderItem={renderItem}
      keyExtractor={item => item.id.toString()}
      contentContainerStyle={styles.fastSearchModalScrollView}
      onEndReached={() => {
        if (!loading && !isEnd) {
          setPage(prevPage => {
            const nextPage = prevPage + 1; // 다음 페이지 번호
            filteredStores(nextPage); // 그 페이지 번호로 데이터 요청
            return nextPage; // 상태를 증가된 페이지 번호로 갱신
          });
        }
      }} // 끝에 도달하면 데이터 불러오기
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        loading && !isEnd ? (
          <View style={styles.footer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : isEnd && searchingStores.length > 0 ? (
          <View style={styles.footer}>
            <Text style={styles.emptyText}>더 이상 결과가 없습니다</Text>
          </View>
        ) : null
      }
      ListEmptyComponent={
        !loading && searchingStores.length === 0 ? (
          <Text style={styles.emptyText}>검색된 가게가 없습니다</Text>
        ) : null
      }
    />
  );
};

const styles = StyleSheet.create({
  fastSearchModalScrollView: {
    marginTop: 1,
    paddingBottom: 50,
  },
  footer: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default ResultList;
