import React, {useEffect, useState, useCallback} from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  View,
  BackHandler,
  ScrollView,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import LikedItem from '../../components/LikedScreen/LikedItem';
import {Store_getby_liked} from '../../api/storeApi';
import {useAuth} from '../../context/AuthContext';
import Loading from '../../hooks/Loading';
import LikedItemSkeleton from '../../components/LikedScreen/LikedItemSkeleton';

const LikeScreen = ({navigation}) => {
  const {token} = useAuth();
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // 가게 데이터를 가져오는 함수
  const fetchStores = async (currentPage, refresh = false) => {
    if (loading || (!hasMore && !refresh)) return;
    setLoading(true);

    try {
      const storesData = await Store_getby_liked(currentPage);
      if (storesData && storesData.length > 0) {
        setStores(prevStores => {
          const newStores = refresh
            ? storesData
            : [...prevStores, ...storesData];
          const uniqueStores = Array.from(
            new Map(newStores.map(store => [store.id, store])).values(),
          );
          return uniqueStores;
        });
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('데이터 로드 중 오류 발생:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!token) {
          return;
        }
        navigation.navigate('MainScreen'); // MainScreen 탭으로 전환
        return true; // 기본 뒤로가기 방지
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        return;
      }
      fetchStores(0, true);
    }, []),
  );

  const loadMoreStores = () => {
    if (!loading && hasMore) {
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        fetchStores(nextPage);
        return nextPage;
      });
    }
  };

  const handleRefresh = () => {
    setStores([]);
    setHasMore(true);
    setPage(0);
    setRefreshing(true);
    fetchStores(0, true);
  };

  const renderItem = ({item}) => (
    <LikedItem key={item.id} store={item} navigation={navigation} />
  );

  return (
    <SafeAreaView style={styles.container}>
      {token && (
        <>
          {loading || refreshing ? (
            <FlatList
              data={[1, 2, 3]} // 임의의 더미 데이터
              keyExtractor={(item, index) => index.toString()}
              renderItem={() => <LikedItemSkeleton />}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={stores}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              showsVerticalScrollIndicator={false}
              initialNumToRender={10}
              maxToRenderPerBatch={5}
              windowSize={5}
              removeClippedSubviews={true}
              onEndReached={loadMoreStores}
              onEndReachedThreshold={0.5}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              ListEmptyComponent={
                !loading && stores.length === 0 ? (
                  <Text style={styles.emptyText}>찜한 술집이 없어요</Text>
                ) : null
              }
            />
          )}
        </>
      )}
      {!token && <Text style={styles.emptyText}>로그인 후 이용해주세요</Text>}
      <Loading loading={refreshing || loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'white',
  },
  loadingContainer: {
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
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
    marginVertical: 60,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default LikeScreen;
