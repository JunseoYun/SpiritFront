import React, {useState, useEffect, useCallback} from 'react';
import {useFocusEffect} from '@react-navigation/native';
import {View, Text, StyleSheet, FlatList} from 'react-native';
import MyReviewItem from './MyReviewItem';
import {ReviewRecentGet, ReviewDelete} from '../../api/reviewApi';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useToast} from '../../context/ToastContext';
import Loading from '../../hooks/Loading';

const MyReview = ({navigation}) => {
  const [myReview, setMyReview] = useState([]); // 검색된 가게 목록
  const [page, setPage] = useState(0); // 페이지 번호
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [isEnd, setIsEnd] = useState(false); // 데이터 끝 여부
  const [totalpage, setTotalpage] = useState(0);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();

  // 검색된 가게들을 필터링하는 함수
  const myReviewsget = async currentPage => {
    setLoading(true);

    try {
      const data = await ReviewRecentGet(currentPage);
      setTotalpage(data.totalPages);

      if (data.content.length === 0) {
        setIsEnd(true); // 더 이상 데이터가 없으면
      } else {
        // 기존 데이터와 병합하고 중복 제거
        setMyReview(prevStores => {
          const mergedReviews = [...prevStores, ...data.content];
          const uniqueReviews = Array.from(
            new Map(mergedReviews.map(review => [review.id, review])).values(),
          );
          return uniqueReviews;
        });
      }
    } catch (err) {
      console.error('오류 발생:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // 초기 로딩 시, 검색어와 위치가 있을 때 데이터를 불러옴
  useFocusEffect(
    useCallback(() => {
      setMyReview([]); // 기존 데이터 초기화
      setPage(0);
      setIsEnd(false);
      myReviewsget(0); // 첫 페이지 불러오기
    }, []),
  );

  const deleteReview = reviewid => {
    showAlert({
      title: `리뷰 삭제`,
      message: `이 리뷰를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await ReviewDelete(reviewid);
          setMyReview(prevReviews =>
            prevReviews.filter(review => review.id !== reviewid),
          );
          showToast('삭제 되었습니다.');
        } catch (error) {}
      },
      onCancel: null,
      type: 'delete',
    });
  };

  const updateReview = reviewdata => {
    navigation.navigate('ReviewEditScreen', {
      reviewdata,
      onRefresh: () => {
        setMyReview([]); // 기존 데이터 초기화
        setPage(0);
        setIsEnd(false);
        myReviewsget(0); // 첫 페이지 불러오기
      },
    });
  };

  const renderItem = ({item}) => (
    <MyReviewItem
      key={item.id}
      review={item}
      navigation={navigation}
      deleteReview={() => deleteReview(item.id)}
      updateReview={() => updateReview(item)}
    />
  );
  return (
    <>
      <FlatList
        data={myReview}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        initialNumToRender={10} // 처음 렌더링할 개수 (기본값: 10)
        maxToRenderPerBatch={5} // 한 번에 추가 로드할 개수
        windowSize={5} // 화면 밖의 아이템을 얼마나 유지할지
        removeClippedSubviews={true} // 보이지 않는 컴포넌트 메모리 해제
        onEndReached={() => {
          if (!loading && !isEnd && page < totalpage - 1) {
            setPage(prevPage => {
              const nextPage = prevPage + 1; // 다음 페이지 번호
              myReviewsget(nextPage); // 그 페이지 번호로 데이터 요청
              return nextPage; // 상태를 증가된 페이지 번호로 갱신
            });
          }
        }} // 끝에 도달하면 데이터 불러오기
        onEndReachedThreshold={0.5}
        // ListFooterComponent={
        //   loading && !isEnd ? (
        //     <View style={styles.footer}>
        //       <Text style={styles.emptyText}>Loading...</Text>
        //     </View>
        //   ) : //aa
        //   null
        // }
        ListEmptyComponent={
          !loading && myReview.length === 0 ? (
            <View style={styles.footer}>
              <Text style={styles.emptyText}>등록된 리뷰가 없어요</Text>
            </View>
          ) : null
        }
      />
      <Loading loading={loading} />
      <AlertComponent />
      {/* 모달 컴포넌트 사용 */}
    </>
  );
};

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 60,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default MyReview;
