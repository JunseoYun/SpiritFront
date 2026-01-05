import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import PostItem from '../../components/Post/PostItem';
import PostCommentSheet from '../../components/Post/PostCommentSheet';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import {PostGetById} from '../../api/postApi';
import {
  CommentCreate,
  CommentDelete,
  CommentGetByPost,
  CommentGetByRootComment,
} from '../../api/commentApi';
import {Userdataget} from '../../api/userApi';
import Loading from '../../hooks/Loading';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {HomeEmptyIcon, HomeHeaderIcon} from '../../assets/svg/HomeTabIcon';
import formatRelativeTime from '../../utils/formatRelativeTime';
import {useToast} from '../../context/ToastContext';

const defaultProfile = require('../../assets/default_profile.png');

const PostDetailScreen = ({navigation, route}) => {
  const {postId, item: routeItem} = route.params ?? {};
  const [postItem, setPostItem] = useState(routeItem ?? null);
  const [loading, setLoading] = useState(Boolean(postId));
  const insets = useSafeAreaInsets();
  const {showToast} = useToast();
  const {height: windowHeight} = useWindowDimensions();
  const commentSheetRef = useRef(null);
  const isSendingCommentRef = useRef(false);
  const commentSheetSnapPoints = useMemo(() => {
    const topInset = insets.top === 0 ? 20 : insets.top;
    return ['70%', Math.max(0, windowHeight - topInset)];
  }, [insets.top, windowHeight]);
  const [commentList, setCommentList] = useState([]);
  const [commentLikeState, setCommentLikeState] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalCount, setCommentTotalCount] = useState(null);
  const [currentUserNickname, setCurrentUserNickname] = useState('');
  const isLoadingMoreCommentsRef = useRef(false);

  useEffect(() => {
    let isMounted = true;
    const fetchUserNickname = async () => {
      try {
        const data = await Userdataget();
        if (isMounted) {
          setCurrentUserNickname(data?.nickname ?? '');
        }
      } catch (error) {}
    };
    fetchUserNickname();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    if (!postId) {
      return () => {
        isMounted = false;
      };
    }

    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await PostGetById(postId);
        if (!isMounted || !data) return;
        const mapped = {
          ...data,
          id: String(data.id ?? postId),
          profileImage:
            data.writerImgUrl ??
            data.profileImgUrl ??
            data.profileImage ??
            null,
          nickname: data.writerNickname ?? data.nickname ?? '게스트',
          name: data.storeName ?? data.name ?? null,
          storeAddress: data.storeAddress ?? data.address ?? null,
          postImages: Array.isArray(data.postImgUrlList)
            ? data.postImgUrlList
            : data.postImages ?? [],
          content: data.content ?? '',
          rate:
            data.rate ??
            data.rating ??
            data.storeRate ??
            data.storeRating ??
            null,
          storeId:
            data.storeId ?? data.store?.id ?? data.store?.storeId ?? null,
          shares: data.shares ?? 0,
          likes: data.likes ?? 0,
          comments: data.comments ?? 0,
        };
        setPostItem(prev => ({...prev, ...mapped}));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [postId]);

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
        return;
      }
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
    },
    [mapCommentItem],
  );

  const handleRequestMoreComments = useCallback(
    async nextPage => {
      const targetPostId = postItem?.id ?? postId;
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
    [
      commentList.length,
      commentTotalCount,
      mapCommentItem,
      postId,
      postItem?.id,
    ],
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
          const nextReplies =
            page === 0
              ? mappedReplies
              : [
                  ...(comment.replies ?? []),
                  ...mappedReplies.filter(
                    reply =>
                      !(comment.replies ?? []).some(
                        existing => String(existing.id) === String(reply.id),
                      ),
                  ),
                ];
          return {
            ...comment,
            replies: nextReplies,
            replyCount:
              totalElements ??
              (Number.isFinite(comment.replyCount)
                ? comment.replyCount
                : nextReplies.length),
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
      const targetPostId = postItem?.id ?? postId;
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
            writerNickname: currentUserNickname || '나',
            isWriter: true,
          };
          const mappedReply = mapCommentItem(
            result ?? fallbackReply,
            rootCommentId,
          );
          setCommentList(prev =>
            prev.map(comment =>
              String(comment.id) === String(rootCommentId)
                ? {
                    ...comment,
                    replyCount: Number.isFinite(comment.replyCount)
                      ? comment.replyCount + 1
                      : 1,
                    previewReplies: [mappedReply],
                  }
                : comment,
            ),
          );
          return;
        } else {
          const fallbackComment = {
            id: `temp-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            writerNickname: currentUserNickname || '나',
            isWriter: true,
          };
          const mappedComment = mapCommentItem(result ?? fallbackComment);
          setCommentList(prev => {
            const filtered = prev.filter(
              commentItem => String(commentItem.id) !== String(mappedComment.id),
            );
            return [...filtered, mappedComment];
          });
          setCommentTotalCount(prev => (prev === null ? null : prev + 1));
        }
      } finally {
        isSendingCommentRef.current = false;
      }
    },
    [
      currentUserNickname,
      fetchComments,
      mapCommentItem,
      postId,
      postItem?.id,
    ],
  );

  const handleDeleteComment = useCallback(
    async targetComment => {
      const targetPostId = postItem?.id ?? postId;
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
    [fetchComments, handleRequestReplies, postId, postItem?.id, showToast],
  );
  useEffect(() => {
    const targetPostId = postItem?.id ?? postId;
    if (!targetPostId) {
      setCommentList([]);
      return;
    }
    fetchComments(targetPostId);
  }, [fetchComments, postId, postItem?.id]);

  const handleOpenCommentSheet = useCallback(() => {
    commentSheetRef.current?.present();
  }, []);

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + (Platform.OS === 'android' ? 17 : 7),
          paddingBottom: insets.bottom,
        },
      ]}>
      <View style={styles.header}>
        <Pressable
          style={styles.headerSide}
          hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={24} color="#333" />
        </Pressable>
        <CustomText style={styles.headerTitle}>게시글</CustomText>
        <View style={styles.headerSide} />
      </View>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}>
        {postItem && (
          <PostItem
            item={postItem}
            onCommentPress={handleOpenCommentSheet}
            showRatingInTitleCycle
            hideStoreBadge
          />
        )}

        <Loading loading={loading} />
      </ScrollView>
      <PostCommentSheet
        ref={commentSheetRef}
        snapPoints={commentSheetSnapPoints}
        onChange={() => {}}
        onDismiss={() => {}}
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
        isPostWriter={postItem?.isWriter ?? false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  content: {
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerSide: {
    width: 24,
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontFamily: 'Pretendard-Bold',
    fontSize: 17,
    color: '#333',
    textAlign: 'center',
  },
});

export default PostDetailScreen;
