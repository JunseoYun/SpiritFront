import React, {useEffect, useState, useCallback, useRef} from 'react';
import {
  SafeAreaView,
  FlatList,
  StyleSheet,
  Text,
  View,
  BackHandler,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import LikedItem from '../../components/LikedScreen/LikedItem';
import {Store_getby_liked} from '../../api/storeApi';
import {useAuth} from '../../context/AuthContext';
import Loading from '../../hooks/Loading';
import LikedItemSkeleton from '../../components/LikedScreen/LikedItemSkeleton';
import MyBanner from '../../components/Ads/MyBanner';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import useScrollToTopVisibility from '../../hooks/useScrollToTopVisibility';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const LikeScreen = ({navigation}) => {
  const {token} = useAuth();
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [firstloading, setFirstloading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const insets = useSafeAreaInsets();
  const scrollRef = useRef(null);
  const {
    visible: showScrollToTop,
    handleScroll,
    updateVisibility,
    scrollToTop,
  } = useScrollToTopVisibility({externalRef: scrollRef});

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
      if (firstloading == true) {
        setFirstloading(false);
      }
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
      updateVisibility(0);
      fetchStores(0, true);
    }, [token, updateVisibility]),
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
    updateVisibility(0);
  };

  const renderItem = ({item}) => (
    <LikedItem key={item.id} store={item} navigation={navigation} />
  );

  return (
    <>
      <View style={styles.container}>
        {token && (
          <>
            {firstloading || refreshing ? (
              <FlatList
                data={[1, 2, 3]} // 임의의 더미 데이터
                keyExtractor={(item, index) => index.toString()}
                renderItem={() => <LikedItemSkeleton />}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <FlatList
                ref={scrollRef}
                data={stores}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={5}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
                onEndReached={loadMoreStores}
                onEndReachedThreshold={0.5}
                onRefresh={handleRefresh}
                refreshing={refreshing}
                ListEmptyComponent={
                  !loading && stores.length === 0 ? (
                    <Text style={styles.emptyText}>찜한 술집이 없어요</Text>
                  ) : null
                }
                onScroll={handleScroll}
                scrollEventThrottle={16}
              />
            )}
          </>
        )}
        {!token && <Text style={styles.emptyText}>로그인 후 이용해주세요</Text>}
        <ScrollToTopButton
          visible={showScrollToTop}
          bottom={18}
          onPress={scrollToTop}
        />
        <Loading loading={refreshing || loading} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEFEFE',
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
