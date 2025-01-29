import React, {useState, useEffect} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import RecentStoreItem from './RecentStoreItem';
import {Store_getby_recent} from '../../../api/storeApi';

const RecentStoreList = ({refresh, setRefresh, navigation}) => {
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchStores = async (reset = false) => {
    if (loading || (!hasMore && !reset)) return; // 로딩 중이거나 더 이상 데이터가 없으면 종료
    setLoading(true);

    try {
      const data = await Store_getby_recent(reset ? 0 : page);
      console.log(data);
      if (data && data.length > 0) {
        setStores(prevData => {
          const newData = reset ? data : [...prevData, ...data];
          const uniqueData = newData.filter(
            (item, index, self) =>
              index === self.findIndex(existing => existing.id === item.id),
          );
          return uniqueData;
        });
        setPage(reset ? 0 : prevPage => prevPage + 1);
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
    if (!loading && hasMore) {
      fetchStores(); // 추가 데이터 로드
    }
  };

  useEffect(() => {
    if (refresh) {
      setStores([]); // 데이터 초기화
      setPage(0); // 페이지 초기화
      setHasMore(true); // 더 로드할 데이터가 있음을 명시
      fetchStores(true); // 새로고침 시 데이터 리셋
      setRefresh(false); // 새로고침 상태 초기화
    }
  }, [refresh]);

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
    <RecentStoreItem store={item} navigation={navigation} />
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
    marginTop: 10,
    marginLeft: 25,
    marginBottom: 5,
  },
  mylocationlivetext: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
    marginTop: 10,
  },
  mylocationlivesubtext: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'gray',
    marginTop: 3,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
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
