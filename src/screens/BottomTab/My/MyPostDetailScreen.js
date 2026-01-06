import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  DeviceEventEmitter,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useCustomAlert from '../../../hooks/useCustomAlert';
import PostItem from '../../../components/Post/PostItem';
import PostItemSkeleton from '../../../components/Post/PostItemSkeleton';
import PostCommentSheet from '../../../components/Post/PostCommentSheet';
import {
  CommentCreate,
  CommentDelete,
  CommentGetByPost,
  CommentGetByRootComment,
} from '../../../api/commentApi';
import formatRelativeTime from '../../../utils/formatRelativeTime';
import {useToast} from '../../../context/ToastContext';
import Loading from '../../../hooks/Loading';
import {PostDelete} from '../../../api/reviewApi';

const defaultProfile = require('../../../assets/default_profile.png');

const MyPostDetailScreen = ({navigation, route}) => {
  const {
    posts: routePosts,
    review: routeReview,
    userProfile,
    initialIndex: routeInitialIndex = 0,
    initialImageRatio: routeInitialImageRatio,
  } = route.params || {};
  const {showAlert, AlertComponent} = useCustomAlert();
  const listRef = useRef(null);
  const [showList, setShowList] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [listLaidOut, setListLaidOut] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(routeInitialIndex);
  const currentIndexRef = useRef(routeInitialIndex);
  const {height: windowHeight} = useWindowDimensions();
  const screenWidth = Dimensions.get('window').width;
  const insets = useSafeAreaInsets();
  const {showToast} = useToast();
  const listReadyRef = useRef(false);
  const previewReadyRef = useRef(false);
  const scrollRequestedRef = useRef(false);
  const pendingLastScrollRef = useRef(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isSendingCommentRef = useRef(false);
  const contentMeasuredRef = useRef(false);
  const initialScrollDoneRef = useRef(false);
  const initialAlignDoneRef = useRef(false);
  const [contentMeasured, setContentMeasured] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentLikeState, setCommentLikeState] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalCount, setCommentTotalCount] = useState(null);
  const [pendingScrollReplyId, setPendingScrollReplyId] = useState(null);
  const commentSheetRef = useRef(null);
  const isLoadingMoreCommentsRef = useRef(false);
  const [imageRatioMap, setImageRatioMap] = useState({});
  const commentSheetSnapPoints = useMemo(() => {
    const topInset = insets.top === 0 ? 20 : insets.top;
    return ['70%', Math.max(0, windowHeight - topInset)];
  }, [insets.top, windowHeight]);

  const goToMyProfile = useCallback(() => {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainBtmbar',
          state: {
            index: 0,
            routes: [
              {
                name: 'MyStack',
                state: {index: 0, routes: [{name: 'MyScreen'}]},
              },
            ],
          },
        },
      ],
    });
  }, [navigation]);

  const posts = useMemo(() => {
    if (Array.isArray(routePosts) && routePosts.length > 0) {
      return routePosts;
    }
    if (routeReview) {
      return [routeReview];
    }
    return [];
  }, [routePosts, routeReview]);

  const initialIndex = useMemo(() => {
    if (!posts.length) return 0;
    const safeIndex = Number.isFinite(routeInitialIndex)
      ? routeInitialIndex
      : 0;
    return Math.min(Math.max(safeIndex, 0), posts.length - 1);
  }, [posts.length, routeInitialIndex]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    currentIndexRef.current = initialIndex;
    initialScrollDoneRef.current = false;
    initialAlignDoneRef.current = false;
    setInitialScrollDone(false);
  }, [initialIndex]);

  useEffect(() => {
    let active = true;
    const initialRatio =
      Number.isFinite(routeInitialImageRatio) && routeInitialImageRatio > 0
        ? routeInitialImageRatio
        : null;
    setImageRatioMap(() => {
      const next = {};
      if (initialRatio !== null) {
        next[initialIndex] = initialRatio;
      }
      return next;
    });

    posts.forEach((review, index) => {
      const imageUrl = review?.postImgUrlList?.[0] || review?.imgUrlList?.[0];
      if (!imageUrl) {
        return;
      }
      if (index === initialIndex && initialRatio !== null) {
        return;
      }
      Image.getSize(
        imageUrl,
        (width, height) => {
          if (!active || !width || !height) {
            return;
          }
          const ratio = width / height;
          if (ratio <= 0) {
            return;
          }
          setImageRatioMap(prev => {
            if (prev[index] === ratio) {
              return prev;
            }
            return {...prev, [index]: ratio};
          });
        },
        () => {},
      );
    });

    return () => {
      active = false;
    };
  }, [initialIndex, posts, routeInitialImageRatio]);

  const feedItems = useMemo(
    () =>
      posts.map((review, index) => ({
        id: review?.id ?? `review-${index}`,
        storeId: review?.storeId ?? review?.store?.id,
        shareLink: review?.shareLink,
        profileImage: userProfile?.imageuri,
        nickname: userProfile?.nickname || '',
        storeAddress:
          review?.storeAddress || review?.address || review?.storeName || '',
        name: review?.storeName || '',
        content: review?.content || '',
        postImages: Array.isArray(review?.postImgUrlList)
          ? review.postImgUrlList
          : Array.isArray(review?.imgUrlList)
          ? review.imgUrlList
          : [],
        likes: review?.likes ?? review?.likeCount ?? 0,
        comments: 0,
        shares: review?.shares ?? 0,
        isWriter: true,
        __sourceReview: review,
      })),
    [posts, userProfile?.imageuri, userProfile?.nickname],
  );
  const skeletonItems = useMemo(
    () => Array.from({length: 2}, (_, index) => `skeleton-${index}`),
    [],
  );
  const showSkeleton = (!showList && feedItems.length > 0) || isTransitioning;
  const initialRenderCount = useMemo(
    () => Math.min(feedItems.length, Math.max(5, initialIndex + 2)),
    [feedItems.length, initialIndex],
  );

  useEffect(() => {
    const nextState = {};
    commentList.forEach(comment => {
      nextState[comment.id] = false;
    });
    setCommentLikeState(nextState);
  }, [commentList]);

  const handleCommentLikeToggle = useCallback(commentId => {
    setCommentLikeState(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }, []);

  const formatLikeCount = useCallback(value => {
    if (!Number.isFinite(value)) {
      return '0';
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return `${value}`;
  }, []);

  const mapCommentItem = useCallback(
    (item, rootCommentId = null) => ({
      id: String(item.id ?? ''),
      author: item.writerNickname ?? item.author ?? '',
      profileImage: item.writerImgUrl ?? item.profileImage ?? null,
      text: item.content ?? item.text ?? '',
      createdAt: formatRelativeTime(item.createdAt),
      likes: item.likes ?? 0,
      isMine: item.isWriter ?? item.isMine ?? false,
      replyCount: item.replyCount ?? 0,
      rootCommentId: rootCommentId ?? item.rootCommentId ?? null,
    }),
    [],
  );

  const fetchComments = useCallback(
    async targetPostId => {
      if (!targetPostId) {
        setCommentList([]);
        setCommentPage(0);
        setCommentTotalCount(null);
        setIsLoadingComments(false);
        return;
      }
      setIsLoadingComments(true);
      try {
        const data = await CommentGetByPost({
          postId: targetPostId,
          page: 0,
          size: 20,
        });
        const items = Array.isArray(data?.content) ? data.content : [];
        const totalElements = Number.isFinite(data?.totalElements)
          ? data.totalElements
          : null;
        setCommentList(items.map(item => mapCommentItem(item)));
        setCommentPage(0);
        setCommentTotalCount(totalElements);
      } finally {
        setIsLoadingComments(false);
      }
    },
    [mapCommentItem],
  );

  const handleRequestMoreComments = useCallback(
    async nextPage => {
      const targetPostId = selectedFeed?.id;
      if (!targetPostId) return;
      if (isLoadingMoreCommentsRef.current) return;
      if (
        commentTotalCount !== null &&
        commentList.length >= commentTotalCount
      ) {
        return;
      }
      isLoadingMoreCommentsRef.current = true;
      try {
        const data = await CommentGetByPost({
          postId: targetPostId,
          page: nextPage,
          size: 20,
        });
        const items = Array.isArray(data?.content) ? data.content : [];
        const mapped = items.map(item => mapCommentItem(item));
        const totalElements = Number.isFinite(data?.totalElements)
          ? data.totalElements
          : commentTotalCount;
        setCommentList(prev => {
          const merged = [...prev, ...mapped];
          return Array.from(
            new Map(merged.map(item => [item.id, item])).values(),
          );
        });
        setCommentPage(nextPage);
        setCommentTotalCount(totalElements);
      } finally {
        isLoadingMoreCommentsRef.current = false;
      }
    },
    [commentList.length, commentTotalCount, mapCommentItem, selectedFeed?.id],
  );

  const handleRequestReplies = useCallback(
    async (rootCommentId, page = 0) => {
      if (!rootCommentId) return;
      const data = await CommentGetByRootComment({
        rootCommentId,
        page,
        size: 10,
      });
      const items = Array.isArray(data?.content) ? data.content : [];
      const mappedReplies = items.map(item =>
        mapCommentItem(item, rootCommentId),
      );
      const totalElements = Number.isFinite(data?.totalElements)
        ? data.totalElements
        : null;
      setCommentList(prev =>
        prev.map(comment => {
          if (String(comment.id) !== String(rootCommentId)) {
            return comment;
          }
          const previewReplies = Array.isArray(comment.previewReplies)
            ? comment.previewReplies
            : [];
          const existingReplies = Array.isArray(comment.replies)
            ? comment.replies
            : [];
          const mergeUnique = list => {
            const seen = new Set();
            return list.filter(reply => {
              const key = String(reply.id);
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          };
          const nextReplies =
            page === 0
              ? mergeUnique([
                  ...previewReplies,
                  ...existingReplies,
                  ...mappedReplies,
                ])
              : mergeUnique([...existingReplies, ...mappedReplies]);
          const nextReplyCount = Number.isFinite(totalElements)
            ? Math.max(totalElements, nextReplies.length)
            : Number.isFinite(comment.replyCount)
            ? Math.max(comment.replyCount, nextReplies.length)
            : nextReplies.length;
          return {
            ...comment,
            replies: nextReplies,
            replyCount: nextReplyCount,
            replyPage: page,
            previewReplies: comment.previewReplies ?? [],
          };
        }),
      );
    },
    [mapCommentItem],
  );

  const handleSendComment = useCallback(
    async payload => {
      const targetPostId = selectedFeed?.id;
      const content = payload?.content?.trim();
      if (!targetPostId || !content) {
        return;
      }
      if (isSendingCommentRef.current) {
        return;
      }
      isSendingCommentRef.current = true;
      const rootCommentId = payload?.rootCommentId ?? null;
      try {
        const result = await CommentCreate({
          postId: targetPostId,
          content,
          rootCommentId,
        });
        if (rootCommentId) {
          const fallbackReply = {
            id: `temp-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            writerNickname: userProfile?.nickname || '나',
            isWriter: true,
          };
          const mappedReply = mapCommentItem(
            result ?? fallbackReply,
            rootCommentId,
          );
          const mergeUnique = list => {
            const seen = new Set();
            return list.filter(reply => {
              const key = String(reply.id);
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          };
          setCommentList(prev =>
            prev.map(comment =>
              String(comment.id) === String(rootCommentId)
                ? {
                    ...comment,
                    replies: mergeUnique([
                      ...(Array.isArray(comment.replies)
                        ? comment.replies
                        : []),
                      mappedReply,
                    ]),
                    previewReplies: mergeUnique([
                      mappedReply,
                      ...(Array.isArray(comment.previewReplies)
                        ? comment.previewReplies
                        : []),
                    ]),
                    replyCount: Math.max(
                      Number.isFinite(comment.replyCount)
                        ? comment.replyCount + 1
                        : 1,
                      1,
                    ),
                  }
                : comment,
            ),
          );
          setPendingScrollReplyId(mappedReply.id);
          return;
        } else {
          const fallbackComment = {
            id: `temp-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            writerNickname: userProfile?.nickname || '나',
            isWriter: true,
          };
          const mappedComment = mapCommentItem(result ?? fallbackComment);
          setCommentList(prev => {
            const filtered = prev.filter(
              commentItem =>
                String(commentItem.id) !== String(mappedComment.id),
            );
            return [...filtered, mappedComment];
          });
          setCommentTotalCount(prev => (prev === null ? null : prev + 1));
        }
      } finally {
        isSendingCommentRef.current = false;
      }
    },
    [fetchComments, mapCommentItem, selectedFeed?.id, userProfile?.nickname],
  );

  const handleDeleteComment = useCallback(
    async targetComment => {
      const targetPostId = selectedFeed?.id;
      if (!targetComment?.id || !targetPostId) {
        return;
      }
      await CommentDelete(targetComment.id);
      if (targetComment.rootCommentId) {
        handleRequestReplies(targetComment.rootCommentId);
      } else {
        fetchComments(targetPostId);
        setCommentTotalCount(prev =>
          prev === null ? null : Math.max(0, prev - 1),
        );
      }
      showToast('삭제가 완료되었습니다.');
    },
    [fetchComments, handleRequestReplies, selectedFeed?.id, showToast],
  );

  useEffect(() => {
    if (!selectedFeed?.id) {
      setCommentList([]);
      setCommentPage(0);
      setCommentTotalCount(0);
      setIsLoadingComments(false);
      return;
    }
    fetchComments(selectedFeed.id);
  }, [fetchComments, selectedFeed?.id]);

  const handleOpenCommentSheet = useCallback(feed => {
    setSelectedFeed(feed);
    requestAnimationFrame(() => {
      commentSheetRef.current?.present();
    });
  }, []);

  const handleDeleteConfirm = useCallback(
    async item => {
      if (!item?.id || isDeleting) {
        return;
      }
      setIsDeleting(true);
      try {
        await PostDelete(item.id);
        goToMyProfile();
      } catch (error) {
        showAlert?.({
          title: '게시글 삭제 실패',
          message: '게시글 삭제에 실패했습니다.',
          type: 'ok',
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [goToMyProfile, isDeleting, showAlert],
  );

  const handleEditPress = useCallback(
    item => {
      const review = item?.__sourceReview;
      if (!review) return;
      navigation.navigate('MyPostEditScreen', {
        review,
        userProfile,
        returnTo: 'MyPostDetailScreen',
      });
    },
    [navigation, userProfile],
  );

  const handleDeletePress = useCallback(
    item => {
      if (!item?.__sourceReview) return;
      handleDeleteConfirm(item);
    },
    [handleDeleteConfirm],
  );

  const handleScrollBeginDrag = useCallback(() => {
    DeviceEventEmitter.emit('feed-more-menu-close');
  }, []);

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    const first = viewableItems?.[0];
    if (first?.index !== undefined) {
      if (currentIndexRef.current !== first.index) {
        currentIndexRef.current = first.index;
        setCurrentIndex(first.index);
      }
    }
    if (!initialScrollDoneRef.current) {
      const targetIndex = initialIndex;
      const hasTarget = viewableItems?.some(
        viewable => viewable?.index === targetIndex,
      );
      if (hasTarget) {
        initialScrollDoneRef.current = true;
        setInitialScrollDone(true);
      }
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 60,
  }).current;
  const isLastIndex = currentIndex === feedItems.length - 1;

  const handleScrollToIndexFailed = useCallback(
    info => {
      const wait = new Promise(resolve => setTimeout(resolve, 120));
      wait.then(() => {
        if (!listRef.current) return;
        const viewPosition = info.index === feedItems.length - 1 ? 1 : 0;
        const fallback =
          typeof info.averageItemLength === 'number' &&
          info.averageItemLength > 0
            ? info.averageItemLength
            : screenWidth;
        listRef.current.scrollToOffset({
          offset: fallback * info.index,
          animated: false,
        });
        setTimeout(() => {
          if (!listRef.current) return;
          listRef.current.scrollToIndex({
            index: info.index,
            animated: false,
            viewPosition,
          });
        }, 80);
      });
    },
    [feedItems.length, screenWidth],
  );

  const requestShowList = useCallback(() => {
    if (showList) {
      return;
    }
    setShowList(true);
  }, [showList]);

  const scrollToInitial = useCallback(() => {
    if (scrollRequestedRef.current) {
      return;
    }
    scrollRequestedRef.current = true;
    if (!listRef.current) {
      requestShowList();
      return;
    }
    if (initialIndex > 0) {
      const viewPosition = initialIndex === feedItems.length - 1 ? 1 : 0;
      listRef.current.scrollToIndex({
        index: initialIndex,
        animated: false,
        viewPosition,
      });
    }
    requestShowList();
  }, [feedItems.length, initialIndex, requestShowList]);

  const tryStartList = useCallback(() => {
    if (showList) {
      return;
    }
    if (listReadyRef.current && previewReadyRef.current) {
      scrollToInitial();
    }
  }, [scrollToInitial, showList]);

  useEffect(() => {
    setShowList(false);
    setIsTransitioning(true);
    setListLaidOut(false);
    listReadyRef.current = false;
    previewReadyRef.current = false;
    scrollRequestedRef.current = false;
    contentMeasuredRef.current = false;
    setContentMeasured(false);
    initialScrollDoneRef.current = false;
    initialAlignDoneRef.current = false;
    setInitialScrollDone(false);
  }, [feedItems.length, initialIndex]);

  useEffect(() => {
    if (!feedItems.length) {
      setShowList(true);
      setIsTransitioning(false);
    }
  }, [feedItems.length]);

  const handleSelectedLoaded = useCallback(() => {
    previewReadyRef.current = true;
    tryStartList();
  }, [tryStartList]);

  const handleSelectedLayout = useCallback(() => {
    previewReadyRef.current = true;
    tryStartList();
  }, [tryStartList]);

  const handleListLayout = useCallback(() => {
    listReadyRef.current = true;
    setListLaidOut(true);
    tryStartList();
  }, [tryStartList]);

  const ensureLastItemPinned = useCallback(() => {
    if (!listRef.current || !feedItems.length) {
      return;
    }
    if (currentIndex !== feedItems.length - 1) {
      return;
    }
    if (pendingLastScrollRef.current) {
      return;
    }
    pendingLastScrollRef.current = true;
    requestAnimationFrame(() => {
      if (!listRef.current) {
        pendingLastScrollRef.current = false;
        return;
      }
      listRef.current.scrollToIndex({
        index: currentIndex,
        animated: false,
        viewPosition: 1,
      });
      pendingLastScrollRef.current = false;
    });
  }, [currentIndex, feedItems.length]);

  const alignInitialIndex = useCallback(() => {
    if (!listRef.current || !feedItems.length) {
      return;
    }
    if (initialAlignDoneRef.current) {
      return;
    }
    initialAlignDoneRef.current = true;
    if (initialIndex <= 0) {
      return;
    }
    const viewPosition = initialIndex === feedItems.length - 1 ? 1 : 0;
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
        viewPosition,
      });
    });
  }, [feedItems.length, initialIndex]);

  useEffect(() => {
    if (!showList || !listLaidOut) {
      return;
    }
    ensureLastItemPinned();
  }, [ensureLastItemPinned, listLaidOut, showList]);

  const handleContentSizeChange = useCallback(() => {
    if (!showList || !listLaidOut) {
      return;
    }
    if (!contentMeasuredRef.current) {
      contentMeasuredRef.current = true;
      setContentMeasured(true);
    }
    ensureLastItemPinned();
  }, [ensureLastItemPinned, listLaidOut, showList]);

  useEffect(() => {
    if (!showList || !listLaidOut || !contentMeasured || !initialScrollDone) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      setIsTransitioning(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [contentMeasured, initialScrollDone, listLaidOut, showList]);

  useEffect(() => {
    if (!showList || !listLaidOut || !initialScrollDone) {
      return;
    }
    alignInitialIndex();
  }, [alignInitialIndex, initialScrollDone, listLaidOut, showList]);

  useEffect(() => {
    if (!showList || !listLaidOut) {
      return;
    }
    const timer = setTimeout(() => {
      if (isTransitioning) {
        setIsTransitioning(false);
      }
      if (!initialScrollDoneRef.current) {
        initialScrollDoneRef.current = true;
        setInitialScrollDone(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [isTransitioning, listLaidOut, showList]);

  useEffect(() => {
    if (showList || !feedItems.length) return;
    const timer = setTimeout(() => {
      if (!previewReadyRef.current) {
        previewReadyRef.current = true;
        tryStartList();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [feedItems.length, showList, tryStartList]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}
            style={styles.headerSide}>
            <Ionicons
              name="arrow-back-outline"
              size={23}
              color="#333"
            />
          </Pressable>
          <Text style={styles.headerTitle}>게시글</Text>
          <View style={styles.headerSide} />
        </View>
      </SafeAreaView>
      <View style={styles.content}>
        {!showList && feedItems.length ? (
          <View onLayout={handleSelectedLayout}>
            <PostItem
              item={feedItems[initialIndex]}
              onCommentPress={handleOpenCommentSheet}
              onEditPress={handleEditPress}
              onDeletePress={handleDeletePress}
              isWriter
              isCentered
              initialImageRatio={imageRatioMap[initialIndex]}
              onPrimaryImageLoad={handleSelectedLoaded}
            />
          </View>
        ) : null}
        <FlatList
          ref={listRef}
          data={feedItems}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : `post-${index}`
          }
          initialNumToRender={initialRenderCount}
          maxToRenderPerBatch={initialRenderCount}
          windowSize={9}
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={handleScrollBeginDrag}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          onScrollToIndexFailed={handleScrollToIndexFailed}
          onLayout={handleListLayout}
          onContentSizeChange={handleContentSizeChange}
          renderItem={({item, index}) => (
            <PostItem
              item={item}
              onCommentPress={handleOpenCommentSheet}
              onEditPress={handleEditPress}
              onDeletePress={handleDeletePress}
              isWriter
              isCentered={index === currentIndex}
              initialImageRatio={imageRatioMap[index]}
            />
          )}
          contentContainerStyle={[
            styles.feedContent,
            {
              paddingBottom: isLastIndex
                ? insets.bottom
                : Math.max(insets.bottom, 24),
            },
          ]}
          style={showList ? null : styles.listHidden}
          pointerEvents={showList ? 'auto' : 'none'}
        />

        <PostCommentSheet
          ref={commentSheetRef}
          snapPoints={commentSheetSnapPoints}
          onChange={() => {}}
          onDismiss={() => {
            setSelectedFeed(null);
          }}
          insets={insets}
          commentList={commentList}
          defaultProfile={defaultProfile}
          commentLikeState={commentLikeState}
          onToggleLike={handleCommentLikeToggle}
          formatLikeCount={formatLikeCount}
          commentInput={commentInput}
          onChangeCommentInput={setCommentInput}
          onPressSend={handleSendComment}
          onDeleteComment={handleDeleteComment}
          onRequestReplies={handleRequestReplies}
          onRequestMoreComments={handleRequestMoreComments}
          commentTotalCount={commentTotalCount}
          commentPage={commentPage}
          isPostWriter={selectedFeed?.isWriter ?? false}
          isLoadingComments={isLoadingComments}
          pendingScrollToId={pendingScrollReplyId}
        />

        {showSkeleton ? (
          <View style={styles.skeletonOverlay} pointerEvents="auto">
            {skeletonItems.map(key => (
              <PostItemSkeleton key={key} />
            ))}
          </View>
        ) : null}
        <Loading loading={showSkeleton} />
        <Loading loading={isDeleting} />
        <AlertComponent />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    backgroundColor: '#fff',
  },
  header: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  headerSide: {
    width: 32,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },
  content: {
    flex: 1,
  },
  feedContent: {
    paddingTop: 10,
  },
  listHidden: {
    opacity: 0,
  },
  skeletonOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
});

export default MyPostDetailScreen;
