import React, {useState, useCallback} from 'react';
import {View, Text, FlatList, StyleSheet, SafeAreaView} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Store_getby_category} from '../../api/storeApi';
import StoreItem from '../../components/CategoryTapScreen/StoreItem';

const CategoryTapScreen = ({navigation, route}) => {
  const {categoryname, location} = route.params;

  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false); // 전체 로딩 상태
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 첫 로딩 상태
  const [isEnd, setIsEnd] = useState(false); // 더 이상 데이터가 없는 상태
  const [totalpage, setTotalpage] = useState(0);

  const fetchStores = async (currentPage, reset = false) => {
    if (loading || isEnd) return; // 로딩 중이거나 데이터가 끝났으면 요청 막기
    setLoading(true); // 로딩 시작

    try {
      const data = await Store_getby_category(
        currentPage,
        location.latitude,
        location.longitude,
        categoryname,
      );
      setTotalpage(data.totalPages);

      if (reset) {
        setStores(data.content); // 초기화 시 새 데이터를 설정
        setPage(0); // 페이지 초기화
        setIsEnd(data.content.length === 0); // 데이터 끝 상태 설정
      } else if (data.content.length === 0) {
        setIsEnd(true); // 추가 데이터가 없을 경우
      } else {
        setStores(prevStores => {
          const mergedStores = [...prevStores, ...data.content];
          const uniqueStores = Array.from(
            new Map(mergedStores.map(store => [store.id, store])).values(),
          );
          return uniqueStores;
        });
      }
    } catch (err) {
      console.error(err.message || '오류 발생');
    } finally {
      setLoading(false); // 로딩 끝
      if (isInitialLoading) setIsInitialLoading(false); // 첫 로딩 상태 해제
    }
  };

  useFocusEffect(
    useCallback(() => {
      const resetAndFetch = async () => {
        setIsInitialLoading(true); // 초기 로딩 화면을 먼저 보이게 설정
        setStores([]); // 기존 데이터 초기화
        setPage(0); // 페이지 초기화
        setIsEnd(false); // 데이터 끝 상태 초기화
        await fetchStores(0, true); // 초기화된 상태로 데이터 로드
      };
      resetAndFetch();
    }, [categoryname, location]),
  );

  return (
    <SafeAreaView style={{backgroundColor: 'white', height: '100%'}}>
      {isInitialLoading ? ( // 초기 로딩 상태일 경우 로딩 화면만 보여줌
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingtext}>Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={stores}
          renderItem={({item}) => (
            <StoreItem
              store={item}
              location={location}
              navigation={navigation}
            />
          )}
          keyExtractor={item => item.id.toString()}
          onEndReached={() => {
            if (!loading && !isEnd && page < totalpage - 1) {
              setPage(prevPage => {
                const nextPage = prevPage + 1; // 다음 페이지 번호
                fetchStores(nextPage); // 그 페이지 번호로 데이터 요청
                return nextPage; // 상태를 증가된 페이지 번호로 갱신
              });
            }
          }}
          onEndReachedThreshold={0.5}
          initialNumToRender={10} // 처음 렌더링할 개수 (기본값: 10)
          maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
          windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
          removeClippedSubviews={true} // 보이지 않는 컴포넌트 메모리 해제
          ListFooterComponent={
            loading ? (
              <Text style={styles.emptyText}>Loading...</Text>
            ) : page === totalpage - 1 && stores.length > 0 ? (
              <Text style={styles.emptyText}>가게가 더 없습니다</Text>
            ) : null
          }
          ListEmptyComponent={
            !loading && stores.length === 0 ? (
              <Text style={styles.emptyText}>등록된 가게가 없습니다.</Text>
            ) : null
          }
          refreshing={loading} // 로딩 중일 때 새로 고침 아이콘을 표시
          onRefresh={() => fetchStores(true)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingtext: {
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    fontSize: 20,
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 40,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    fontSize: 20,
    color: '#333',
  },
});
export default CategoryTapScreen;
