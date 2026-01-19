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
} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PostItem from '../../components/Post/PostItem';
import PostItemSkeleton from '../../components/Post/PostItemSkeleton';
import PostCommentSheet from '../../components/Post/PostCommentSheet';
import {
  CommentCreate,
  CommentDelete,
  CommentGetByPost,
  CommentGetByRootComment,
  CommentLike,
} from '../../api/commentApi';
import formatRelativeTime from '../../utils/formatRelativeTime';
import {useToast} from '../../context/ToastContext';
import Loading from '../../hooks/Loading';

const defaultProfile = require('../../assets/default_profile.png');
const defaultStoreImage = require('../../assets/default_store6.png');
const COMMENT_SORTS = {
  latest: ['id,DESC'],
  popular: ['likeCount,DESC', 'id,DESC'],
};

const LikeSavedPostDetailScreen = ({navigation, route}) => {
  const {
    posts: routePosts = [],
    initialIndex: routeInitialIndex = 0,
    userProfile,
  } = route.params || {};
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(
    userProfile?.imageuri ?? userProfile?.imgUrl ?? null,
  );
  const [currentUserNickname, setCurrentUserNickname] = useState(
    userProfile?.nickname ?? '',
  );
  const listRef = useRef(null);
  const {showToast} = useToast();
  const [showList, setShowList] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [listLaidOut, setListLaidOut] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(routeInitialIndex);
  const currentIndexRef = useRef(routeInitialIndex);
  const isSendingCommentRef = useRef(false);
  const screenWidth = Dimensions.get('window').width;
  const insets = useSafeAreaInsets();
  const listReadyRef = useRef(false);
  const previewReadyRef = useRef(false);
  const scrollRequestedRef = useRef(false);
  const pendingLastScrollRef = useRef(false);
  const contentMeasuredRef = useRef(false);
  const initialScrollDoneRef = useRef(false);
  const [contentMeasured, setContentMeasured] = useState(false);
  const [initialScrollDone, setInitialScrollDone] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [commentList, setCommentList] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentLikeState, setCommentLikeState] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalCount, setCommentTotalCount] = useState(null);
  const [commentSortKey, setCommentSortKey] = useState('latest');
  const [currentUserId, setCurrentUserId] = useState(
    userProfile?.id ??
      userProfile?.userId ??
      userProfile?.memberId ??
      userProfile?.writerId ??
      null,
  );
  const [pendingScrollReplyId, setPendingScrollReplyId] = useState(null);
  const commentSheetRef = useRef(null);
  const isLoadingMoreCommentsRef = useRef(false);
  const commentSheetSnapPoints = useMemo(() => {
    const topInset = insets.top === 0 ? 20 : insets.top;
    return ['70%', Math.max(0, Dimensions.get('window').height - topInset)];
  }, [insets.top]);

  const posts = useMemo(() => {
    if (!Array.isArray(routePosts)) {
      return [];
    }
    return routePosts;
  }, [routePosts]);
  const [savedPosts, setSavedPosts] = useState(posts);

  useEffect(() => {
    setSavedPosts(posts);
  }, [posts]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'user-profile-image-updated',
      payload => {
        setCurrentUserProfileImage(payload?.imageUrl ?? null);
        if (payload?.nickname !== undefined) {
          setCurrentUserNickname(payload?.nickname ?? '');
        }
      },
    );
    return () => sub.remove();
  }, []);

  const initialIndex = useMemo(() => {
    if (!savedPosts.length) return 0;
    const safeIndex = Number.isFinite(routeInitialIndex)
      ? routeInitialIndex
      : 0;
    return Math.min(Math.max(safeIndex, 0), savedPosts.length - 1);
  }, [routeInitialIndex, savedPosts.length]);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    currentIndexRef.current = initialIndex;
    initialScrollDoneRef.current = false;
    setInitialScrollDone(false);
  }, [initialIndex]);

  const fallbackImageUri = useMemo(
    () => Image.resolveAssetSource(defaultStoreImage).uri,
    [],
  );

  const feedItems = useMemo(
    () =>
      savedPosts.map((post, index) => {
        const postImages = Array.isArray(post?.postImgUrlList)
          ? post.postImgUrlList.filter(Boolean)
          : Array.isArray(post?.imgUrlList)
          ? post.imgUrlList.filter(Boolean)
          : [];
        const finalImages =
          postImages.length > 0 ? postImages : [fallbackImageUri];
        return {
          id: post?.id ?? `saved-${index}`,
          storeId: post?.storeId ?? post?.store?.id ?? null,
          profileImage:
            post?.writerImgUrl ?? post?.profileImgUrl ?? post?.profileImage,
          nickname: post?.writerNickname ?? post?.nickname ?? '',
          storeAddress: post?.address ?? post?.storeAddress ?? '',
          name: post?.storeName ?? '',
          content: post?.content ?? '',
          postImages: finalImages,
          likes: post?.likeCount ?? post?.likes ?? 0,
          comments: post?.commentCount ?? post?.comments ?? 0,
          shares: post?.shareCount ?? post?.shares ?? 0,
          isWriter: post?.isWriter ?? false,
          isLiked: post?.isLiked ?? false,
          rate: post?.rate ?? post?.rating ?? null,
          isSaved: post?.isSaved ?? true,
          isStoreDeleted: post?.isStoreDeleted ?? false,
          createdAt: post?.createdAt ?? null,
          place: post?.place ?? null,
        };
      }),
    [fallbackImageUri, savedPosts],
  );

  const skeletonItems = useMemo(
    () => Array.from({length: 2}, (_, index) => `skeleton-${index}`),
    [],
  );
  const showSkeleton = (!showList && feedItems.length > 0) || isTransitioning;

  useEffect(() => {
    const nextState = {};
    commentList.forEach(comment => {
      nextState[comment.id] = comment.isLiked ?? false;
      const previewReplies = Array.isArray(comment.previewReplies)
        ? comment.previewReplies
        : [];
      const replies = Array.isArray(comment.replies) ? comment.replies : [];
      [...previewReplies, ...replies].forEach(reply => {
        if (reply?.id) {
          nextState[reply.id] = reply.isLiked ?? false;
        }
      });
    });
    setCommentLikeState(nextState);
  }, [commentList]);

  const handleCommentLikeToggle = useCallback(async commentId => {
    if (!commentId) {
      return;
    }
    setCommentLikeState(prev => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
    try {
      await CommentLike(commentId);
    } catch (error) {
      setCommentLikeState(prev => ({
        ...prev,
        [commentId]: !prev[commentId],
      }));
    }
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
    (item, rootCommentId = null) => {
      const isMine = item.isWriter ?? item.isMine ?? false;
      return {
        id: String(item.id ?? ''),
        writerId:
          item.writerId ??
          item.writerUserId ??
          item.userId ??
          item.memberId ??
          null,
        taggedUserId:
          item.taggedUserId ??
          item.taggedUserID ??
          item.taggedUser ??
          null,
        taggedUserNickname: item.taggedUserNickname ?? null,
        author: item.writerNickname ?? item.author ?? '',
        profileImage:
          item.writerImgUrl ??
          item.profileImgUrl ??
          item.profileImage ??
          (isMine ? currentUserProfileImage : null),
        text: item.content ?? item.text ?? '',
        createdAt: formatRelativeTime(item.createdAt),
        likes: item.likeCount ?? item.likes ?? 0,
        isLiked: item.isLiked ?? false,
        isMine,
        isLocal: item.isLocal ?? false,
        replyCount: item.replyCount ?? 0,
        rootCommentId: rootCommentId ?? item.rootCommentId ?? null,
      };
    },
    [currentUserProfileImage],
  );

  const fetchComments = useCallback(
    async (targetPostId, sortKey) => {
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
          sort: COMMENT_SORTS[sortKey],
        });
        const items = Array.isArray(data?.content) ? data.content : [];
        const totalElements = Number.isFinite(data?.totalElements)
          ? data.totalElements
          : null;
        setCommentList(prev => {
          const prevMap = new Map(
            prev.map(comment => [String(comment.id), comment]),
          );
          return items.map(item => {
            const mapped = mapCommentItem(item);
            const prevItem = prevMap.get(mapped.id);
            if (!prevItem) {
              return mapped;
            }
            return {
              ...mapped,
              replies: prevItem.replies,
              previewReplies: prevItem.previewReplies,
              replyPage: prevItem.replyPage,
            };
          });
        });
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
          sort: COMMENT_SORTS[commentSortKey],
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
    [
      commentList.length,
      commentSortKey,
      commentTotalCount,
      mapCommentItem,
      selectedFeed?.id,
    ],
  );

  const handleRequestReplies = useCallback(
    async (rootCommentId, page = 0, reset = false) => {
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
          const baseReplies = reset || page === 0 ? [] : existingReplies;
          const mergeUnique = list => {
            const seen = new Set();
            return list.filter(reply => {
              const key = String(reply.id);
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          };
          const nextReplies = mergeUnique([...baseReplies, ...mappedReplies]);
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

  const updatePostCommentCount = useCallback((targetPostId, delta) => {
    if (!targetPostId || !delta) {
      return;
    }
    setSavedPosts(prev =>
      prev.map(item => {
        if (String(item?.id) !== String(targetPostId)) {
          return item;
        }
        const baseCount =
          item?.commentCount ?? item?.comments ?? item?.commentCnt ?? 0;
        const nextCount = Math.max(0, baseCount + delta);
        return {
          ...item,
          commentCount: nextCount,
          comments: nextCount,
        };
      }),
    );
    setSelectedFeed(prev => {
      if (!prev || String(prev?.id) !== String(targetPostId)) {
        return prev;
      }
      const baseCount =
        prev?.commentCount ?? prev?.comments ?? prev?.commentCnt ?? 0;
      const nextCount = Math.max(0, baseCount + delta);
      return {
        ...prev,
        commentCount: nextCount,
        comments: nextCount,
      };
    });
  }, []);

  const handleSendComment = useCallback(
    async payload => {
      const targetPostId = selectedFeed?.id;
      const content = payload?.content?.trim();
      const taggedUserId = payload?.taggedUserId ?? null;
      const taggedUserNickname = payload?.taggedUserNickname ?? null;
      if (!targetPostId || !content) {
        return;
      }
      if (isSendingCommentRef.current) {
        return;
      }
      isSendingCommentRef.current = true;
      const rootCommentId = payload?.rootCommentId ?? null;
      const isExpandedTarget = Boolean(payload?.isExpandedTarget);
      try {
        const result = await CommentCreate({
          postId: targetPostId,
          content,
          rootCommentId,
          taggedUserId,
        });
        const createdId = result?.commentId;
        if (rootCommentId) {
        const fallbackReply = {
          id: createdId ?? `temp-${Date.now()}`,
          content,
          createdAt: new Date().toISOString(),
          writerImgUrl: currentUserProfileImage ?? null,
          writerNickname: currentUserNickname || '나',
          writerId: currentUserId ?? null,
          taggedUserId,
          taggedUserNickname,
          isLocal: true,
          shouldShowMention:
            taggedUserNickname &&
            currentUserNickname &&
            taggedUserNickname !== currentUserNickname,
          isWriter: true,
        };
          const mappedReply = mapCommentItem(fallbackReply, rootCommentId);
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
            prev.map(comment => {
              if (String(comment.id) !== String(rootCommentId)) {
                return comment;
              }
              const existingReplies = Array.isArray(comment.replies)
                ? comment.replies
                : [];
              const nextReplies = isExpandedTarget
                ? mergeUnique([...existingReplies, mappedReply])
                : existingReplies;
              return {
                ...comment,
                replies: nextReplies,
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
              };
            }),
          );
          setPendingScrollReplyId(mappedReply.id);
          updatePostCommentCount(targetPostId, 1);
          return;
        } else {
        const fallbackComment = {
          id: createdId ?? `temp-${Date.now()}`,
          content,
          createdAt: new Date().toISOString(),
          writerImgUrl: currentUserProfileImage ?? null,
          writerNickname: currentUserNickname || '나',
          writerId: currentUserId ?? null,
          taggedUserId: null,
          taggedUserNickname: null,
          isWriter: true,
        };
          const mappedComment = mapCommentItem(fallbackComment);
          setCommentList(prev => {
            const filtered = prev.filter(
              commentItem =>
                String(commentItem.id) !== String(mappedComment.id),
            );
            return [mappedComment, ...filtered];
          });
          setCommentTotalCount(prev => (prev === null ? null : prev + 1));
          updatePostCommentCount(targetPostId, 1);
        }
      } finally {
        isSendingCommentRef.current = false;
      }
    },
    [
      fetchComments,
      mapCommentItem,
      selectedFeed?.id,
      currentUserId,
      currentUserNickname,
      currentUserProfileImage,
      updatePostCommentCount,
    ],
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
        updatePostCommentCount(targetPostId, -1);
      } else {
        fetchComments(targetPostId, commentSortKey);
        setCommentTotalCount(prev =>
          prev === null ? null : Math.max(0, prev - 1),
        );
        updatePostCommentCount(targetPostId, -1);
      }
      showToast('삭제가 완료되었습니다.');
    },
    [
      fetchComments,
      handleRequestReplies,
      selectedFeed?.id,
      showToast,
      updatePostCommentCount,
    ],
  );

  useEffect(() => {
    if (!selectedFeed?.id) {
      setCommentList([]);
      setCommentPage(0);
      setCommentTotalCount(0);
      setIsLoadingComments(false);
      return;
    }
    setCommentPage(0);
    setCommentTotalCount(null);
    fetchComments(selectedFeed.id, commentSortKey);
  }, [fetchComments, selectedFeed?.id]);

  const handleChangeCommentSort = useCallback(
    nextSortKey => {
      const targetPostId = selectedFeed?.id;
      setCommentSortKey(nextSortKey);
      if (!targetPostId) {
        return;
      }
      setCommentPage(0);
      setCommentTotalCount(null);
      fetchComments(targetPostId, nextSortKey);
    },
    [fetchComments, selectedFeed?.id],
  );

  const handleOpenCommentSheet = useCallback(feed => {
    setSelectedFeed(feed);
    requestAnimationFrame(() => {
      commentSheetRef.current?.present();
    });
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    DeviceEventEmitter.emit('feed-more-menu-close');
  }, []);

  const handleBackPress = useCallback(() => {
    DeviceEventEmitter.emit('like-screen-return-tab', {tabKey: 'saved'});
    navigation.goBack();
  }, [navigation]);

  const handleSavedChange = useCallback((postItem, nextSaved) => {
    const targetId = postItem?.id;
    if (!targetId) {
      return;
    }
    setSavedPosts(prev =>
      prev.map(item =>
        String(item?.id) === String(targetId)
          ? {...item, isSaved: nextSaved}
          : item,
      ),
    );
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
    if (feedItems.length !== 1 || !listLaidOut) {
      return;
    }
    if (!showList) {
      setShowList(true);
    }
    if (!contentMeasuredRef.current) {
      contentMeasuredRef.current = true;
      setContentMeasured(true);
    }
    if (!initialScrollDoneRef.current) {
      initialScrollDoneRef.current = true;
      setInitialScrollDone(true);
    }
    if (isTransitioning) {
      setIsTransitioning(false);
    }
  }, [feedItems.length, isTransitioning, listLaidOut, showList]);

  useEffect(() => {
    if (!showList || !listLaidOut) {
      return;
    }
    ensureLastItemPinned();
  }, [ensureLastItemPinned, listLaidOut, showList]);

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

  return (
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable
            onPress={handleBackPress}
            hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}
            style={styles.headerSide}>
            <Ionicons name="arrow-back-outline" size={23} color="#333" />
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
              onSavedChange={handleSavedChange}
              isWriter
              isCentered
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
          initialNumToRender={5}
          maxToRenderPerBatch={5}
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
              onSavedChange={handleSavedChange}
              isWriter
              isCentered={index === currentIndex}
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
          commentSortKey={commentSortKey}
          onChangeCommentSort={handleChangeCommentSort}
          defaultProfile={defaultProfile}
          commentLikeState={commentLikeState}
          onToggleLike={handleCommentLikeToggle}
        formatLikeCount={formatLikeCount}
        commentInput={commentInput}
        onChangeCommentInput={setCommentInput}
        currentUserProfileImage={currentUserProfileImage}
        currentUserNickname={currentUserNickname}
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

export default LikeSavedPostDetailScreen;
