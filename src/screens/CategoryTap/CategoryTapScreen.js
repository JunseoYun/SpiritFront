import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {Store_getby_category} from '../../api/storeApi';
import StoreItem from '../../components/CategoryTapScreen/StoreItem';
import Categorystyles from './CategoryTapStyles';

const CategoryTapScreen = ({navigation, route}) => {
  const {categoryname, location} = route.params;

  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false); // 전체 로딩 상태
  const [isInitialLoading, setIsInitialLoading] = useState(true); // 첫 로딩 상태
  const [isEnd, setIsEnd] = useState(false); // 더 이상 데이터가 없는 상태

  const fetchStores = async (reset = false) => {
    if (loading || isEnd) return; // 로딩 중이거나 데이터가 끝났으면 요청 막기
    setLoading(true); // 로딩 시작

    try {
      const data = await Store_getby_category(
        reset ? 0 : page, // 초기화일 경우 page = 0
        location.latitude,
        location.longitude,
        categoryname,
      );

      if (reset) {
        setStores(data); // 초기화 시 새 데이터를 설정
        setPage(0); // 페이지 초기화
        setIsEnd(data.length === 0); // 데이터 끝 상태 설정
      } else if (data.length === 0) {
        setIsEnd(true); // 추가 데이터가 없을 경우
      } else {
        setStores(prevStores => {
          const mergedStores = [...prevStores, ...data];
          const uniqueStores = Array.from(
            new Map(mergedStores.map(store => [store.id, store])).values(),
          );
          return uniqueStores;
        });
        setPage(prevPage => prevPage + 1);
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
        await fetchStores(true); // 초기화된 상태로 데이터 로드
      };
      resetAndFetch();
    }, [categoryname, location]),
  );

  return (
    <SafeAreaView style={{backgroundColor: 'white', height: '100%'}}>
      {isInitialLoading ? ( // 초기 로딩 상태일 경우 로딩 화면만 보여줌
        <View style={Categorystyles.loadingContainer}>
          <Text style={Categorystyles.loadingtext}>Loading...</Text>
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
            if (!loading && !isEnd) fetchStores();
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading ? (
              <Text style={Categorystyles.emptyText}>Loading...</Text>
            ) : isEnd && stores.length > 0 ? (
              <Text style={Categorystyles.emptyText}>가게가 더 없습니다</Text>
            ) : null
          }
          ListEmptyComponent={
            !loading && stores.length === 0 ? (
              <Text style={Categorystyles.emptyText}>
                이 카테고리에 가게가 없어요
              </Text>
            ) : null
          }
          refreshing={loading} // 로딩 중일 때 새로 고침 아이콘을 표시
          onRefresh={() => fetchStores(true)}
        />
      )}
    </SafeAreaView>
  );
};

export default CategoryTapScreen;
