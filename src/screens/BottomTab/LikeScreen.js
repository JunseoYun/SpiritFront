import React, {useEffect, useState, useCallback} from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
} from 'react-native';

import LikedItem from '../../components/LikedScreen/LikedItem';
import {Store_getby_liked} from '../../api/storeApi';

const LikeScreen = ({navigation}) => {
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [refreshing, setRefreshing] = useState(false); // 새로고침 상태
  const [hasMore, setHasMore] = useState(true); // 추가 데이터 여부

  // 가게 데이터를 가져오는 함수
  const fetchStores = useCallback(async (page, refresh = false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);

      const storesData = await Store_getby_liked(page);

      // 데이터 설정
      setStores(prevStores => {
        const newStores = refresh
          ? storesData.content // 새로고침 시 데이터 초기화
          : [...prevStores, ...storesData.content]; // 추가 로드

        // 중복 제거
        const uniqueStores = Array.from(
          new Map(newStores.map(store => [store.id, store])).values(),
        );
        return uniqueStores;
      });

      // 더 가져올 데이터 있는지 확인
      setHasMore(storesData.content.length > 0);
    } catch (error) {
      console.error('데이터 로드 중 오류 발생:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // 컴포넌트 로드 시 데이터 초기화
  useEffect(() => {
    fetchStores(0, true); // 첫 페이지 데이터 로드
  }, [fetchStores]);

  // 다음 페이지 데이터 로드
  const loadMoreStores = () => {
    if (!loading && hasMore) {
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        fetchStores(nextPage);
        return nextPage;
      });
    }
  };

  // 새로고침 동작
  const handleRefresh = () => {
    setPage(0); // 페이지 초기화
    setHasMore(true); // 데이터 추가 가능 초기화
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
        onEndReached={loadMoreStores}
        onEndReachedThreshold={0.5}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListFooterComponent={
          loading && !refreshing ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : !hasMore && stores.length > 0 ? (
            <View style={styles.footer}>
              <Text style={styles.emptyText}>찜한 가게가 더 없습니다</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading && stores.length === 0 ? (
            <Text style={styles.emptyText}>찜한 가게가 없어요</Text>
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
