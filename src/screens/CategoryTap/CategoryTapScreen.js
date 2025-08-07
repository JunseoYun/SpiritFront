import React, {
  useContext,
  useEffect,
  useCallback,
  useRef,
  useState,
} from 'react';
import {useIsFocused} from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
} from 'react-native';
import {AlcoholFilterContext} from '../../context/AlcoholFilterContext';
import {Store_getby_category} from '../../api/storeApi';
import StoreItem from '../../components/CategoryTapScreen/StoreItem';
import Loading from '../../hooks/Loading';
import StoreItemSkeleton from '../../components/CategoryTapScreen/StoreItemSkeleton';

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

const CategoryTapScreen = ({navigation, route}) => {
  const {categoryname, location} = route.params;
  const isFocused = useIsFocused();

  const {selectedAlcohols, toggleAlcohol, filterScrollX, setFilterScrollX} =
    useContext(AlcoholFilterContext);

  const [rawStores, setRawStores] = useState([]);
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [totalpage, setTotalpage] = useState(0);

  const scrollRef = useRef(null);

  const applyAlcoholFilter = useCallback(
    data => {
      if (selectedAlcohols.length === 0) return data;
      return data.filter(store =>
        (store.mainDrinkDtos || []).some(drink =>
          selectedAlcohols.includes(drink.type),
        ),
      );
    },
    [selectedAlcohols],
  );

  const fetchStores = async (startPage = 0, reset = false) => {
    if (loading || isEnd) return;
    setLoading(true);

    try {
      const size = selectedAlcohols.length > 0 ? 100 : 10;
      let combinedRaw = reset ? [] : [...rawStores];
      let currentPage = startPage;
      let shouldContinue = true;

      while (shouldContinue) {
        const data = await Store_getby_category(
          currentPage,
          location.latitude,
          location.longitude,
          categoryname,
          size,
        );

        const newRaw = data.content || [];
        combinedRaw = [...combinedRaw, ...newRaw];
        const unique = Array.from(
          new Map(combinedRaw.map(s => [s.id, s])).values(),
        );

        setRawStores(unique);
        setStores(applyAlcoholFilter(unique));
        setTotalpage(data.totalPages);

        const isLastPage =
          data.content.length === 0 || currentPage + 1 >= data.totalPages;

        if (selectedAlcohols.length === 0 || isLastPage) {
          shouldContinue = false;
          setIsEnd(isLastPage);
        } else {
          currentPage += 1;
        }
      }

      if (reset) {
        setPage(0);
      } else {
        setPage(currentPage);
      }
    } catch (err) {
      console.error(err.message || '오류 발생');
    } finally {
      setLoading(false);
      if (isInitialLoading) setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused && rawStores.length === 0) {
      fetchStores(0, true);
    }
  }, [isFocused]);

  useEffect(() => {
    setStores(applyAlcoholFilter(rawStores));
  }, [selectedAlcohols]);

  useEffect(() => {
    if (isFocused && scrollRef.current) {
      scrollRef.current.scrollTo({x: filterScrollX.current, animated: false});
    }
  }, [isFocused]);

  const handleAlcoholPress = value => {
    toggleAlcohol(value);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      <View>
        {/* 필터 바 */}
        <ScrollView
          ref={scrollRef}
          horizontal
          onLayout={() => {
            scrollRef.current?.scrollTo({
              x: filterScrollX.current,
              animated: false,
            });
          }}
          showsHorizontalScrollIndicator={false}
          style={styles.filterBar}
          contentContainerStyle={{paddingHorizontal: 12}}
          onScroll={e => {
            filterScrollX.current = e.nativeEvent.contentOffset.x;
          }}
          scrollEventThrottle={16}>
          {alcoholTypes.map(({label, value}) => (
            <Pressable
              key={value}
              onPress={() => handleAlcoholPress(value)}
              style={[
                styles.filterButton,
                selectedAlcohols.includes(value) && styles.activeFilter,
              ]}>
              <Text
                style={[
                  styles.filterText,
                  selectedAlcohols.includes(value) && styles.activeFilterText,
                ]}>
                {label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* FlatList 항상 렌더 */}
        {isInitialLoading || loading ? (
          <FlatList
            data={[1, 2, 3, 4]} // 임의의 더미 데이터
            keyExtractor={(item, index) => index.toString()}
            renderItem={() => <StoreItemSkeleton />}
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
            onEndReached={() => {
              if (
                !loading &&
                !isEnd &&
                rawStores.length > 0 &&
                page < totalpage - 1
              ) {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchStores(nextPage);
              }
            }}
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
            refreshing={loading}
            onRefresh={() => {
              setIsEnd(false);
              fetchStores(0, true);
            }}
            contentContainerStyle={{paddingBottom: 70}}
          />
        )}
      </View>
      {/* 로딩 오버레이 */}
      {(isInitialLoading || loading) && <Loading loading={true} />}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  filterBar: {
    flexDirection: 'row',
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  filterButton: {
    height: 30,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    margin: 3,
  },
  filterText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
  },
  activeFilter: {
    backgroundColor: '#45C9FF',
    borderColor: '#45C9FF',
  },
  activeFilterText: {
    color: 'white',
    fontFamily: 'Pretendard-Bold',
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
