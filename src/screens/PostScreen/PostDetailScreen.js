import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  DeviceEventEmitter,
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
  CommentLike,
} from '../../api/commentApi';
import {Userdataget} from '../../api/userApi';
import Loading from '../../hooks/Loading';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {HomeEmptyIcon, HomeHeaderIcon} from '../../assets/svg/HomeTabIcon';
import formatRelativeTime from '../../utils/formatRelativeTime';
import {useToast} from '../../context/ToastContext';

const defaultProfile = require('../../assets/default_profile.png');
const COMMENT_SORTS = {
  latest: null,
  popular: ['likeCount,DESC', 'id,DESC'],
};
//TODO
//PostDetailScreen 에서 전 스크린이 매장 리뷰 스크린이면 매장 이름 눌렀을 때 매장으로 이동 안하는 걸로 변경
const PostDetailScreen = ({navigation, route}) => {
  const {
    postId,
    item: routeItem,
    screen,
    openCommentSheet,
    scrollToCommentId,
    rootCommentId,
  } = route.params ?? {};
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
  const commentSheetInitialIndex = openCommentSheet ? 1 : 0;
  const commentPageSize = 20;
  const [commentList, setCommentList] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentLikeState, setCommentLikeState] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalCount, setCommentTotalCount] = useState(null);
  const [commentSortKey, setCommentSortKey] = useState('latest');
  const [currentUserNickname, setCurrentUserNickname] = useState('');
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null);
  const [pendingScrollReplyId, setPendingScrollReplyId] = useState(null);
  const [pendingHighlightIds, setPendingHighlightIds] = useState([]);
  const isLoadingMoreCommentsRef = useRef(false);
  const [didAutoOpenCommentSheet, setDidAutoOpenCommentSheet] = useState(false);
  const notifiedHighlightIdRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchUserNickname = async () => {
      try {
        const data = await Userdataget();
        if (isMounted) {
          setCurrentUserNickname(data?.nickname ?? '');
          setCurrentUserProfileImage(
            data?.imgUrl ?? data?.profileImgUrl ?? data?.profileImage ?? null,
          );
        }
      } catch (error) {}
    };
    fetchUserNickname();
    return () => {
      isMounted = false;
    };
  }, []);

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
          shares: data.shareCount ?? data.shares ?? 0,
          likes: data.likeCount ?? data.likes ?? 0,
          comments: data.commentCount ?? data.comments ?? 0,
          isLiked: data.isLiked ?? false,
          isSaved: data.isSaved ?? false,
          createdAt: data.createdAt ?? null,
          place: data.place ?? null,
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

  useEffect(() => {
    const likeSub = DeviceEventEmitter.addListener(
      'post-like-updated',
      payload => {
        const targetId = payload?.postId;
        if (!targetId) {
          return;
        }
        setPostItem(prev => {
          if (!prev || String(prev?.id) !== String(targetId)) {
            return prev;
          }
          const nextLikes =
            payload?.likeCount ?? prev?.likeCount ?? prev?.likes ?? 0;
          return {
            ...prev,
            isLiked: payload?.liked ?? prev?.isLiked ?? false,
            likeCount: nextLikes,
            likes: nextLikes,
          };
        });
      },
    );
    const savedSub = DeviceEventEmitter.addListener(
      'post-saved-updated',
      payload => {
        const targetId = payload?.postId;
        if (!targetId) {
          return;
        }
        setPostItem(prev => {
          if (!prev || String(prev?.id) !== String(targetId)) {
            return prev;
          }
          return {
            ...prev,
            isSaved: payload?.saved ?? prev?.isSaved ?? false,
          };
        });
      },
    );
    return () => {
      likeSub.remove();
      savedSub.remove();
    };
  }, []);

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
        replyCount: item.replyCount ?? 0,
        rootCommentId: rootCommentId ?? item.rootCommentId ?? null,
      };
    },
    [currentUserProfileImage],
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
          sort: COMMENT_SORTS[commentSortKey],
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
    [commentSortKey, mapCommentItem],
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
      postId,
      postItem?.id,
    ],
  );

  const handleRequestReplies = useCallback(
    async (rootCommentId, page = 0, sortKey, reset = false) => {
      if (!rootCommentId) return;
      const activeSortKey = sortKey ?? commentSortKey;
      const data = await CommentGetByRootComment({
        rootCommentId,
        page,
        size: 10,
        sort: COMMENT_SORTS[activeSortKey],
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
    [commentSortKey, mapCommentItem],
  );

  const updatePostCommentCount = useCallback((targetPostId, delta) => {
    if (!targetPostId || !delta) {
      return;
    }
    setPostItem(prev => {
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
      const isExpandedTarget = Boolean(payload?.isExpandedTarget);
      try {
        const result = await CommentCreate({
          postId: targetPostId,
          content,
          rootCommentId,
        });
        const createdId = result?.commentId;
        if (rootCommentId) {
          const fallbackReply = {
            id: createdId ?? `temp-${Date.now()}`,
            content,
            createdAt: new Date().toISOString(),
            writerImgUrl: currentUserProfileImage ?? null,
            writerNickname: currentUserNickname || '나',
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
                ? mergeUnique([mappedReply, ...existingReplies])
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
      currentUserNickname,
      currentUserProfileImage,
      fetchComments,
      mapCommentItem,
      postId,
      postItem?.id,
      updatePostCommentCount,
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
        updatePostCommentCount(targetPostId, -1);
      } else {
        fetchComments(targetPostId);
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
      postId,
      postItem?.id,
      showToast,
      updatePostCommentCount,
    ],
  );
  useEffect(() => {
    const targetPostId = postItem?.id ?? postId;
    if (!targetPostId) {
      setCommentList([]);
      setIsLoadingComments(false);
      return;
    }
    fetchComments(targetPostId);
  }, [fetchComments, postId, postItem?.id]);

  useEffect(() => {
    const targetPostId = postItem?.id ?? postId;
    if (!targetPostId) {
      return;
    }
    setCommentPage(0);
    setCommentTotalCount(null);
    fetchComments(targetPostId);
  }, [commentSortKey, fetchComments, postId, postItem?.id]);

  useEffect(() => {
    const targetPostId = postItem?.id ?? postId;
    if (!scrollToCommentId || !targetPostId) {
      return;
    }
    let isCancelled = false;
    const ensureCommentVisible = async () => {
      try {
        const targetCommentId = String(scrollToCommentId);
        const targetRootId =
          rootCommentId !== undefined && rootCommentId !== null
            ? String(rootCommentId)
            : null;
        const pageSize = 50;
        const mergeUnique = (listA = [], listB = []) => {
          const map = new Map();
          [...listA, ...listB].forEach(item => {
            if (item && item.id !== undefined) {
              map.set(String(item.id), item);
            }
          });
          return Array.from(map.values());
        };

        const fetchRootsUntilFound = async () => {
          const roots = [];
          let page = 0;
          let foundRoot = null;
          while (true) {
            const data = await CommentGetByPost({
              postId: targetPostId,
              page,
              size: pageSize,
              sort: COMMENT_SORTS[commentSortKey],
            });
            const items = Array.isArray(data?.content) ? data.content : [];
            roots.push(...items);
            foundRoot = items.find(item =>
              targetRootId
                ? String(item.id) === targetRootId
                : String(item.id) === targetCommentId,
            );
            const isLastPage =
              data?.last === true ||
              items.length < pageSize ||
              (Number.isFinite(data?.totalPages) &&
                page >= (data.totalPages ?? 1) - 1);
            if (foundRoot || isLastPage) {
              break;
            }
            page += 1;
          }
          return {roots, foundRoot};
        };

        const fetchRepliesUntilFound = async rootId => {
          const replies = [];
          let page = 0;
          let foundReply = null;
          while (true) {
            const data = await CommentGetByRootComment({
              rootCommentId: rootId,
              page,
              size: pageSize,
              sort: COMMENT_SORTS[commentSortKey],
            });
            const items = Array.isArray(data?.content) ? data.content : [];
            replies.push(...items);
            foundReply = items.find(
              item => String(item.id) === targetCommentId,
            );
            const isLastPage =
              data?.last === true ||
              items.length < pageSize ||
              (Number.isFinite(data?.totalPages) &&
                page >= (data.totalPages ?? 1) - 1);
            if (foundReply || isLastPage) {
              break;
            }
            page += 1;
          }
          return {replies, foundReply};
        };

        const {roots, foundRoot} = await fetchRootsUntilFound();
        if (isCancelled) return;
        const mappedRoots = roots.map(item => mapCommentItem(item));

        setCommentList(prev => {
          const map = new Map();
          mappedRoots.forEach(c => map.set(String(c.id), c));
          prev.forEach(c => {
            if (!map.has(String(c.id))) map.set(String(c.id), c);
          });
          return Array.from(map.values());
        });

        const effectiveRootId =
          targetRootId ?? (foundRoot ? String(foundRoot.id) : targetCommentId);

        if (effectiveRootId && String(effectiveRootId) !== targetCommentId) {
          const {replies} = await fetchRepliesUntilFound(effectiveRootId);
          if (isCancelled) return;
          const mappedReplies = replies.map(item =>
            mapCommentItem(item, effectiveRootId),
          );
          setCommentList(prev =>
            prev.map(comment => {
              if (String(comment.id) !== String(effectiveRootId)) {
                return comment;
              }
              return {
                ...comment,
                replies: mergeUnique(comment.replies, mappedReplies),
                previewReplies: mergeUnique(
                  comment.previewReplies,
                  mappedReplies,
                ),
              };
            }),
          );
        }

        setPendingScrollReplyId(targetCommentId);
        if (targetCommentId) {
          const key = String(targetCommentId);
          if (notifiedHighlightIdRef.current !== key) {
            setPendingHighlightIds([key]);
            notifiedHighlightIdRef.current = key;
          }
        }
      } catch (error) {
        console.log(error);
      }
    };
    ensureCommentVisible();
    return () => {
      isCancelled = true;
    };
  }, [
    scrollToCommentId,
    rootCommentId,
    commentSortKey,
    mapCommentItem,
    postId,
    postItem?.id,
  ]);

  const handleChangeCommentSort = useCallback(nextSortKey => {
    setCommentSortKey(nextSortKey);
  }, []);

  const handleOpenCommentSheet = useCallback(() => {
    commentSheetRef.current?.present();
  }, []);

  useEffect(() => {
    const targetPostId = postItem?.id ?? postId;
    if (!openCommentSheet || didAutoOpenCommentSheet || !targetPostId) {
      return;
    }
    setDidAutoOpenCommentSheet(true);
    setTimeout(() => {
      commentSheetRef.current?.present();
    }, 0);
  }, [openCommentSheet, didAutoOpenCommentSheet, postItem?.id, postId]);

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
            hideStoreBadge={screen === 'StoreReview' ? true : false}
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
        commentSortKey={commentSortKey}
        onChangeCommentSort={handleChangeCommentSort}
        defaultProfile={defaultProfile}
        commentLikeState={commentLikeState}
        onToggleLike={handleCommentLikeToggle}
        formatLikeCount={formatLikeCount}
        commentInput={commentInput}
        onChangeCommentInput={setCommentInput}
        currentUserProfileImage={currentUserProfileImage}
        onPressSend={handleSendComment}
        onDeleteComment={handleDeleteComment}
        onRequestReplies={handleRequestReplies}
        onRequestMoreComments={handleRequestMoreComments}
        commentPageSize={commentPageSize}
        commentTotalCount={commentTotalCount}
        commentPage={commentPage}
        isPostWriter={postItem?.isWriter ?? false}
        isLoadingComments={isLoadingComments}
        pendingScrollToId={pendingScrollReplyId}
        pendingHighlightIds={pendingHighlightIds}
        initialIndex={commentSheetInitialIndex}
        autoExpandRootId={rootCommentId ?? null}
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
