import React, {useState, useEffect, useRef, useCallback} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Platform,
} from 'react-native';
import StoreResultItem from './StoreResultItem';
import {Store_getby_store} from '../../api/storeApi';
import StoreResultItemSkeleton from './StoreResultItemSkeleton';
import Loading from '../../hooks/Loading';
import CustomText from '../../utils/CustomText';
const StoreResultList = ({trimmedSearchWord, navigation, index}) => {
  const [searchingStores, setSearchingStores] = useState([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false); // 페이지네이션 로딩
  const [firstLoading, setFirstLoading] = useState(false); // 최초 로딩
  const [isEnd, setIsEnd] = useState(false);
  const [totalPage, setTotalPage] = useState(0);
  const [isWord, setIsWord] = useState(false);

  const scrollRef = useRef(null);

  const filteredStores = useCallback(
    async currentPage => {
      const isInitial = currentPage === 0;
      if (isInitial) setFirstLoading(true);
      setLoading(true);

      if (!trimmedSearchWord) {
        setFirstLoading(false);
        setIsWord(false);
        setLoading(false);
        return;
      }

      try {
        const data = await Store_getby_store(currentPage, trimmedSearchWord);
        setTotalPage(data.totalPages ?? 0);

        setSearchingStores(prev => {
          const next =
            currentPage === 0 ? data.content : [...prev, ...data.content];
          // 중복 제거
          const unique = Array.from(new Map(next.map(s => [s.id, s])).values());
          return unique;
        });

        // 마지막 페이지 판단
        const noMore =
          data.content.length === 0 ||
          currentPage >= (data.totalPages ?? 1) - 1;
        setIsEnd(noMore);
        setIsWord(true);
      } catch (err) {
        console.error('오류 발생:', err?.message ?? err);
      } finally {
        setLoading(false);
        if (isInitial) setFirstLoading(false);
      }
    },
    [trimmedSearchWord],
  );

  // 검색어 변경 시 초기화 + 첫 페이지 로드
  useEffect(() => {
    if (trimmedSearchWord) {
      setSearchingStores([]);
      setPage(0);
      setIsEnd(false);
      filteredStores(0);
      setIsWord(true);
      // 첫 로드시만 맨 위로
      if (scrollRef.current) {
        scrollRef.current.scrollToOffset({offset: 0, animated: false});
      }
    } else {
      setIsWord(false);
      setSearchingStores([]);
      setPage(0);
      setIsEnd(false);
    }
  }, [trimmedSearchWord, filteredStores]);

  const renderItem = ({item, index: itemIndex}) => (
    <>
      <StoreResultItem store={item} navigation={navigation} index={index} />
      {itemIndex !== searchingStores.length - 1 && (
        <View style={styles.horizontalDivider} />
      )}
    </>
  );

  const loadMore = () => {
    if (!loading && !isEnd && page < totalPage - 1) {
      const next = page + 1;
      setPage(next);
      filteredStores(next);
    }
  };

  return (
    <>
      <FlatList
        ref={scrollRef}
        data={searchingStores}
        renderItem={renderItem}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.fastSearchModalScrollView}
        initialNumToRender={10}
        maxToRenderPerBatch={5}
        windowSize={5}
        // iOS에서 점프 이슈가 있으면 false로 바꿔보세요.
        removeClippedSubviews={Platform.OS === 'android'}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={
          firstLoading ? (
            <View>
              {[1, 2, 3, 4, 5].map(i => (
                <View key={`skel-${i}`}>
                  <StoreResultItemSkeleton />
                  <View style={styles.horizontalDivider} />
                </View>
              ))}
            </View>
          ) : (
            isWord &&
            !loading && (
              <CustomText style={styles.emptyText}>
                주변에 검색된 술집이 없습니다
              </CustomText>
            )
          )
        }
        ListFooterComponent={
          loading && !firstLoading ? (
            <View style={{paddingVertical: 12}}>
              <StoreResultItemSkeleton />
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
      <Loading loading={loading} />
    </>
  );
};

const styles = StyleSheet.create({
  fastSearchModalScrollView: {
    marginTop: 1,
    paddingBottom: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 40,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
  horizontalDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 20,
    width: '100%',
    alignSelf: 'center',
  },
});

export default StoreResultList;
