import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Pressable,
  PixelRatio,
  Platform,
} from 'react-native';
import ViewedStoreItem from './ViewedStoreItem';
import {Store_getby_viewed} from '../../../api/storeApi';
import {useFocusEffect} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import CustomText from '../../../utils/CustomText';

const ViewedStoreList = ({refresh, navigation, location, loaded}) => {
  const [stores, setStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalpage, setTotalpage] = useState(0);

  const getStoreData = async (currentPage, reset = false) => {
    if (location) {
      if (loading || (!hasMore && !reset)) return;

      if (reset) {
        setPage(0);
      }

      try {
        const storesData = await Store_getby_viewed(currentPage);
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

  useFocusEffect(
    useCallback(() => {
      if (!location) {
        return;
      }
      getStoreData(0, true);
    }, [location]),
  );

  const renderStoreItem = ({item}) => {
    return (
      <ViewedStoreItem
        store={item}
        navigation={navigation}
        location={location}
      />
    );
  };

  return (
    <>
      {stores.length === 0 && !loading ? (
        <View style={{marginTop: 20}}></View>
      ) : (
        <View style={{backgroundColor: '#fff', marginTop: 20}}>
          <Pressable
            style={styles.storeTextView}
            onPress={() =>
              stores.length >= 4 && navigation.navigate('ViewedStoreScreen')
            }>
            <View
              style={{
                marginTop: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginRight: 20,
                alignItems: 'center',
              }}>
              <CustomText style={[styles.storeText]}>최근 본 매장</CustomText>
              {stores.length >= 4 && (
                <View style={styles.totalView}>
                  <CustomText style={[styles.totalText]}>전체보기</CustomText>
                  <Feather name={'chevron-right'} size={15} color="#333" />
                </View>
              )}
            </View>
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

                marginBottom: 10,
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
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  storeTextView: {
    marginLeft: 20,
    marginTop: 0,
  },
  storeText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  storetotaltext: {
    fontFamily: 'Pretendard-Medium',
    color: '#333',
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
  division: {
    width: '100%',
    height: 10,
    backgroundColor: '#F5F5F5',
    marginTop: 20,
  },
});

export default ViewedStoreList;
