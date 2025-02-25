import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import NearStoreItem from './NearStoreItem';
import {Store_getby_distance} from '../../../api/storeApi';

const NearStoreList = ({refresh, navigation, location, setRefresh}) => {
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalpage, setTotalpage] = useState(0);

  const getStoreData = async (currentPage, reset = false) => {
    if (location) {
      if (loading || (!hasMore && !reset)) return;
      setLoading(true);

      if (reset) {
        setPage(0);
      }

      try {
        const storesData = await Store_getby_distance(
          currentPage,
          location.latitude,
          location.longitude,
        );

        setTotalpage(storesData.totalPages);

        if (storesData.content && storesData.content.length > 0) {
          setStores(prevData => {
            const newData = reset
              ? storesData.content
              : [...prevData, ...storesData.content];
            const uniqueData = newData.filter(
              (item, index, self) =>
                index === self.findIndex(existing => existing.id === item.id),
            );
            return uniqueData;
          });
        } else {
          setHasMore(false); // 더 이상 데이터가 없으면 false로 설정
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (refresh) {
      setStores([]); // 데이터 초기화
      setHasMore(true); // 더 로드할 데이터가 있음을 명시
      getStoreData(0, true); // 새로고침 시 데이터 리
      setRefresh(false);
    }
  }, [refresh]);

  useEffect(() => {
    if (location) {
      getStoreData(0, true);
    }
  }, [location]);

  const renderStoreItem = ({item}) => {
    return (
      <NearStoreItem store={item} navigation={navigation} location={location} />
    );
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <Text style={styles.emptyText}>Loading...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (!loading) {
      return (
        <Text style={styles.emptyText}>근처에 등록된 가게가 없습니다.</Text>
      );
    }
    return null;
  };

  return (
    <View>
      <View style={styles.storeTextView}>
        <Text style={styles.storeText}>제일 가까운 주점은?</Text>
        <Text style={styles.storeSubText}>
          현재 위치에서 가장 가까운 주점을 알려드려요
        </Text>
      </View>
      <FlatList
        data={stores}
        renderItem={renderStoreItem}
        keyExtractor={item => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalFlatListContent}
        onEndReached={() => {
          if (hasMore && !loading && page < totalpage - 1) {
            setPage(prevPage => {
              const nextPage = prevPage + 1; // 다음 페이지 번호
              getStoreData(nextPage); // 그 페이지 번호로 데이터 요청
              return nextPage; // 상태를 증가된 페이지 번호로 갱신
            });
          }
        }}
        initialNumToRender={10} // 처음 렌더링할 개수 (기본값: 10)
        maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
        windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
        removeClippedSubviews={true} // 보이지 않는 컴포넌트 메모리 해제
        onEndReachedThreshold={0.5} // 리스트 끝에 가까워지면 데이터를 추가로 가져옵니다.
        ListFooterComponent={renderFooter} // 로딩 인디케이터
        ListEmptyComponent={renderEmptyComponent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  storeTextView: {
    width: '100%',
    marginLeft: 20,
    marginTop: 10,
  },
  storeText: {
    marginTop: 10,
    fontSize: 17,
    color: 'black',
    fontWeight: 'bold',
  },
  storeSubText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'gray',
    marginTop: 7,
  },
  storeView: {
    marginTop: 1,
    width: '100%',
  },
  horizontalScrollViewContent: {
    paddingHorizontal: 20, // 필요에 따라 조정
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
    marginLeft: 18,
  },
});

export default NearStoreList;
