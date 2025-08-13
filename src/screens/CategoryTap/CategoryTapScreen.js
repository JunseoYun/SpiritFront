import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import {useFocusEffect, useIsFocused} from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {AlcoholFilterContext} from '../../context/AlcoholFilterContext';
import {Store_getby_category} from '../../api/storeApi';
import StoreItem from '../../components/CategoryTapScreen/StoreItem';
import Loading from '../../hooks/Loading';
import StoreItemSkeleton from '../../components/CategoryTapScreen/StoreItemSkeleton';
import FilterBar from '../../components/CategoryTapScreen/FilterBar';

const screenWidth = Dimensions.get('window').width;

const CategoryTapScreen = ({navigation, route}) => {
  const {categoryname, location} = route.params;
  const isFocused = useIsFocused();
  const {drinkType, filterScrollX, priceOrder} =
    useContext(AlcoholFilterContext);

  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEnd, setIsEnd] = useState(false);
  const [firstloading, setFirstloading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalpage, setTotalpage] = useState(0);
  const allowLoadMore = useRef(false);
  const onEndReachedCalledDuringMomentum = useRef(false);

  const fetchStores = async (page = 0, reset = false) => {
    if (loading || (isEnd && !reset)) return;
    setLoading(true);
    try {
      const data = await Store_getby_category(
        page,
        location.latitude,
        location.longitude,
        categoryname,
        drinkType,
        priceOrder,
      );
      setTotalpage(data.totalPages);
      if (data.content.length > 0 && data.content) {
        const newData = data.content || [];

        setStores(prevStores => {
          const newStores = reset ? newData : [...prevStores, ...newData];
          const uniqueStores = Array.from(
            new Map(newStores.map(store => [store.id, store])).values(),
          );
          return uniqueStores;
        });
      } else {
        setIsEnd(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setFirstloading(false);
      if (reset) {
        setTimeout(() => {
          allowLoadMore.current = true;
        }, 300); // 살짝 지연을 줘서 첫 렌더 onEndReached 이벤트 무시
      }
    }
  };

  const lastParamsRef = useRef(null);

  const resetList = () => {
    allowLoadMore.current = false;
    setIsEnd(false);
    setPage(0);
    setTotalpage(0);
    setStores([]);
    setFirstloading(true);
  };

  useEffect(() => {
    if (isFocused) {
      const lastParams = lastParamsRef.current;

      const hasChanged =
        !lastParams || // 초기 진입이면 호출
        lastParams.drinkType !== drinkType ||
        lastParams.priceOrder !== priceOrder;

      if (hasChanged) {
        resetList();
        fetchStores(0, true);
        lastParamsRef.current = {drinkType, priceOrder};
      }
    }
  }, [isFocused, drinkType, priceOrder]);

  const onRefresh = () => {
    setRefreshing(true);
    setFirstloading(true);
    setIsEnd(false);
    setPage(0);
    setTotalpage(0);
    fetchStores(0, true);
  };

  // 페이징 호출
  const loadMoreStores = () => {
    if (
      !loading &&
      isEnd == false &&
      page < totalpage - 1 &&
      allowLoadMore.current
    ) {
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        fetchStores(nextPage, false);
        return nextPage;
      });
    }
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View>
        {firstloading ? (
          <FlatList
            data={[1, 2, 3, 4]} // 더미 데이터
            keyExtractor={(item, index) => index.toString()}
            renderItem={() => <StoreItemSkeleton loading={loading} />}
            showsVerticalScrollIndicator={false}
          />
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
            keyExtractor={item =>
              `${categoryname}-${item.id}-${drinkType}-${priceOrder}`
            }
            onMomentumScrollBegin={() => {
              onEndReachedCalledDuringMomentum.current = false;
            }}
            onEndReached={() => {
              if (
                !onEndReachedCalledDuringMomentum.current &&
                allowLoadMore.current
              ) {
                loadMoreStores();
                onEndReachedCalledDuringMomentum.current = true;
              }
            }}
            onEndReachedThreshold={0.4}
            initialNumToRender={10}
            maxToRenderPerBatch={5}
            windowSize={5}
            removeClippedSubviews={true}
            ListEmptyComponent={
              !loading && stores.length === 0 ? (
                <Text style={styles.emptyText}>등록된 가게가 없어요</Text>
              ) : null
            }
            refreshing={refreshing}
            onRefresh={onRefresh}
            contentContainerStyle={{paddingBottom: 70}}
          />
        )}

        {/* 로딩 오버레이 */}
        <Loading loading={loading} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center',
    marginVertical: 40,
    fontFamily: 'Pretendard-Regular',
    fontSize: 18,
    color: '#c0c0c0',
  },
});

export default CategoryTapScreen;
