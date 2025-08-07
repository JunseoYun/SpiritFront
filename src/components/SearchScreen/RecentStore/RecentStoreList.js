import React, {useState, useEffect} from 'react';
import {FlatList, StyleSheet, View, Text} from 'react-native';
import RecentStoreItem from './RecentStoreItem';
import {Store_getby_recent} from '../../../api/storeApi';
import {useAuth} from '../../../context/AuthContext';
import RecentStoreItemSkeleton from './RecentStoreItemSkeleton';
const RecentStoreList = ({
  refresh,
  setRefresh,
  navigation,
  location,
  loading,
  setLoading,
}) => {
  const {token} = useAuth();
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  // const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalpage, setTotalpage] = useState(0);

  const fetchStores = async (currentPage, reset = false) => {
    if (!token) return;
    if (loading || (!hasMore && !reset)) return; // 로딩 중이거나 더 이상 데이터가 없으면 종료
    setLoading(true);

    if (reset) {
      setPage(0);
    }

    try {
      const data = await Store_getby_recent(currentPage);
      setTotalpage(data.totalPages);

      if (data.content && data.content.length > 0) {
        // 👉 isDeleted가 false인 항목만 필터링
        const filteredContent = data.content.filter(store => !store.isDeleted);

        setStores(prevData => {
          const newData = reset
            ? filteredContent
            : [...prevData, ...filteredContent];

          // 👉 중복 제거
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
    if (!token || !refresh) return;
    setStores([]); // 데이터 초기화
    setHasMore(true); // 더 로드할 데이터가 있음을 명시
    fetchStores(0, true); // 새로고침 시 데이터 리
  }, [refresh]);

  useEffect(() => {
    if (!token) return;
    fetchStores(0, true);
  }, []);

  const renderStoreItem = ({item}) => (
    <RecentStoreItem store={item} navigation={navigation} location={location} />
  );

  return (
    <View>
      <View style={styles.todayPhrasesView}>
        <Text style={styles.mylocationlivetext}>최근 방문한 술집</Text>
        <Text style={styles.mylocationlivesubtext}>
          다시 방문하고 싶은 술집을 확인해보세요
        </Text>
      </View>
      {token && (
        <>
          {loading || refresh ? (
            <FlatList
              data={[1, 2, 3]} // 임의의 더미 데이터
              keyExtractor={(item, index) => index.toString()}
              renderItem={() => <RecentStoreItemSkeleton />}
              showsHorizontalScrollIndicator={false}
              horizontal
              contentContainerStyle={styles.scrollViewContent}
            />
          ) : (
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
            />
          )}
        </>
      )}

      {token && stores.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>최근 방문한 술집이 없어요</Text>
        </View>
      )}
      {!token && (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {marginTop: 20}]}>
            로그인 후 이용해주세요
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 10,
    paddingBottom: 20, // 리스트 끝에 여유 공간 추가
  },
  todayPhrasesView: {
    marginTop: 10,
    marginLeft: 25,
  },
  mylocationlivetext: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    marginTop: 10,
  },
  mylocationlivesubtext: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#777',
    marginTop: 5,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',

    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default RecentStoreList;
