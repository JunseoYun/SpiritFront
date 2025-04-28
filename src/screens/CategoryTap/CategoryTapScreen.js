import React, {useState, useEffect} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {View, Text, FlatList, StyleSheet, SafeAreaView} from 'react-native';
import {Store_getby_category} from '../../api/storeApi';
import StoreItem from '../../components/CategoryTapScreen/StoreItem';
import Loading from '../../hooks/Loading';

const CategoryTapScreen = ({navigation, route}) => {
  const {categoryname, location} = route.params;
  const isFocused = useIsFocused();
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false); // 전체 로딩 상태
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 첫 로딩 상태
  const [isEnd, setIsEnd] = useState(false); // 더 이상 데이터가 없는 상태
  const [totalpage, setTotalpage] = useState(0);

  // 🔥 데이터 불러오기 함수
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

  useEffect(() => {
    if (isFocused && stores.length === 0) {
      fetchStores(0, true);
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={{backgroundColor: 'white', height: '100%'}}>
      {isInitialLoading ? (
        <Loading loading={isInitialLoading} />
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
          keyExtractor={item => `${categoryname}-${item.id}`} // ✅ 카테고리별 고유 키
          onEndReached={() => {
            if (!loading && !isEnd && page < totalpage - 1) {
              setPage(prevPage => {
                const nextPage = prevPage + 1;
                fetchStores(nextPage); // 다음 페이지 요청
                return nextPage;
              });
            }
          }}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={5}
          windowSize={5}
          removeClippedSubviews={true}
          ListEmptyComponent={
            !loading && stores.length === 0 ? (
              <Text style={styles.emptyText}>등록된 가게가 없어요</Text>
            ) : null
          }
          refreshing={loading}
          onRefresh={() => fetchStores(0, true)}
          contentContainerStyle={{paddingBottom: 70}}
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
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    color: '#333',
    marginVertical: 40,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 40,
    fontFamily: 'Pretendard-Regular',
    fontSize: 18,
    color: '#c0c0c0',
  },
});

export default CategoryTapScreen;
