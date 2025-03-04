import React, {useEffect, useState} from 'react';
import {SafeAreaView, FlatList, StyleSheet, Text, View} from 'react-native';

import LikedItem from '../../components/LikedScreen/LikedItem';
import {Store_getby_liked} from '../../api/storeApi';

const LikeScreen = ({navigation}) => {
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태
  const [hasMore, setHasMore] = useState(true); // 추가 데이터 여부

  // 가게 데이터를 가져오는 함수
  const fetchStores = async (currentPage, refresh = false) => {
    if (loading || (!hasMore && !refresh)) return;
    setLoading(true); // 새로고침 시 0으로 설정

    try {
      const storesData = await Store_getby_liked(currentPage);

      // 데이터 설정
      if (storesData && storesData.length > 0) {
        setStores(prevStores => {
          const newStores = refresh
            ? storesData // 새로고침 시 데이터 초기화
            : [...prevStores, ...storesData]; // 추가 로드

          // 중복 제거
          const uniqueStores = Array.from(
            new Map(newStores.map(store => [store.id, store])).values(),
          );
          return uniqueStores;
        });
      } else {
        setHasMore(false); // 더 이상 데이터가 없으면 false로 설정
      }
    } catch (error) {
      console.error('데이터 로드 중 오류 발생:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // 데이터 로드가 끝났을 때 refreshing을 false로 설정
    }
  };

  // 컴포넌트 로드 시 데이터 초기화
  useEffect(() => {
    fetchStores(0, true); // 첫 페이지 데이터 로드
  }, []);

  // 다음 페이지 데이터 로드
  const loadMoreStores = () => {
    if (!loading && hasMore) {
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        fetchStores(nextPage); // 새로운 페이지 데이터 로드
        return nextPage; // 페이지 증가
      });
    }
  };

  // 새로고침 동작
  const handleRefresh = () => {
    setStores([]); // 기존 stores 초기화
    setHasMore(true); // 추가 데이터 여부 초기화
    setPage(0);
    setRefreshing(true); // 새로고침 시작
    fetchStores(0, true); // 새로고침
  };

  const renderItem = ({item}) => (
    <LikedItem key={item.id} store={item} navigation={navigation} />
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={stores}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        initialNumToRender={10} // 처음 렌더링할 개수 (기본값: 10)
        maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
        windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
        removeClippedSubviews={true} // 보이지 않는 컴포넌트 메모리 해제
        onEndReached={loadMoreStores} // 더 많은 데이터 불러오기
        onEndReachedThreshold={0.5}
        onRefresh={handleRefresh} // 새로고침
        refreshing={refreshing}
        ListFooterComponent={
          loading ? (
            <View
              style={{
                height: 400,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : !hasMore && stores.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.emptyText}>찜한 술집이 더 없습니다</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && stores.length === 0 ? (
            <Text style={styles.emptyText}>찜한 술집이 없어요</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
    paddingBottom: 10,
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default LikeScreen;
