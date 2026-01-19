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
    rootCommentOrderIndex,
    replyCommentOrderIndex,
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
  const shouldAutoOpenSheet = openCommentSheet || Boolean(scrollToCommentId);
  const commentSheetInitialIndex = shouldAutoOpenSheet ? 1 : 0;
  const commentPageSize = 20;
  const [commentList, setCommentList] = useState([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [commentLikeState, setCommentLikeState] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalCount, setCommentTotalCount] = useState(null);
  const [commentSortKey, setCommentSortKey] = useState('latest');
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserNickname, setCurrentUserNickname] = useState('');
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null);
  const [pendingScrollReplyId, setPendingScrollReplyId] = useState(null);
  const [pendingHighlightIds, setPendingHighlightIds] = useState([]);
  const [autoExpandRootId, setAutoExpandRootId] = useState(null);
  const isLoadingMoreCommentsRef = useRef(false);
  const [didAutoOpenCommentSheet, setDidAutoOpenCommentSheet] = useState(false);
  const notifiedHighlightIdRef = useRef(null);
  const notificationTargetRootId = useMemo(() => {
    if (!scrollToCommentId) return null;
    return rootCommentId ?? scrollToCommentId;
  }, [rootCommentId, scrollToCommentId]);
  const notificationTargetReplyId = useMemo(() => {
    if (!scrollToCommentId) return null;
    if (!rootCommentId) return null;
    const rootKey = String(rootCommentId);
    const targetKey = String(scrollToCommentId);
    return rootKey !== targetKey ? scrollToCommentId : null;
  }, [rootCommentId, scrollToCommentId]);
  const promoteNotificationComment = useCallback(
    list => {
      if (!notificationTargetRootId || !Array.isArray(list) || !list.length) {
        return list;
      }
      const rootKey = String(notificationTargetRootId);
      const rootIndex = list.findIndex(
        item => String(item?.id) === rootKey,
      );
      if (rootIndex < 0) return list;
      let rootItem = list[rootIndex];
      const replyKey = notificationTargetReplyId
        ? String(notificationTargetReplyId)
        : null;
      if (replyKey) {
        const moveToFront = items => {
          if (!Array.isArray(items) || items.length === 0) return items;
          const index = items.findIndex(
            reply => String(reply?.id) === replyKey,
          );
          if (index <= 0) return items;
          const next = items.slice();
          const [target] = next.splice(index, 1);
          next.unshift(target);
          return next;
        };
        const nextReplies = moveToFront(rootItem.replies);
        const nextPreviewReplies = moveToFront(rootItem.previewReplies);
        if (
          nextReplies !== rootItem.replies ||
          nextPreviewReplies !== rootItem.previewReplies
        ) {
          rootItem = {
            ...rootItem,
            replies: nextReplies,
            previewReplies: nextPreviewReplies,
          };
        }
      }
      if (rootIndex === 0 && rootItem === list[rootIndex]) {
        return list;
      }
      const nextList = list.slice();
      nextList.splice(rootIndex, 1);
      nextList.unshift(rootItem);
      return nextList;
    },
    [notificationTargetReplyId, notificationTargetRootId],
  );

  useEffect(() => {
    let isMounted = true;
    const fetchUserNickname = async () => {
      try {
        const data = await Userdataget();
        if (isMounted) {
          setCurrentUserId(
            data?.id ??
              data?.userId ??
              data?.memberId ??
              data?.writerId ??
              null,
          );
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
          isStoreDeleted: data.isStoreDeleted ?? false,
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
        writerId:
          item.writerId ??
          item.writerUserId ??
          item.userId ??
          item.memberId ??
          null,
        taggedUserId:
          item.taggedUserId ?? item.taggedUserID ?? item.taggedUser ?? null,
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
          const mapped = items.map(item => {
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
          return promoteNotificationComment(mapped);
        });
        setCommentPage(0);
        setCommentTotalCount(totalElements);
      } finally {
        setIsLoadingComments(false);
      }
    },
    [commentSortKey, mapCommentItem, promoteNotificationComment],
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
          const nextList = Array.from(
            new Map(merged.map(item => [item.id, item])).values(),
          );
          return promoteNotificationComment(nextList);
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
      promoteNotificationComment,
      postId,
      postItem?.id,
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
      setCommentList(prev => {
        const nextList = prev.map(comment => {
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
            previewReplies: previewReplies.length
              ? previewReplies
              : comment.previewReplies ?? [],
          };
        });
        return promoteNotificationComment(nextList);
      });
    },
    [mapCommentItem, promoteNotificationComment],
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
            shouldShowMention:
              taggedUserNickname &&
              currentUserNickname &&
              taggedUserNickname !== currentUserNickname,
            isWriter: true,
            isLocal: true,
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
      currentUserNickname,
      currentUserProfileImage,
      fetchComments,
      mapCommentItem,
      postId,
      postItem?.id,
      updatePostCommentCount,
      currentUserId,
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
      setCommentPage(0);
      setCommentTotalCount(null);
      setIsLoadingComments(false);
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
        const rootPageSize = 20;
        const replyPageSize = 10;
        const mergeUnique = (listA = [], listB = []) => {
          const map = new Map();
          [...listA, ...listB].forEach(item => {
            if (item && item.id !== undefined) {
              map.set(String(item.id), item);
            }
          });
          return Array.from(map.values());
        };

        const fetchRootPage = async page =>
          CommentGetByPost({
            postId: targetPostId,
            page,
            size: rootPageSize,
            //sort: ['id,ASC'],
          });
        const fetchReplyPage = async (rootId, page) =>
          CommentGetByRootComment({
            rootCommentId: rootId,
            page,
            size: replyPageSize,
          });

        const targetRootOrder =
          Number.isFinite(rootCommentOrderIndex) && rootCommentOrderIndex >= 0
            ? rootCommentOrderIndex
            : null;
        const targetReplyOrder =
          Number.isFinite(replyCommentOrderIndex) && replyCommentOrderIndex >= 0
            ? replyCommentOrderIndex
            : null;

        let roots = [];
        let foundRoot = null;
        let foundRootInTargetPage = null;
        if (targetRootOrder !== null) {
          const page = Math.floor(targetRootOrder / rootPageSize);
          const data = await fetchRootPage(page);
          const items = Array.isArray(data?.content) ? data.content : [];
          roots = items;
          foundRootInTargetPage = items.find(item =>
            targetRootId
              ? String(item.id) === targetRootId
              : String(item.id) === targetCommentId,
          );
        }

        if (!foundRootInTargetPage) {
          const {roots: fallbackRoots, foundRoot: fallbackFound} =
            await (async () => {
              const collected = [];
              let page = 0;
              let detected = null;
              while (true) {
                const data = await CommentGetByPost({
                  postId: targetPostId,
                  page,
                  size: rootPageSize,
                  sort: COMMENT_SORTS[commentSortKey],
                });
                const items = Array.isArray(data?.content) ? data.content : [];
                collected.push(...items);
                detected = items.find(item =>
                  targetRootId
                    ? String(item.id) === targetRootId
                    : String(item.id) === targetCommentId,
                );
                const isLastPage =
                  data?.last === true ||
                  items.length < rootPageSize ||
                  (Number.isFinite(data?.totalPages) &&
                    page >= (data.totalPages ?? 1) - 1);
                if (detected || isLastPage) {
                  break;
                }
                page += 1;
              }
              return {roots: collected, foundRoot: detected};
            })();
          if (fallbackFound) {
            roots = fallbackRoots;
            foundRoot = fallbackFound;
          } else if (!roots.length) {
            roots = fallbackRoots;
            foundRoot = fallbackFound;
          } else {
            foundRoot = foundRootInTargetPage;
          }
        } else {
          foundRoot = foundRootInTargetPage;
        }

        const mappedRoots = roots.map(item => mapCommentItem(item));
        if (isCancelled) return;

        const effectiveRootId =
          targetRootId ?? (foundRoot ? String(foundRoot.id) : targetCommentId);
        setCommentList(prev => {
          const map = new Map();
          mappedRoots.forEach(c => map.set(String(c.id), c));
          prev.forEach(c => {
            if (!map.has(String(c.id))) map.set(String(c.id), c);
          });
          const nextList = Array.from(map.values());
          return promoteNotificationComment(nextList);
        });

        setAutoExpandRootId(
          effectiveRootId && String(effectiveRootId) !== targetCommentId
            ? effectiveRootId
            : null,
        );

        if (effectiveRootId && String(effectiveRootId) !== targetCommentId) {
          let replies = [];
          let foundReplyInTargetPage = null;
          if (targetReplyOrder !== null) {
            const page = Math.floor(targetReplyOrder / replyPageSize);
            const data = await fetchReplyPage(effectiveRootId, page);
            replies = Array.isArray(data?.content) ? data.content : [];
            foundReplyInTargetPage = replies.find(
              item => String(item.id) === targetCommentId,
            );
          }
          if (!foundReplyInTargetPage) {
            const fallback = [];
            let page = 0;
            let detected = null;
            while (true) {
              const data = await fetchReplyPage(effectiveRootId, page);
              const items = Array.isArray(data?.content) ? data.content : [];
              fallback.push(...items);
              detected = items.find(
                item => String(item.id) === targetCommentId,
              );
              const isLastPage =
                data?.last === true ||
                items.length < replyPageSize ||
                (Number.isFinite(data?.totalPages) &&
                  page >= (data.totalPages ?? 1) - 1);
              if (detected || isLastPage) {
                break;
              }
              page += 1;
            }
            replies = fallback.length ? fallback : replies;
          }
          if (isCancelled) return;
          const mappedReplies = replies.map(item =>
            mapCommentItem(item, effectiveRootId),
          );
          setCommentList(prev => {
            const nextList = prev.map(comment => {
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
            });
            return promoteNotificationComment(nextList);
          });
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
    rootCommentOrderIndex,
    replyCommentOrderIndex,
    commentSortKey,
    mapCommentItem,
    promoteNotificationComment,
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
    if (!shouldAutoOpenSheet || didAutoOpenCommentSheet || !targetPostId) {
      return;
    }
    setDidAutoOpenCommentSheet(true);
    setTimeout(() => {
      commentSheetRef.current?.present();
      commentSheetRef.current?.snapToIndex?.(1);
    }, 0);
  }, [
    openCommentSheet,
    shouldAutoOpenSheet,
    didAutoOpenCommentSheet,
    postItem?.id,
    postId,
  ]);

  // scrollToCommentId가 있으면 시트를 강제로 열어 레이아웃을 보장
  useEffect(() => {
    if (!scrollToCommentId) {
      return;
    }
    commentSheetRef.current?.present?.();
    commentSheetRef.current?.snapToIndex?.(1);
  }, [scrollToCommentId]);

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
        currentUserNickname={currentUserNickname}
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
        autoExpandRootId={autoExpandRootId ?? rootCommentId ?? null}
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
