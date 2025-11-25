import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  PixelRatio,
  Platform,
} from 'react-native';
import NearStoreItem from './NearStoreItem';
import {Store_getby_distance} from '../../../api/storeApi';
import Feather from 'react-native-vector-icons/Feather';
import CustomText from '../../common/CustomText';

const NearStoreList = ({refresh, navigation, location}) => {
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
      getStoreData(0, true); // 새로고침 시 데이터 리로드
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
        <CustomText style={styles.emptyText}>Loading...</CustomText>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (!loading) {
      return (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.emptyText}>
            주변에 등록된 술집이 없어요
          </CustomText>
        </View>
      );
    }
    return null;
  };

  return (
    <View>
      <Pressable
        style={styles.storeTextView}
        onPress={() =>
          stores.length >= 3 &&
          navigation.navigate('NearStoreScreen', {location})
        }>
        <View
          style={{
            marginTop: 10,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginRight: 40,
            alignItems: 'center',
          }}>
          <CustomText style={[styles.storeText]}>
            제일 가까운 술집은?
          </CustomText>
          {stores.length >= 3 && (
            <View style={styles.totalView}>
              <CustomText style={[styles.totalText]}>전체보기</CustomText>
              <Feather name={'chevron-right'} size={15} color="#333" />
            </View>
          )}
        </View>
        <CustomText style={styles.storeSubText}>
          현재 위치에서 가장 가까운 술집을 알려드려요
        </CustomText>
      </Pressable>
      <FlatList
        data={stores}
        renderItem={renderStoreItem}
        keyExtractor={item => item.id.toString()}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.horizontalFlatListContent,
          {
            paddingRight: 18,
            paddingLeft: 10,
            paddingBottom: 10,
          },
        ]} // 오른쪽 여백 추가
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
        removeClippedSubviews={Platform.OS === 'android'} // iOS에서는 화면이 잘려 렌더링 오류가 발생해 안드로이드에서만 사용
        onEndReachedThreshold={0.5} // 리스트 끝에 가까워지면 데이터를 추가로 가져옵니다.
        //ListFooterComponent={renderFooter} // 로딩 인디케이터
      />
      {stores.length === 0 && !loading && (
        <View style={styles.emptyContainer}>
          <CustomText style={styles.emptyText}>
            주변에 등록된 술집이 없어요
          </CustomText>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  storeTextView: {
    width: '100%',
    marginLeft: 20,
    marginTop: 20,
  },
  storeText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#181a1a',
  },
  totalView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
  },
  storetotaltext: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#181a1a',
  },
  storeSubText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#777',
    marginTop: 5,
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
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default NearStoreList;
