import React, {useState, useEffect} from 'react';
import {
  FlatList,
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import OpenStoreItem from './OpenStoreItem';
import {Store_getby_business_hours} from '../../../api/storeApi';

const OpenStoreList = ({location, navigation, refresh, setRefresh}) => {
  const [distancestores, setDistancestores] = useState([]);
  const [distancepage, setDistancepage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchdistanceStores = async (currentPage, reset = false) => {
    if (location) {
      if (loading || (!hasMore && !reset)) return;
      setLoading(true);

      if (reset) {
        setDistancepage(0);
      }
      try {
        const data = await Store_getby_business_hours(
          currentPage,
          location.latitude,
          location.longitude,
        );

        if (data.content && data.content.length > 0) {
          setDistancestores(prevData => {
            const newData = reset
              ? data.content
              : [...prevData, ...data.content];
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
      } finally {
        setLoading(false); // 로딩 상태를 false로 설정
      }
    }
  };

  useEffect(() => {
    if (location) {
      fetchdistanceStores(0, true);
    }
  }, [location]);

  useEffect(() => {
    if (refresh) {
      setDistancestores([]); // distancestores 초기화
      fetchdistanceStores(0, true); // 새로고침 데이터 로드
      setHasMore(true);
    }
  }, [refresh]);

  const renderStoreItem = ({item}) => (
    <View style={styles.storeContainer}>
      <OpenStoreItem store={item} location={location} navigation={navigation} />
    </View>
  );

  return (
    <View>
      <View style={styles.todayPhrasesView}>
        <Text style={styles.mylocationlivetext}>현재 영업 중인 주점은?</Text>
        <Text style={styles.mylocationlivesubtext}>
          현재 위치에서 내 근처 영업 중인 주점을 알려드려요
        </Text>
      </View>

      <FlatList
        data={distancestores}
        renderItem={renderStoreItem}
        keyExtractor={(item, index) => `${item.id}-${index}`} // 고유 키 생성
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollViewContent}
        initialNumToRender={10} // 처음 렌더링할 개수 (기본값: 10)
        maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
        windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
        removeClippedSubviews={true} // 보이지 않는 컴포넌트 메모리 해제
        onEndReached={() => {
          if (!loading && hasMore) {
            setDistancepage(prevPage => {
              const nextPage = prevPage + 1; // 다음 페이지 번호
              fetchdistanceStores(nextPage); // 그 페이지 번호로 데이터 요청
              return nextPage; // 상태를 증가된 페이지 번호로 갱신
            });
          }
        }}
        onEndReachedThreshold={0.5} // 스크롤 임계값 조정
        ListFooterComponent={
          loading ? (
            <View style={styles.footer}>
              <Text style={styles.emptyText}>Loading...</Text>
            </View>
          ) : null
        }
        ListEmptyComponent={
          !loading ? <Text style={styles.emptyText}>가게가 없어요</Text> : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    paddingHorizontal: 10,
    alignItems: 'center',
    paddingBottom: 20,
  },
  todayPhrasesView: {
    marginTop: 20,
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
  storeContainer: {
    marginHorizontal: 3,
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

export default OpenStoreList;
