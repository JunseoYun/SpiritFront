import React, {useState, useEffect, useCallback, useRef} from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {PostGetByStore} from '../../api/postApi';
import ReviewItem from '../../components/StoreReviewScreen/ReviewItem';
import {
  POST_REPORT_REASONS,
  REPORT_REASON_MAP,
} from '../../components/Post/PostReportSheet';
import PostReportBottomSheet from '../../components/Post/PostReportBottomSheet';
import {report_create} from '../../api/reportApi';
import {useToast} from '../../context/ToastContext';
import useCustomAlert from '../../hooks/useCustomAlert';
import Loading from '../../hooks/Loading';
import ReviewItemSkeleton from '../../components/StoreReviewScreen/ReviewItemSkeleton';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import BottomActionButton from '../../utils/BottomActionButton';
import CustomText from '../../utils/CustomText';

const StoreReviewScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, storename, isOwner, storeAddress} = route.params;
  const shouldRefresh = route.params?.shouldRefresh;

  const [postData, setPostData] = useState([]);
  const [firstloading, setFirstloading] = useState(true);
  const [postLoading, setPostLoading] = useState(true);

  // (옵션) 포스트 페이징 쓰고 싶으면 유지
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false); // 하단 로딩
  const [isEnd, setIsEnd] = useState(false);
  const [totalpage, setTotalpage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedPostReportReason, setSelectedPostReportReason] =
    useState(null);
  const [postReportTarget, setPostReportTarget] = useState(null);

  const {showToast} = useToast();
  const {showAlert, AlertComponent} = useCustomAlert(); // (지금은 삭제 액션 없으면 안써도 됨)
  const {bottom} = useSafeAndroidInsets();
  const postReportSheetRef = useRef(null);

  const mapPost = useCallback(post => {
    return {
      ...post,
      id: String(post.id ?? ''),
      writerNickname: post.writerNickname ?? '게스트',
      writerImgUrl: post.writerImgUrl ?? null,
      profileImage: post.writerImgUrl ?? null,
      nickname: post.writerNickname ?? '게스트',
      rate: post.rate ?? post.rating ?? 0,
      visitedAt: null,
      content: post.content ?? '',
      imgUrlList: Array.isArray(post.postImgUrlList) ? post.postImgUrlList : [],
      postImages: Array.isArray(post.postImgUrlList) ? post.postImgUrlList : [],
      name: post.storeName ?? post.name ?? null,
      storeAddress: post.storeAddress ?? post.address ?? null,
      createdAt: post.createdAt ?? post.createAt ?? post.createdDate ?? null,
      isPostItem: true,
    };
  }, []);

  const getStorePosts = useCallback(
    async (nextPage = 0, {reset = false} = {}) => {
      if (!storeId) {
        setPostData([]);
        setPostLoading(false);
        setFirstloading(false);
        setRefreshing(false);
        return;
      }

      // 첫 로딩/리프레시/무한스크롤 공용
      if (reset) {
        setIsEnd(false);
        setPage(0);
      }

      if (nextPage === 0) setPostLoading(true);
      else setLoading(true);

      try {
        // ✅ size는 원하는대로
        const data = await PostGetByStore({storeId, page: nextPage, size: 10});
        setTotalpage(data?.totalPages ?? 0);

        const mapped = (data?.content ?? []).map(mapPost);

        if (mapped.length === 0) {
          setIsEnd(true);
          return;
        }

        setPostData(prev => {
          const merged = reset ? mapped : [...prev, ...mapped];
          return Array.from(new Map(merged.map(v => [v.id, v])).values());
        });

        setPage(nextPage);
      } catch (error) {
        console.error('매장 게시글 조회 실패:', error);
      } finally {
        setPostLoading(false);
        setLoading(false);
        setRefreshing(false);
        setFirstloading(false);
      }
    },
    [mapPost, storeId],
  );

  useEffect(() => {
    // ✅ 이제 리뷰 로딩 없음. 포스트만 초기 조회
    setPostData([]);
    setIsEnd(false);
    getStorePosts(0, {reset: true});
  }, [getStorePosts]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPostData([]);
    setIsEnd(false);
    getStorePosts(0, {reset: true});
  }, [getStorePosts]);

  const loadMorePosts = useCallback(() => {
    if (loading || postLoading || isEnd) return;

    // totalpage를 신뢰하면 아래 조건 추가 가능
    // if (page >= totalpage - 1) return;

    const nextPage = page + 1;
    getStorePosts(nextPage);
  }, [getStorePosts, isEnd, loading, page, postLoading]);

  useFocusEffect(
    useCallback(() => {
      if (shouldRefresh) {
        handleRefresh();
        navigation.setParams({shouldRefresh: false});
      }
    }, [handleRefresh, navigation, shouldRefresh]),
  );

  const openPostReport = useCallback(targetPost => {
    setPostReportTarget(targetPost ?? null);
    postReportSheetRef.current?.present();
  }, []);

  const handleSelectPostReportReason = useCallback(reason => {
    setSelectedPostReportReason(prev => (prev === reason ? null : reason));
  }, []);

  const handlePostReportSubmit = useCallback(async () => {
    postReportSheetRef.current?.dismiss();

    if (!selectedPostReportReason) return;

    if (!postReportTarget?.id) {
      showToast('신고할 게시글을 찾지 못했습니다.');
      return;
    }

    const reportReason = REPORT_REASON_MAP[selectedPostReportReason];

    try {
      await report_create({
        reportTarget: 'POST',
        targetId: postReportTarget.id,
        reportReason,
        description: selectedPostReportReason,
      });
      showToast('신고가 접수되었습니다.');
      setPostReportTarget(null);
      setSelectedPostReportReason(null);
    } catch (error) {
      const code = error?.response?.data?.code;
      if (code === 27004) return showToast('이미 신고한 게시글입니다.');
      if (code === 27003) return showToast('신고 사유를 입력해주세요.');
      showToast('신고 접수에 실패했습니다.');
    }
  }, [postReportTarget?.id, selectedPostReportReason, showToast]);

  const renderItem = ({item}) => (
    <ReviewItem
      key={`store-post-${item.id}`}
      item={item}
      navigation={navigation}
      isOwner={false}
      isPostItem
      onReportPress={() => openPostReport(item)}
    />
  );

  const handleWriteReviewPress = () => {
    navigation.navigate('PostPhotoSelectScreen', {
      presetStore: {
        id: storeId,
        name: storename,
        address: storeAddress ?? '',
      },
      reviewFlow: true,
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
              data={[1, 2, 3]}
              keyExtractor={(_, index) => index.toString()}
              renderItem={() => <ReviewItemSkeleton />}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={postData}
              renderItem={renderItem}
              keyExtractor={item => item.id.toString()}
              keyboardDismissMode="none"
              keyboardShouldPersistTaps="always"
              onEndReached={loadMorePosts}
              onEndReachedThreshold={0.5}
              onRefresh={handleRefresh}
              refreshing={refreshing}
              contentContainerStyle={{paddingBottom: 0}}
              ListEmptyComponent={
                !postLoading && postData.length === 0 ? (
                  <View style={styles.footer}>
                    <CustomText style={styles.emptyText}>
                      아직 게시글이 없어요
                    </CustomText>
                  </View>
                ) : null
              }
              ListFooterComponent={
                <View style={styles.footer}>
                  {loading && !isEnd ? (
                    <CustomText style={styles.emptyText}>Loading...</CustomText>
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
      <Loading loading={loading || postLoading} />

      <PostReportBottomSheet
        sheetRef={postReportSheetRef}
        reasons={POST_REPORT_REASONS}
        selectedReason={selectedPostReportReason}
        onSelectReason={handleSelectPostReportReason}
        onSubmit={handlePostReportSubmit}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  footer: {
    marginVertical: 20,
    alignItems: 'center',
    height: 100,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
    color: '#c0c0c0',
  },
});

export default StoreReviewScreen;
