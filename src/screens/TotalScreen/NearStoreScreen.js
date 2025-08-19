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
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useDistance from '../../hooks/useDistance';
import useStoreStatus from '../../hooks/useStoreStatus';
import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';
import {Store_getby_distance} from '../../api/storeApi';
import FastImage from 'react-native-fast-image';
import {useRoute} from '@react-navigation/native';
import Loading from '../../hooks/Loading';
import NearStoreScreenitem from '../../components/NearStoreScreen/NearStoreScreenitem';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import OpenStoreScreenitemSkeleton from '../../components/OpenStoreScreen/OpenStoreScreenitemSkeleton';

const NearStoreScreen = ({navigation}) => {
  const route = useRoute();
  const {bottom} = useSafeAndroidInsets();
  const {location} = route.params;
  const [distancestores, setDistancestores] = useState([]);
  const [distancepage, setDistancepage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalpage, setTotalpage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [firstloading, setFirstloading] = useState(true);
  const fetchdistanceStores = async (currentPage, reset = false) => {
    if (location) {
      if (loading || (!hasMore && !reset)) return;
      setLoading(true);

      if (reset) {
        setDistancepage(0);
      }
      try {
        const data = await Store_getby_distance(
          currentPage,
          location.latitude,
          location.longitude,
        );

        setTotalpage(data.totalPages);

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
        setRefreshing(false);
        setFirstloading(false);
      }
    }
  };

  useEffect(() => {
    if (location) {
      fetchdistanceStores(0, true);
    }
  }, [location]);

  const onRefresh = () => {
    setRefreshing(true);
    setDistancestores([]); // distancestores 초기화
    fetchdistanceStores(0, true); // 새로고침 데이터 로드
    setHasMore(true);
  };

  const renderStoreItem = ({item}) => (
    <View style={styles.storeContainer}>
      <NearStoreScreenitem
        store={item}
        location={location}
        navigation={navigation}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={{flex: 1, paddingBottom: bottom, backgroundColor: '#fff'}}>
      {firstloading || refreshing ? (
        <FlatList
          data={[1, 2, 3]} // 임의의 더미 데이터
          keyExtractor={(item, index) => index.toString()}
          renderItem={() => <OpenStoreScreenitemSkeleton />}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={distancestores}
          renderItem={renderStoreItem}
          keyExtractor={(item, index) => `${item.id}-${index}`} // 고유 키 생성
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
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
      <Loading loading={loading || refreshing} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default NearStoreScreen;
