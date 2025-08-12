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
  ScrollView,
  Pressable,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import {AlcoholFilterContext} from '../../context/AlcoholFilterContext';
import {Store_getby_category} from '../../api/storeApi';
import StoreItem from '../../components/CategoryTapScreen/StoreItem';
import Loading from '../../hooks/Loading';
import StoreItemSkeleton from '../../components/CategoryTapScreen/StoreItemSkeleton';
import Feather from 'react-native-vector-icons/Feather';
import FilterBar from '../../components/CategoryTapScreen/FilterBar';

const alcoholTypes = [
  {label: '소주', value: 'SOJU'},
  {label: '맥주', value: 'BEER'},
  {label: '막걸리', value: 'MAKGEOLLI'},
  {label: '와인', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '사케', value: 'SAKE'},
  {label: '고량주', value: 'KAOLIANG'},
  {label: '위스키', value: 'WHISKEY'},
  {label: '보드카', value: 'VODKA'},
  {label: '전통주', value: 'TRADITIONAL'},
  {label: '하이볼', value: 'HIGHBALL'},
  {label: '데킬라', value: 'TEQUILA'},
];

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

  const scrollRef = useRef(null);
  const buttonLayouts = useRef({});
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
    }
  };

  // useEffect(() => {
  //   if (isFocused) {
  //     setIsEnd(false);
  //     setStores([]);
  //     fetchStores(0, true);
  //     setFirstloading(true);
  //   }
  // }, [isFocused, drinkType, priceOrder]);

  const lastParamsRef = useRef(null);

  useEffect(() => {
    if (isFocused) {
      const lastParams = lastParamsRef.current;

      const hasChanged =
        !lastParams || // 초기 진입이면 호출
        lastParams.drinkType !== drinkType ||
        lastParams.priceOrder !== priceOrder;

      if (hasChanged) {
        setIsEnd(false);
        setStores([]);
        setFirstloading(true);
        fetchStores(0, true);

        lastParamsRef.current = {drinkType, priceOrder};
      }
    }
  }, [isFocused, drinkType, priceOrder]);

  const onRefresh = () => {
    setRefreshing(true);
    setFirstloading(true);
    setIsEnd(false);
    fetchStores(0, true);
  };

  // 페이징 호출
  const loadMoreStores = () => {
    if (!loading && isEnd == false && page < totalpage - 1) {
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        fetchStores(nextPage);
        return nextPage;
      });
    }
  };

  // 필터바 스크롤 위치 유지 + 선택된 버튼 중앙 정렬
  useEffect(() => {
    if (isFocused && scrollRef.current) {
      if (drinkType && buttonLayouts.current[drinkType]) {
        const {x, width} = buttonLayouts.current[drinkType];
        const scrollToX = x + width / 2 - screenWidth / 2 + 30;
        scrollRef.current.scrollTo({
          x: scrollToX > 0 ? scrollToX : 0,
          animated: true,
        });
      } else {
        // drinkType이 없으면 기존 위치 복원
        scrollRef.current.scrollTo({x: filterScrollX.current, animated: false});
      }
    }
  }, [isFocused, drinkType]);

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View>
        {/* 필터 바 */}
        <FilterBar navigation={navigation} />

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
            keyExtractor={item => `${categoryname}-${item.id}`}
            onEndReached={loadMoreStores}
            onEndReachedThreshold={0.7}
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
