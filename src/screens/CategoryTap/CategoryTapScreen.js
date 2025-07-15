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

  // 필터 적용 함수
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

  // 가게 데이터 불러오기 함수
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

  // 화면이 포커스될 때 데이터 처음 불러오기
  useEffect(() => {
    if (isFocused && rawStores.length === 0) {
      fetchStores(0, true);
    }
  }, [isFocused]);

  // 선택한 필터가 바뀌면 가게 리스트 다시 필터링
  useEffect(() => {
    setStores(applyAlcoholFilter(rawStores));
  }, [selectedAlcohols]);

  // 포커스 될 때 필터 ScrollView 위치 복원
  useEffect(() => {
    if (isFocused && scrollRef.current) {
      scrollRef.current.scrollTo({x: filterScrollX.current, animated: false});
    }
  }, [isFocused]);

  // 필터 버튼 클릭 핸들러
  const handleAlcoholPress = value => {
    toggleAlcohol(value);
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: 'white'}}>
      {isInitialLoading || loading ? (
        <Loading loading={true} />
      ) : (
        <View>
          {/* 필터 바 - 가로 스크롤 */}
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

          {/* 가게 목록 */}
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
            nRefresh={() => {
              setIsEnd(false);
              fetchStores(0, true);
            }}
            contentContainerStyle={{paddingBottom: 70}}
          />
        </View>
      )}
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
