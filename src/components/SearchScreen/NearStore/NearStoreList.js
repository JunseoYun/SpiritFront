import React, {useState, useEffect} from 'react';
import {View, Text, FlatList, StyleSheet} from 'react-native';
import NearStoreItem from './NearStoreItem';
import {Store_getby_distance} from '../../../api/storeApi';

const NearStoreList = ({navigation, location}) => {
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalpage, setTotalpage] = useState(0);

  useEffect(() => {
    if (location) {
      setPage(0);
      getStoreData(0, true);
    }
  }, [location]);

  const getStoreData = async (currentPage, reset = false) => {
    if (location) {
      if (loading || (!hasMore && !reset)) return;
      setLoading(true);
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
          setHasMore(true); // 데이터가 있으면 계속 로드 가능
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

  const renderStoreItem = ({item}) => {
    return <NearStoreItem store={item} navigation={navigation} />;
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
      return <Text style={styles.emptyText}>가게가 없습니다.</Text>;
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
  },
});

export default NearStoreList;
