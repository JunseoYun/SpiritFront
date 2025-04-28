import React, {useState, useEffect, useMemo} from 'react';
import {FlatList, StyleSheet, Text, View} from 'react-native';
import StoreResultItem from './StoreResultItem';
import {Store_getby_store} from '../../api/storeApi';
import Loading from '../../hooks/Loading';

const StoreResultList = ({trimmedSearchWord, navigation, index}) => {
  const [searchingStores, setSearchingStores] = useState([]); // 검색된 가게 목록
  const [page, setPage] = useState(0); // 페이지 번호
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [isEnd, setIsEnd] = useState(false); // 데이터 끝 여부
  const [isword, setIsword] = useState(false);
  const [totalpage, setTotalpage] = useState(0);

  // 검색된 가게들을 불러오는 함수
  const filteredStores = async currentPage => {
    setLoading(true);
    if (trimmedSearchWord) {
      try {
        const data = await Store_getby_store(currentPage, trimmedSearchWord);

        setTotalpage(data.totalPages);

        if (data.content.length === 0) {
          setIsEnd(true);
        } else {
          // 기존 데이터와 병합 후 중복 제거
          setSearchingStores(prevStores => {
            const mergedStores = [...prevStores, ...data.content];
            const uniqueStores = Array.from(
              new Map(mergedStores.map(store => [store.id, store])).values(),
            );
            return uniqueStores;
          });
        }
      } catch (err) {
        console.error('오류 발생:', err.message);
      } finally {
        setIsword(true);
        setLoading(false);
      }
    } else {
      setIsword(false);
      setLoading(false);
    }
  };

  // trimmedSearchWord나 location이 변경되면 초기 데이터 로딩
  useEffect(() => {
    if (trimmedSearchWord) {
      setSearchingStores([]); // 기존 데이터 초기화
      setPage(0); // 페이지 초기화
      setIsEnd(false); // 데이터 끝 상태 초기화
      filteredStores(0);
      setIsword(true);
    } else if (!trimmedSearchWord) {
      setIsword(false);
    }
  }, [trimmedSearchWord]);

  const renderItem = ({item}) => (
    <StoreResultItem
      key={item.id}
      store={item}
      navigation={navigation}
      index={index}
    />
  );

  return (
    <>
      <FlatList
        data={searchingStores}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.fastSearchModalScrollView}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        onEndReached={() => {
          if (!loading && !isEnd && page < totalpage - 1) {
            setPage(prevPage => {
              const nextPage = prevPage + 1;
              filteredStores(nextPage);
              return nextPage;
            });
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading && searchingStores.length === 0 && isword ? (
            <Text style={styles.emptyText}>검색된 술집이 없습니다</Text>
          ) : null
        }
      />
      <Loading loading={loading} />
    </>
  );
};

const styles = StyleSheet.create({
  fastSearchModalScrollView: {
    marginTop: 1,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Pretendard-Bold',
    fontSize: 20,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 40,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default StoreResultList;
