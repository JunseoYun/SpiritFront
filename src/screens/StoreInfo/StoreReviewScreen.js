import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {ReviewStoreGet, review_delete_reply} from '../../api/reviewApi';
import ReviewItem from '../../components/StoreReviewScreen/ReviewItem';
import useCustomAlert from '../../hooks/useCustomAlert';
import Loading from '../../hooks/Loading';
import ReviewItemSkeleton from '../../components/StoreReviewScreen/ReviewItemSkeleton';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import BottomActionButton from '../../utils/BottomActionButton';
const StoreReviewScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, storename, isOwner} = route.params;
  const shouldRefresh = route.params?.shouldRefresh;
  const [reviewdata, setReviewdata] = useState([]);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {bottom} = useSafeAndroidInsets();

  const [firstloading, setFirstloading] = useState(true);
  const [page, setPage] = useState(0); // 페이지 번호
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [isEnd, setIsEnd] = useState(false); // 데이터 끝 여부
  const [totalpage, setTotalpage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const getReviewData = useCallback(
    async currentPage => {
      setLoading(true);

      try {
        const reviewData = await ReviewStoreGet(storeId, currentPage);
        setTotalpage(reviewData.totalPages);

        if (reviewData.content.length === 0) {
          setIsEnd(true); // 더 이상 데이터가 없으면
        } else {
          // 기존 데이터와 병합하고 중복 제거
          setReviewdata(prevReviews => {
            const mergedReviews = [...prevReviews, ...reviewData.content];
            const uniqueReviews = Array.from(
              new Map(mergedReviews.map(review => [review.id, review])).values(),
            );
            return uniqueReviews;
          });
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
        setRefreshing(false);
        setFirstloading(false);
      }
    },
    [storeId],
  );

  const loadMoreReviews = useCallback(() => {
    if (!loading && !isEnd) {
      setPage(prevPage => {
        const nextPage = prevPage + 1;
        getReviewData(nextPage); // 다음 페이지 데이터를 가져옴
        return nextPage;
      });
    }
  }, [getReviewData, isEnd, loading]);

  useEffect(() => {
    setReviewdata([]); // 기존 데이터 초기화
    setPage(0); // 페이지 초기화
    setIsEnd(false);
    getReviewData(0);
  }, [getReviewData]);

  const handleRefresh = useCallback(() => {
    setReviewdata([]); // 기존 stores 초기화
    setIsEnd(true); // 추가 데이터 여부 초기화
    setPage(0);
    setRefreshing(true); // 새로고침 시작
    getReviewData(0); // 새로고침
  }, [getReviewData]);

  useFocusEffect(
    useCallback(() => {
      if (shouldRefresh) {
        handleRefresh();
        navigation.setParams({shouldRefresh: false});
      }
    }, [handleRefresh, navigation, shouldRefresh]),
  );


  const handleDeleteReply = reviewId => {
    showAlert({
      title: '답글 삭제',
      message: '해당 답글 삭제하시겠습니까?',
      onConfirm: () => {
        deleteReply(reviewId);
      },
      type: 'delete',
    });
  };

  const deleteReply = async reviewId => {
    setLoading(true);
    try {
      await review_delete_reply(reviewId);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({item}) => (
    <ReviewItem
      key={item.id}
      item={item}
      navigation={navigation}
      isOwner={isOwner}
      handleDeleteReply={handleDeleteReply}
    />
  );

  const handleWriteReviewPress = () => {
    navigation.navigate('StoreReviewWriteScreen', {
      storeId,
      storename,
      onReviewSubmitted: handleRefresh,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <SafeAreaView style={[styles.container, {paddingBottom: bottom}]}>
        <View style={{width: '100%'}}>
          {firstloading || refreshing ? (
            <FlatList
              data={[1, 2, 3]} // 임의의 더미 데이터
              keyExtractor={(item, index) => index.toString()}
              renderItem={() => <ReviewItemSkeleton />}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={reviewdata}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              keyboardDismissMode="none"
              keyboardShouldPersistTaps="always"
              onEndReached={loadMoreReviews}
              onEndReachedThreshold={0.5}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              contentContainerStyle={{paddingBottom: 0}}
              ListFooterComponent={
                <View style={styles.footer}>
                  {loading && !isEnd ? (
                    <Text style={styles.emptyText}>Loading...</Text>
                  ) : !loading && reviewdata.length === 0 ? (
                    <Text style={styles.emptyText}>등록된 리뷰가 없어요</Text>
                  ) : null}
                </View>
              }
            />
          )}
        </View>
        <BottomActionButton
          label={'리뷰 작성하기'}
          cancel={false}
          onPress={handleWriteReviewPress}
        />
      </SafeAreaView>
      <AlertComponent />
      <Loading loading={loading} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 0 : 15,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 15,
    marginLeft: 15,
    textAlign: 'center',
    color: '#333', // ✅ 더 진한 색상 적용
  },
  MenuaddView: {
    width: '100%',
    marginTop: 10,

    paddingHorizontal: 18,
    paddingBottom: 10,

    borderBottomWidth: 0.5,
    borderColor: '#E5E5E5',
  },
  addButton: {
    width: '100%',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#3CBBFF',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    padding: 16,
  },
  star: {
    marginHorizontal: 3, // 별 사이 간격
  },
  loadMoreButton: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderColor: '#E7E7E7',
  },
  loadMoreText: {
    color: '#1E90FF',
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    fontSize: 16,
  },
  footer: {
    marginVertical: 20,
    alignItems: 'center',
    height: 100,
  },
  footerloading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(194, 194, 194, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Pretendard-Medium', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#c0c0c0',
  },

  modalContent: {
    flex: 1,
    width: '100%',
  },
});

export default StoreReviewScreen;
