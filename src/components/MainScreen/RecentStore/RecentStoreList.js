import React, {useState, useEffect} from 'react';
import {FlatList, StyleSheet, View, Text} from 'react-native';
import RecentStoreItem from './RecentStoreItem';
import {Store_getby_recent} from '../../../api/storeApi';

const RecentStoreList = ({refresh, setRefresh, navigation, location}) => {
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalpage, setTotalpage] = useState(0);

  const fetchStores = async (currentPage, reset = false) => {
    if (loading || (!hasMore && !reset)) return; // 로딩 중이거나 더 이상 데이터가 없으면 종료
    setLoading(true);

    if (reset) {
      setPage(0);
    }

    try {
      const data = await Store_getby_recent(currentPage);

      setTotalpage(data.totalPages);

      if (data.content && data.content.length > 0) {
        setStores(prevData => {
          const newData = reset ? data.content : [...prevData, ...data.content];
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
  };

  const handleEndReached = () => {
    if (!loading && hasMore && page < totalpage - 1) {
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        fetchStores(nextPage); // 추가 데이터 로드
        return nextPage; // 상태를 증가된 페이지 번호로 갱신
      });
    }
  };

  useEffect(() => {
    if (refresh) {
      setStores([]); // 데이터 초기화
      setHasMore(true); // 더 로드할 데이터가 있음을 명시
      fetchStores(0, true); // 새로고침 시 데이터 리
    }
  }, [refresh]);

  useEffect(() => {
    fetchStores(0, true);
  }, []);

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
      return <Text style={styles.emptyText}>최근 방문한 가게가 없습니다.</Text>;
    }
    return null;
  };

  const renderStoreItem = ({item}) => (
    <RecentStoreItem store={item} navigation={navigation} location={location} />
  );

  return (
    <View>
      <View style={styles.todayPhrasesView}>
        <Text style={styles.mylocationlivetext}>최근 방문한 장소</Text>
        <Text style={styles.mylocationlivesubtext}>
          다시 방문하고 싶은 장소를 확인해보세요
        </Text>
      </View>

      <FlatList
        data={stores}
        renderItem={renderStoreItem}
        keyExtractor={item => item.id.toString()} // 고유 ID를 문자열로 변환
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        onEndReached={handleEndReached} // 끝에 도달했을 때 추가 데이터 로드
        onEndReachedThreshold={0.5} // 스크롤 트리거 임계값
        initialNumToRender={10} // 처음 렌더링할 개수 (기본값: 10)
        maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
        windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
        removeClippedSubviews={true} // 보이지 않는 컴포넌트 메모리 해제
        ListFooterComponent={renderFooter} // 로딩 인디케이터
        ListEmptyComponent={renderEmptyComponent} // 빈 상태 처리
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 10,
    paddingBottom: 20, // 리스트 끝에 여유 공간 추가
  },
  todayPhrasesView: {
    marginTop: 30,
    marginLeft: 25,
  },
  mylocationlivetext: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
  },
  mylocationlivesubtext: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
    marginTop: 5,
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

export default RecentStoreList;
