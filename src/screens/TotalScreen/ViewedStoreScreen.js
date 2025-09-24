import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  Pressable,
  FlatList,
  SafeAreaView,
} from 'react-native';
import Loading from '../../hooks/Loading';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import ViewedStoreTotalItem from '../../components/TotalScreen/ViewedStoreTotalItem';
import {Store_getby_viewed} from '../../api/storeApi';
import ViewedStoreItemSkeleton from '../../components/TotalScreen/TotalSkeleton/ViewedStoreItemSkeleton';
import ScrollToTopButton from '../../components/common/ScrollToTopButton';
import useScrollToTopVisibility from '../../hooks/useScrollToTopVisibility';
const ViewedStoreScreen = ({navigation}) => {
  const {bottom} = useSafeAndroidInsets();
  const [distancestores, setDistancestores] = useState([]);
  const [distancepage, setDistancepage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalpage, setTotalpage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [firstloading, setFirstloading] = useState(true);
  const {
    scrollRef,
    visible: showScrollToTop,
    handleScroll,
    updateVisibility,
    scrollToTop,
  } = useScrollToTopVisibility();
  const scrollButtonBottom = (bottom || 16) + 24 + 36;
  const fetchdistanceStores = async (currentPage, reset = false) => {
    if (loading || (!hasMore && !reset)) return;
    setLoading(true);

    if (reset) {
      setDistancepage(0);
    }
    try {
      const data = await Store_getby_viewed(currentPage);

      setTotalpage(data.totalPages);

      if (data.content && data.content.length > 0) {
        setDistancestores(prevData => {
          const newData = reset ? data.content : [...prevData, ...data.content];
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
      setRefreshing(false);
      setFirstloading(false);
    }
  };

  useEffect(() => {
    fetchdistanceStores(0, true);
  }, []);

  useEffect(() => {
    if (firstloading || refreshing) {
      updateVisibility(0);
    }
  }, [firstloading, refreshing, updateVisibility]);

  const onRefresh = () => {
    setRefreshing(true);
    setDistancestores([]); // distancestores 초기화
    fetchdistanceStores(0, true); // 새로고침 데이터 로드
    setHasMore(true);
  };

  const renderStoreItem = ({item}) => (
    <View style={styles.storeContainer}>
      <ViewedStoreTotalItem store={item} navigation={navigation} />
    </View>
  );

  return (
    <SafeAreaView
      style={{flex: 1, paddingBottom: bottom, backgroundColor: '#fff'}}>
      {firstloading || refreshing ? (
        <FlatList
          data={[1, 2, 3, 4, 5, 6, 7]} // 임의의 더미 데이터
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{paddingTop: 11, paddingBottom: 11}}
          renderItem={() => <ViewedStoreItemSkeleton />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          ref={scrollRef}
          data={distancestores}
          renderItem={renderStoreItem}
          keyExtractor={(item, index) => `${item.id}-${index}`} // 고유 키 생성
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingTop: 11, paddingBottom: 11}}
          initialNumToRender={10} // 처음 렌더링할 개수 (기본값: 10)
          maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
          windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
          removeClippedSubviews={true} // 보이지 않는 컴포넌트 메모리 해제
          onEndReached={() => {
            if (!loading && hasMore && distancepage < totalpage - 1) {
              setDistancepage(prevPage => {
                const nextPage = prevPage + 1; // 다음 페이지 번호
                fetchdistanceStores(nextPage); // 그 페이지 번호로 데이터 요청
                return nextPage; // 상태를 증가된 페이지 번호로 갱신
              });
            }
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshing={refreshing}
          onRefresh={() => {
            onRefresh();
          }}
          onEndReachedThreshold={0.5} // 스크롤 임계값 조정
        />
      )}
      {distancestores.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>근처에 등록된 술집이 없어요</Text>
        </View>
      )}
      <ScrollToTopButton
        visible={showScrollToTop}
        bottom={scrollButtonBottom}
        onPress={scrollToTop}
      />
      <Loading loading={loading || refreshing} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default ViewedStoreScreen;
