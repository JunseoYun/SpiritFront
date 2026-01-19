import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  ActionSheetIOS,
  Alert,
  Animated,
  ActivityIndicator,
  Dimensions,
  Easing,
  Image,
  Keyboard,
  ToastAndroid,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Portal} from 'react-native-paper';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import CustomTextInput from '../../utils/CustomTextInput';
import FastImage from 'react-native-fast-image';
import PostReportBottomSheet from '../../components/Post/PostReportBottomSheet';
import {
  COMMENT_REPORT_REASONS,
  REPORT_REASON_MAP,
} from '../../components/Post/PostReportSheet';
import {report_create} from '../../api/reportApi';
import {useToast} from '../../context/ToastContext';
import {
  CommentCreate,
  CommentDelete,
  CommentGetByPost,
  CommentGetByRootComment,
  CommentLike,
} from '../../api/commentApi';
import {Userdataget} from '../../api/userApi';
import formatRelativeTime from '../../utils/formatRelativeTime';

const defaultProfile = require('../../assets/default_profile.png');
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const COMMENT_SORTS = {
  latest: ['id,DESC'],
  popular: ['likeCount,DESC', 'id,DESC'],
};

const CommentFooter = ({
  inputRef,
  onChangeCommentInput,
  onPressSend,
  onFocusInput,
  onPressInput,
  defaultProfileImage,
  currentUserProfileImage,
  bottomInset,
  replyTargetStore,
  onClearReplyTarget,
}) => {
  const [localInput, setLocalInput] = useState('');
  const [replyTarget, setReplyTarget] = useState(
    replyTargetStore?.current?.value ?? null,
  );

  useEffect(() => {
    const store = replyTargetStore?.current;
    if (!store) return;
    setReplyTarget(store.value ?? null);
    const listener = nextValue => {
      setReplyTarget(nextValue ?? null);
    };
    store.listeners.add(listener);
    return () => {
      store.listeners.delete(listener);
    };
  }, [replyTargetStore]);

  const handleSend = useCallback(() => {
    const content = localInput.trim();
    if (!content) {
      return;
    }
    onPressSend?.({
      content,
      rootCommentId: replyTarget?.rootCommentId ?? null,
      taggedUserId: replyTarget?.targetWriterId ?? null,
      taggedUserNickname: replyTarget?.name ?? null,
    });
    requestAnimationFrame(() => {
      setLocalInput('');
      onChangeCommentInput?.('');
      onClearReplyTarget?.();
      requestAnimationFrame(() => {
        inputRef.current?.focus?.();
      });
    });
  }, [
    localInput,
    onPressSend,
    onChangeCommentInput,
    replyTarget,
    onClearReplyTarget,
  ]);

  return (
    <View
      style={[
        styles.commentInputBar,
        {
          paddingBottom: bottomInset + 10,
        },
      ]}>
      <FastImage
        source={
          currentUserProfileImage
            ? {uri: currentUserProfileImage}
            : defaultProfileImage
        }
        style={styles.commentInputAvatar}
      />
      <View style={{flex: 1}}>
        {replyTarget ? (
          <View style={styles.replyField}>
            <CustomText
              style={styles.replyTarget}
              numberOfLines={1}
              ellipsizeMode="tail">
              {replyTarget?.name} 님에게 답글 남기기
            </CustomText>
            <Pressable hitSlop={6} onPress={onClearReplyTarget}>
              <Ionicons name="close" size={16} color={ColorUtil.subText} />
            </Pressable>
          </View>
        ) : null}
        <View
          style={[
            styles.commentInputField,
            replyTarget ? styles.commentInputFieldReply : null,
          ]}>
          <CustomTextInput
            ref={inputRef}
            value={localInput}
            onChangeText={text => {
              setLocalInput(text);
              onChangeCommentInput?.(text);
            }}
            onFocus={onFocusInput}
            onPressIn={onPressInput}
            placeholder="댓글을 남겨보세요."
            placeholderTextColor="#9AA1AE"
            style={styles.commentInput}
            multiline
            underlineColorAndroid="transparent"
          />
          {localInput.trim() ? (
            <Pressable
              hitSlop={8}
              onPress={handleSend}
              style={[styles.commentSendButton]}>
              <Ionicons name="arrow-up" size={20} color="#FFF" />
            </Pressable>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const PostCommentScreen = ({navigation, route}) => {
  const {postId, isPostWriter = false} = route.params ?? {};
  const isAndroid = Platform.OS === 'android';
  const insets = useSafeAreaInsets();
  const {height: rawWindowHeight} = useWindowDimensions();
  const windowHeight = Math.max(
    rawWindowHeight || 0,
    Dimensions.get('window').height || 0,
    Dimensions.get('screen').height || 0,
  );
  const [screenHeight, setScreenHeight] = useState(0);
  const screenHeightRef = useRef(0);
  const baseHeightRef = useRef(0);
  const pendingSheetSyncRef = useRef(false);
  const baseHeight =
    baseHeightRef.current ||
    screenHeightRef.current ||
    screenHeight ||
    windowHeight;
  const collapsedHeight = Math.round(baseHeight * 0.7);
  const topInset = insets.top === 0 ? 20 : insets.top;
  const expandedHeight = Math.max(0, baseHeight - topInset);
  const initialHeight = Math.max(0, collapsedHeight);
  const {showToast} = useToast();
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const keyboardTranslate = useRef(new Animated.Value(0)).current;
  const sheetTranslate = useRef(new Animated.Value(0)).current;
  const sheetHeightValue = useRef(new Animated.Value(initialHeight)).current;
  const sheetHeightRef = useRef(initialHeight);
  const isExpandedRef = useRef(false);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const [backdropEnabled, setBackdropEnabled] = useState(false);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [commentList, setCommentList] = useState([]);
  const [commentSortKey, setCommentSortKey] = useState('latest');
  const [commentLikeState, setCommentLikeState] = useState({});
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalCount, setCommentTotalCount] = useState(null);
  const [commentInput, setCommentInput] = useState('');
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserProfileImage, setCurrentUserProfileImage] = useState(null);
  const [currentUserNickname, setCurrentUserNickname] = useState('');
  const [pendingScrollToId, setPendingScrollToId] = useState(null);
  const isSendingCommentRef = useRef(false);
  const isLoadingMoreCommentsRef = useRef(false);

  const [expandedReplies, setExpandedReplies] = useState({});
  const [hiddenPreviewReplies, setHiddenPreviewReplies] = useState({});
  const [replyTarget, setReplyTarget] = useState(null);
  const replyTargetStoreRef = useRef({value: null, listeners: new Set()});
  const expandedRepliesRef = useRef({});
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [selectedMenuTarget, setSelectedMenuTarget] = useState(null);
  const [reportTargetItem, setReportTargetItem] = useState(null);
  const [menuPosition, setMenuPosition] = useState({top: 60, right: 16});
  const [selectedReportReason, setSelectedReportReason] = useState(null);
  const [loadingReplies, setLoadingReplies] = useState({});
  const reportSheetRef = useRef(null);
  const scrollOffsetRef = useRef(0);
  const lastRequestedCommentPageRef = useRef(0);
  const highlightMapRef = useRef({});
  const replyRequestTokenRef = useRef({});
  const pendingAutoScrollIdRef = useRef(null);
  const pendingScrollIdRef = useRef(null);
  const isKeyboardVisibleRef = useRef(false);
  const isClosingRef = useRef(false);
  const pendingCloseRef = useRef(false);
  const isReadyRef = useRef(false);
  const dragStartOffsetRef = useRef(0);
  const dragMaxOffsetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const isExpandingRef = useRef(false);
  const contentHeightRef = useRef(0);
  const layoutHeightRef = useRef(0);
  const responderStartYRef = useRef(null);
  const lastReplyTargetIdRef = useRef(null);
  const SHEET_HEADER_HEIGHT = 52;

  const layoutMapRef = useRef({});
  const replyListLayoutRef = useRef({});
  const itemMeasureMapRef = useRef({});
  const sheetContainerRef = useRef(null);
  const setItemLayoutWithSize = useCallback((id, y, height) => {
    if (!id) return;
    layoutMapRef.current[id] = {y, height};
    if (pendingAutoScrollIdRef.current === id) {
      pendingAutoScrollIdRef.current = null;
      scrollToItem(id);
    }
  }, []);
  const setReplyListLayout = useCallback((id, y) => {
    if (!id) return;
    replyListLayoutRef.current[id] = y;
  }, []);

  const getHighlightValue = useCallback(id => {
    if (!id) return null;
    if (!highlightMapRef.current[id]) {
      highlightMapRef.current[id] = new Animated.Value(0);
    }
    return highlightMapRef.current[id];
  }, []);

  const triggerHighlight = useCallback(
    id => {
      const value = getHighlightValue(id);
      if (!value) return;
      value.stopAnimation();
      value.setValue(1);
      Animated.timing(value, {
        toValue: 0,
        duration: 320,
        delay: 1800,
        useNativeDriver: false,
      }).start();
    },
    [getHighlightValue],
  );

  const scrollToItem = useCallback(id => {
    const layout = layoutMapRef.current[id];
    if (!layout || typeof layout.y !== 'number') {
      return;
    }
    const {y} = layout;
    scrollRef.current?.scrollTo?.({y: Math.max(0, y), animated: true});
    requestAnimationFrame(() => {
      inputRef.current?.focus?.();
    });
  }, []);

  useEffect(() => {
    if (!pendingScrollToId) return;
    pendingAutoScrollIdRef.current = pendingScrollToId;
    const layout = layoutMapRef.current[pendingScrollToId];
    if (layout && typeof layout.y === 'number') {
      pendingAutoScrollIdRef.current = null;
      scrollToItem(pendingScrollToId);
    }
  }, [pendingScrollToId, scrollToItem]);

  useEffect(() => {
    if (isKeyboardVisibleRef.current) {
      return;
    }
    const nextHeight = Math.max(
      0,
      isExpandedRef.current ? expandedHeight : collapsedHeight,
    );
    if (Math.abs(nextHeight - sheetHeightRef.current) > 1) {
      sheetHeightRef.current = nextHeight;
      sheetHeightValue.setValue(nextHeight);
    }
  }, [collapsedHeight, expandedHeight, sheetHeightValue]);

  useEffect(() => {
    console.log('[PostCommentScreen] mounted', {postId});
    console.log('[PostCommentScreen] dimensions', {
      rawWindowHeight,
      windowHeight,
      collapsedHeight,
      expandedHeight,
    });
    sheetTranslate.setValue(0);
    backdropOpacity.setValue(0);
    sheetHeightValue.setValue(initialHeight);
    const readyTimer = setTimeout(() => {
      isReadyRef.current = true;
    }, 300);
    return () => {
      clearTimeout(readyTimer);
      console.log('[PostCommentScreen] unmounted', {postId});
    };
  }, [postId]);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, event => {
      isKeyboardVisibleRef.current = true;
      const duration = event?.duration ?? 220;
      if (Platform.OS === 'ios' && !isExpandedRef.current) {
        setSheetExpanded(true, duration);
      }
      const rawKeyboardHeight = Math.max(
        0,
        (event?.endCoordinates?.height ?? 0) - insets.bottom,
      );
      const fallbackKeyboardHeight = rawKeyboardHeight || (isAndroid ? 320 : 0);
      const baseForCap =
        sheetHeightRef.current ||
        screenHeightRef.current ||
        screenHeight ||
        windowHeight;
      const maxTranslate = Math.max(0, baseForCap - 120);
      const effectiveKeyboard = Math.min(
        maxTranslate,
        Math.max(0, fallbackKeyboardHeight),
      );
      setKeyboardHeight(effectiveKeyboard);
      Animated.timing(keyboardTranslate, {
        toValue: -effectiveKeyboard,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      if (pendingScrollIdRef.current) {
        const id = pendingScrollIdRef.current;
        pendingScrollIdRef.current = null;
        scrollToItem(id);
      }
    });
    const hideSub = Keyboard.addListener(hideEvent, event => {
      isKeyboardVisibleRef.current = false;
      const duration = event?.duration ?? 220;
      setKeyboardHeight(0);
      Animated.timing(keyboardTranslate, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
      if (pendingCloseRef.current) {
        pendingCloseRef.current = false;
        runCloseAnimation();
      }
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [
    insets.bottom,
    isAndroid,
    keyboardTranslate,
    runCloseAnimation,
    scrollToItem,
    screenHeight,
    windowHeight,
    setSheetExpanded,
  ]);

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
      if (!postId) return;
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
          postId,
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
            previewReplies,
          };
        }),
      );
    },
    [mapCommentItem],
  );

  const handleSendComment = useCallback(
    async payload => {
      const content = payload?.content?.trim();
      const taggedUserId = payload?.taggedUserId ?? null;
      const taggedUserNickname = payload?.taggedUserNickname ?? null;
      if (!postId || !content) {
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
          postId,
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
          setPendingScrollToId(mappedReply.id);
          return;
        }
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
            commentItem => String(commentItem.id) !== String(mappedComment.id),
          );
          return [mappedComment, ...filtered];
        });
        setCommentTotalCount(prev => (prev === null ? null : prev + 1));
        requestAnimationFrame(() => {
          scrollRef.current?.scrollTo?.({y: 0, animated: true});
        });
      } finally {
        isSendingCommentRef.current = false;
      }
    },
    [
      currentUserId,
      currentUserNickname,
      currentUserProfileImage,
      mapCommentItem,
      postId,
    ],
  );

  const handleDeleteComment = useCallback(
    async targetComment => {
      if (!targetComment?.id || !postId) {
        return;
      }
      await CommentDelete(targetComment.id);
      if (targetComment.rootCommentId) {
        handleRequestReplies(targetComment.rootCommentId);
      } else {
        fetchComments(postId, commentSortKey);
        setCommentTotalCount(prev =>
          prev === null ? null : Math.max(0, prev - 1),
        );
      }
      showToast('삭제가 완료되었습니다.');
      if (Platform.OS === 'android') {
        ToastAndroid.show('삭제가 완료되었습니다.', ToastAndroid.SHORT);
      }
    },
    [fetchComments, handleRequestReplies, postId, showToast],
  );

  useEffect(() => {
    if (!postId) {
      setCommentList([]);
      setIsLoadingComments(false);
      return;
    }
    fetchComments(postId, commentSortKey);
  }, [fetchComments, postId]);

  const handleChangeCommentSort = useCallback(
    nextSortKey => {
      setCommentSortKey(nextSortKey);
      if (!postId) {
        return;
      }
      setCommentPage(0);
      setCommentTotalCount(null);
      fetchComments(postId, nextSortKey);
    },
    [fetchComments, postId],
  );

  useEffect(() => {
    const store = replyTargetStoreRef.current;
    store.value = replyTarget;
    store.listeners.forEach(listener => listener(replyTarget));
  }, [replyTarget]);

  useEffect(() => {
    expandedRepliesRef.current = expandedReplies;
  }, [expandedReplies]);

  const onPressSendRef = useRef(handleSendComment);
  const onChangeCommentInputRef = useRef(setCommentInput);

  useEffect(() => {
    onPressSendRef.current = handleSendComment;
  }, [handleSendComment]);

  useEffect(() => {
    onChangeCommentInputRef.current = setCommentInput;
  }, []);

  const handlePressSend = useCallback(
    payload => {
      const rootCommentId = payload?.rootCommentId ?? null;
      const isExpandedTarget =
        rootCommentId && expandedReplies[rootCommentId] ? true : false;
      onPressSendRef.current?.({
        ...payload,
        isExpandedTarget,
      });
    },
    [expandedReplies],
  );

  const handleChangeCommentInput = useCallback(text => {
    onChangeCommentInputRef.current?.(text);
  }, []);

  const requestReplies = useCallback(
    (commentId, page) => {
      if (!handleRequestReplies) return;
      const nextToken = (replyRequestTokenRef.current[commentId] ?? 0) + 1;
      replyRequestTokenRef.current[commentId] = nextToken;
      setLoadingReplies(prev => {
        if (prev[commentId]) return prev;
        return {...prev, [commentId]: true};
      });
      const maybePromise = handleRequestReplies(commentId, page);
      if (maybePromise && typeof maybePromise.finally === 'function') {
        maybePromise.finally(() => {
          if (replyRequestTokenRef.current[commentId] === nextToken) {
            setLoadingReplies(prev => ({
              ...prev,
              [commentId]: false,
            }));
          }
        });
        return;
      }
      setTimeout(() => {
        if (replyRequestTokenRef.current[commentId] === nextToken) {
          setLoadingReplies(prev => ({
            ...prev,
            [commentId]: false,
          }));
        }
      }, 250);
    },
    [handleRequestReplies],
  );

  useEffect(() => {
    const expandedIds = Object.keys(expandedRepliesRef.current).filter(
      id => expandedRepliesRef.current[id],
    );
    if (!expandedIds.length) {
      return;
    }
    expandedIds.forEach(commentId => {
      requestReplies(commentId, 0);
    });
  }, [requestReplies]);

  const getHighlightOpacityStyle = useCallback(
    id => {
      const value = getHighlightValue(id);
      if (!value) return null;
      return {
        opacity: value,
      };
    },
    [getHighlightValue],
  );

  const handleInputFocus = useCallback(() => {
    setSheetExpanded(true, 260, true);
    requestAnimationFrame(() => {
      inputRef.current?.focus?.();
    });
  }, [setSheetExpanded]);

  const handleInputPressIn = useCallback(() => {
    setSheetExpanded(true, 260, true);
  }, [setSheetExpanded]);

  const handleClearReplyTarget = useCallback(() => {
    if (lastReplyTargetIdRef.current) {
      const value = getHighlightValue(lastReplyTargetIdRef.current);
      value?.setValue?.(0);
    }
    lastReplyTargetIdRef.current = null;
    setReplyTarget(null);
    requestAnimationFrame(() => {
      inputRef.current?.focus?.();
    });
  }, [getHighlightValue]);

  const closeMoreMenu = useCallback(() => {
    setShowMoreMenu(false);
    setSelectedMenuTarget(null);
  }, []);

  const handleReportPress = useCallback(
    _targetItem => {
      closeMoreMenu();
      setReportTargetItem(_targetItem ?? null);
      reportSheetRef.current?.present();
    },
    [closeMoreMenu],
  );
  const handleSelectReportReason = useCallback(reason => {
    setSelectedReportReason(prev => (prev === reason ? null : reason));
  }, []);

  const handleReportSubmit = useCallback(async () => {
    reportSheetRef.current?.dismiss();
    if (!selectedReportReason) {
      return;
    }
    if (!reportTargetItem?.id) {
      showToast('신고할 댓글을 찾지 못했습니다.');
      return;
    }
    const reportReason = REPORT_REASON_MAP[selectedReportReason];
    try {
      await report_create({
        reportTarget: 'COMMENT',
        targetId: reportTargetItem.id,
        reportReason,
        description: selectedReportReason,
      });
      showToast('신고가 접수되었습니다.');
      setReportTargetItem(null);
    } catch (error) {
      const code = error?.response?.data?.code;
      if (code === 27004) {
        showToast('이미 신고한 댓글입니다.');
        return;
      }
      if (code === 27003) {
        showToast('신고 사유를 입력해주세요.');
        return;
      }
      showToast('신고 접수에 실패했습니다.');
    }
  }, [reportTargetItem?.id, selectedReportReason, showToast]);

  const handleDeletePress = useCallback(
    targetItem => {
      const resolvedTarget = targetItem ?? selectedMenuTarget;
      const targetId = resolvedTarget?.id;
      if (!targetId) {
        Alert.alert('삭제하기', '삭제할 댓글을 찾지 못했습니다.');
        return;
      }
      closeMoreMenu();
      handleDeleteComment(resolvedTarget);
    },
    [closeMoreMenu, handleDeleteComment, selectedMenuTarget],
  );

  const handleCommentLongPress = useCallback(
    targetItem => {
      const canDelete = isPostWriter || targetItem?.isMine;
      const canReport = !targetItem?.isMine;
      if (Platform.OS === 'ios') {
        setSelectedMenuTarget(targetItem);
        const options = [];
        if (canReport) {
          options.push('신고하기');
        }
        if (canDelete) {
          options.push('삭제하기');
        }
        options.push('취소');
        const cancelButtonIndex = options.length - 1;
        const destructiveButtonIndex = canDelete
          ? options.indexOf('삭제하기')
          : undefined;
        ActionSheetIOS.showActionSheetWithOptions(
          {
            options,
            cancelButtonIndex,
            destructiveButtonIndex,
            userInterfaceStyle: 'light',
          },
          buttonIndex => {
            const selection = options[buttonIndex];
            if (selection === '신고하기') {
              handleReportPress(targetItem);
            }
            if (selection === '삭제하기') {
              handleDeletePress(targetItem);
            }
            setSelectedMenuTarget(null);
          },
        );
        return;
      }

      setSelectedMenuTarget(targetItem);
      const targetId = targetItem?.id;
      const targetNode = targetId ? itemMeasureMapRef.current[targetId] : null;
      if (
        targetNode?.measureInWindow &&
        sheetContainerRef.current?.measureInWindow
      ) {
        targetNode.measureInWindow((x = 0, y = 0, width = 0, height = 0) => {
          sheetContainerRef.current.measureInWindow((sx = 0, sy = 0) => {
            const targetTop = Math.max(60, y - sy);
            setMenuPosition({top: targetTop, right: 16});
            setShowMoreMenu(true);
          });
        });
      } else {
        setMenuPosition({top: 60, right: 16});
        setShowMoreMenu(true);
      }
    },
    [handleDeletePress, handleReportPress, isPostWriter],
  );

  const handleReplyPress = useCallback(
    (author, id, rootCommentId, writerId = null) => {
      if (lastReplyTargetIdRef.current && lastReplyTargetIdRef.current !== id) {
        const prevValue = getHighlightValue(lastReplyTargetIdRef.current);
        prevValue?.setValue?.(0);
      }
      lastReplyTargetIdRef.current = id;
      setReplyTarget({
        name: author,
        rootCommentId: rootCommentId ?? id,
        targetId: id,
        targetWriterId: writerId,
      });
      triggerHighlight(id);
      handleInputFocus();
    },
    [getHighlightValue, handleInputFocus, triggerHighlight],
  );

  const previewCountRef = useRef({});
  useEffect(() => {
    setHiddenPreviewReplies(prev => {
      const nextHidden = {...prev};
      const nextCounts = {};
      let changed = false;

      commentList.forEach(comment => {
        const previewCount = Array.isArray(comment.previewReplies)
          ? comment.previewReplies.length
          : 0;
        nextCounts[comment.id] = previewCount;
        const prevCount = previewCountRef.current[comment.id] ?? 0;
        if (previewCount > 0 && previewCount !== prevCount) {
          if (nextHidden[comment.id]) {
            nextHidden[comment.id] = false;
            changed = true;
          }
        }
      });

      previewCountRef.current = nextCounts;
      return changed ? nextHidden : prev;
    });
  }, [commentList]);

  useEffect(() => {
    if (commentPage === 0) {
      isLoadingMoreCommentsRef.current = false;
    }
    lastRequestedCommentPageRef.current = commentPage;
  }, [commentPage]);

  const hasMoreComments =
    (commentTotalCount !== null && commentList.length < commentTotalCount) ||
    (commentTotalCount === null &&
      commentList.length >= 20 &&
      commentList.length % 20 === 0);

  const handleLoadMoreComments = useCallback(
    nextPage => {
      if (!hasMoreComments) return;
      if (isLoadingMoreCommentsRef.current) return;
      if (nextPage <= lastRequestedCommentPageRef.current) return;
      isLoadingMoreCommentsRef.current = true;
      lastRequestedCommentPageRef.current = nextPage;
      const maybePromise = handleRequestMoreComments(nextPage);
      if (maybePromise && typeof maybePromise.finally === 'function') {
        maybePromise.finally(() => {
          isLoadingMoreCommentsRef.current = false;
        });
        return;
      }
      setTimeout(() => {
        isLoadingMoreCommentsRef.current = false;
      }, 250);
    },
    [handleRequestMoreComments, hasMoreComments],
  );

  const runCloseAnimation = useCallback(() => {
    if (!isReadyRef.current) {
      return;
    }
    if (isClosingRef.current) {
      return;
    }
    isClosingRef.current = true;
    Animated.parallel([
      Animated.timing(sheetTranslate, {
        toValue: sheetHeightRef.current,
        duration: 220,
        useNativeDriver: false,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.goBack();
    });
  }, [backdropOpacity, navigation, sheetTranslate]);

  const closeWithAnimation = useCallback(() => {
    if (isKeyboardVisibleRef.current) {
      pendingCloseRef.current = true;
      Keyboard.dismiss();
      return;
    }
    runCloseAnimation();
  }, [runCloseAnimation]);

  const setSheetExpanded = useCallback(
    (nextExpanded, duration = 220, force = false) => {
      if (!force && isExpandedRef.current === nextExpanded) {
        return;
      }
      isExpandedRef.current = nextExpanded;
      const lockedBase =
        baseHeightRef.current || screenHeightRef.current || screenHeight;
      if (nextExpanded && !lockedBase) {
        pendingSheetSyncRef.current = true;
        return;
      }
      const resolvedExpanded = lockedBase
        ? Math.max(0, lockedBase - topInset)
        : expandedHeight;
      const resolvedCollapsed = lockedBase
        ? Math.round(lockedBase * 0.7)
        : collapsedHeight;
      const nextHeight = Math.max(
        0,
        nextExpanded ? resolvedExpanded : resolvedCollapsed,
      );
      console.log('[PostCommentScreen] sheetHeight', {
        nextExpanded,
        nextHeight,
        expandedHeight,
        collapsedHeight,
        baseHeight,
        screenHeight,
      });
      if (
        baseHeightRef.current === 0 &&
        screenHeightRef.current === 0 &&
        screenHeight === 0
      ) {
        pendingSheetSyncRef.current = true;
      }
      sheetHeightRef.current = nextHeight;
      Animated.timing(sheetHeightValue, {
        toValue: nextHeight,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start(() => {
        isExpandingRef.current = false;
      });
    },
    [
      collapsedHeight,
      expandedHeight,
      sheetHeightValue,
      isExpandingRef,
      baseHeight,
      screenHeight,
    ],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 3,
        onPanResponderMove: (_, gesture) => {
          if (gesture.dy > 0) {
            sheetTranslate.setValue(gesture.dy);
          }
        },
        onPanResponderRelease: (_, gesture) => {
          if (isClosingRef.current) {
            return;
          }
          const shouldExpand = gesture.dy < -40 || gesture.vy < -0.6;
          if (shouldExpand && !isExpandedRef.current) {
            Animated.spring(sheetTranslate, {
              toValue: 0,
              useNativeDriver: false,
              bounciness: 0,
            }).start(() => {
              setSheetExpanded(true);
            });
            return;
          }
          const shouldCollapse = gesture.dy > 60 || gesture.vy > 0.8;
          if (shouldCollapse) {
            if (isExpandedRef.current) {
              Animated.spring(sheetTranslate, {
                toValue: 0,
                useNativeDriver: false,
                bounciness: 0,
              }).start(() => {
                setSheetExpanded(false);
              });
              return;
            }
            isClosingRef.current = true;
            Animated.timing(sheetTranslate, {
              toValue: sheetHeightRef.current,
              duration: 200,
              useNativeDriver: false,
            }).start(() => {
              navigation.goBack();
            });
            return;
          }
          Animated.spring(sheetTranslate, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 0,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(sheetTranslate, {
            toValue: 0,
            useNativeDriver: false,
            bounciness: 0,
          }).start();
        },
      }),
    [navigation, setSheetExpanded, sheetTranslate],
  );

  const handleScrollBeginDrag = useCallback(() => {
    isDraggingRef.current = true;
    dragStartOffsetRef.current = scrollOffsetRef.current;
    dragMaxOffsetRef.current = scrollOffsetRef.current;
    console.log('[PostCommentScreen] scrollBeginDrag', {
      offsetY: scrollOffsetRef.current,
    });
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    if (!isDraggingRef.current) {
      return;
    }
    isDraggingRef.current = false;
    console.log('[PostCommentScreen] scrollEndDrag', {
      offsetY: scrollOffsetRef.current,
      startOffsetY: dragStartOffsetRef.current,
      maxOffsetY: dragMaxOffsetRef.current,
    });
    if (isClosingRef.current) {
      return;
    }
    if (
      dragStartOffsetRef.current <= 0 &&
      scrollOffsetRef.current <= 0 &&
      dragMaxOffsetRef.current <= 0
    ) {
      if (isExpandedRef.current) {
        setSheetExpanded(false);
      } else {
        closeWithAnimation();
      }
    }
  }, [closeWithAnimation, setSheetExpanded]);

  const handleMomentumScrollEnd = useCallback(() => {
    isDraggingRef.current = false;
    console.log('[PostCommentScreen] momentumEnd', {
      offsetY: scrollOffsetRef.current,
    });
  }, []);

  const handleCommentScroll = useCallback(
    event => {
      const offsetY = event.nativeEvent.contentOffset?.y ?? 0;
      scrollOffsetRef.current = offsetY;
      if (isDraggingRef.current) {
        dragMaxOffsetRef.current = Math.max(dragMaxOffsetRef.current, offsetY);
      }
      if (
        isReadyRef.current &&
        offsetY < -40 &&
        !isClosingRef.current &&
        isDraggingRef.current
      ) {
        closeWithAnimation();
        return;
      }
      if (!hasMoreComments) return;
      const layoutHeight = event.nativeEvent.layoutMeasurement?.height ?? 0;
      const contentHeight = event.nativeEvent.contentSize?.height ?? 0;
      const distanceFromBottom = contentHeight - (offsetY + layoutHeight);
      if (distanceFromBottom <= 120) {
        handleLoadMoreComments(Math.max(0, commentPage) + 1);
      }
    },
    [closeWithAnimation, commentPage, handleLoadMoreComments, hasMoreComments],
  );

  const contentContainerStyle = useMemo(() => {
    const paddingBottom = Math.max(80, insets.bottom + 110 + keyboardHeight);
    return [styles.commentSheetContent, {paddingBottom}];
  }, [insets.bottom, keyboardHeight]);

  const handleBackdropPress = useCallback(() => {
    if (!backdropEnabled) {
      return;
    }
    if (isKeyboardVisibleRef.current) {
      Keyboard.dismiss();
      return;
    }
    closeWithAnimation();
  }, [backdropEnabled, closeWithAnimation]);

  const content = (
    <View
      style={styles.screen}
      onLayout={event => {
        const nextHeight = event.nativeEvent.layout?.height ?? 0;
        console.log('[PostCommentScreen] layout', event.nativeEvent.layout);
        if (
          nextHeight > 0 &&
          Math.abs(nextHeight - screenHeightRef.current) > 1
        ) {
          screenHeightRef.current = nextHeight;
          if (baseHeightRef.current === 0) {
            baseHeightRef.current = nextHeight;
            const lockedBase = baseHeightRef.current;
            const targetHeight = Math.max(
              0,
              isExpandedRef.current
                ? lockedBase - topInset
                : Math.round(lockedBase * 0.7),
            );
            sheetHeightRef.current = targetHeight;
            sheetHeightValue.setValue(targetHeight);
            setIsLayoutReady(true);
            setBackdropEnabled(true);
            Animated.timing(backdropOpacity, {
              toValue: 1,
              duration: 180,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }).start();
          }
          setScreenHeight(nextHeight);
          if (
            pendingSheetSyncRef.current &&
            !isKeyboardVisibleRef.current &&
            baseHeightRef.current > 0
          ) {
            pendingSheetSyncRef.current = false;
            const lockedBase = baseHeightRef.current;
            const targetHeight = Math.max(
              0,
              isExpandedRef.current
                ? lockedBase - topInset
                : Math.round(lockedBase * 0.7),
            );
            if (Math.abs(targetHeight - sheetHeightRef.current) > 1) {
              sheetHeightRef.current = targetHeight;
              Animated.timing(sheetHeightValue, {
                toValue: targetHeight,
                duration: 200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
              }).start();
            }
          }
        }
      }}>
      <AnimatedPressable
        pointerEvents={backdropEnabled ? 'auto' : 'none'}
        style={[styles.backdrop, {opacity: backdropOpacity}]}
        onPress={handleBackdropPress}
      />
      <Animated.View
        style={[
          styles.sheetContainer,
          {opacity: isLayoutReady ? 1 : 0},
          {height: sheetHeightValue, transform: [{translateY: sheetTranslate}]},
        ]}
        ref={sheetContainerRef}>
        <View style={styles.sheetHandle} {...panResponder.panHandlers}>
          <View style={styles.commentSheetHandleIndicator} />
        </View>
        <View style={[styles.commentSheetHeader, {paddingTop: insets.top}]}>
          <CustomText style={styles.commentSheetTitle}>댓글</CustomText>
          <View style={styles.commentSortRow}>
            <Pressable
              onPress={() => handleChangeCommentSort('latest')}
              hitSlop={6}>
              <CustomText
                style={[
                  styles.commentSortText,
                  commentSortKey === 'latest' && styles.commentSortTextActive,
                ]}>
                최신순
              </CustomText>
            </Pressable>
            <Pressable
              onPress={() => handleChangeCommentSort('popular')}
              hitSlop={6}>
              <CustomText
                style={[
                  styles.commentSortText,
                  commentSortKey === 'popular' && styles.commentSortTextActive,
                ]}>
                인기순
              </CustomText>
            </Pressable>
          </View>
        </View>
        {showMoreMenu ? (
          <>
            <Pressable style={styles.moreMenuOverlay} onPress={closeMoreMenu} />
            <View
              style={[
                styles.moreMenu,
                {top: menuPosition.top, right: menuPosition.right},
              ]}>
              {!selectedMenuTarget?.isMine ? (
                <Pressable
                  style={styles.moreMenuItem}
                  onPress={() => {
                    closeMoreMenu();
                    handleReportPress(selectedMenuTarget);
                  }}>
                  <CustomText style={styles.moreMenuItemTextPrimary}>
                    신고하기
                  </CustomText>
                </Pressable>
              ) : null}
              {isPostWriter || selectedMenuTarget?.isMine ? (
                <Pressable
                  style={styles.moreMenuItem}
                  onPress={() => {
                    closeMoreMenu();
                    handleDeletePress(selectedMenuTarget);
                  }}>
                  <CustomText style={styles.moreMenuItemTextDestructive}>
                    삭제하기
                  </CustomText>
                </Pressable>
              ) : null}
            </View>
          </>
        ) : null}
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          overScrollMode="always"
          bounces
          scrollEnabled={!showMoreMenu}
          scrollEventThrottle={16}
          onScroll={handleCommentScroll}
          onScrollBeginDrag={handleScrollBeginDrag}
          onScrollEndDrag={handleScrollEndDrag}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          onLayout={event => {
            layoutHeightRef.current = event.nativeEvent.layout.height;
          }}
          onContentSizeChange={(_, height) => {
            contentHeightRef.current = height;
          }}
          onStartShouldSetResponderCapture={event => {
            responderStartYRef.current = event.nativeEvent.pageY;
            return false;
          }}
          onMoveShouldSetResponderCapture={event => {
            if (responderStartYRef.current == null) {
              responderStartYRef.current = event.nativeEvent.pageY;
              return false;
            }
            const startY = responderStartYRef.current;
            const deltaY = event.nativeEvent.pageY - startY;
            const isAtTop = scrollOffsetRef.current <= 0;
            const isShort =
              contentHeightRef.current <= layoutHeightRef.current + 1;
            return isAtTop && isShort && deltaY > 30;
          }}
          onResponderMove={event => {
            if (responderStartYRef.current == null) {
              return;
            }
            const startY = responderStartYRef.current;
            const deltaY = event.nativeEvent.pageY - startY;
            if (
              isReadyRef.current &&
              !isClosingRef.current &&
              scrollOffsetRef.current <= 0 &&
              contentHeightRef.current <= layoutHeightRef.current + 1 &&
              deltaY > 80
            ) {
              closeWithAnimation();
            }
          }}
          onResponderRelease={() => {
            responderStartYRef.current = null;
          }}
          contentContainerStyle={contentContainerStyle}>
          {commentList.length === 0 && isLoadingComments ? (
            <View style={styles.commentLoadingContainer}>
              <ActivityIndicator size="small" color="#9AA1AE" />
            </View>
          ) : commentList.length === 0 ? (
            <CustomText style={styles.commentEmptyText}>
              첫 댓글을 작성해보세요.
            </CustomText>
          ) : (
            commentList.map(comment => {
              const replies = Array.isArray(comment.replies)
                ? comment.replies
                : [];
              const replyCount = Number.isFinite(comment.replyCount)
                ? comment.replyCount
                : replies.length;
              const previewReplies = Array.isArray(comment.previewReplies)
                ? comment.previewReplies
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
              const isMenuTarget = selectedMenuTarget?.id === comment.id;
              const isExpanded = Boolean(expandedReplies[comment.id]);
              const isPreviewHidden = Boolean(hiddenPreviewReplies[comment.id]);
              const expandedReplyItems = mergeUnique(
                isExpanded
                  ? replies
                  : replies.length
                  ? replies
                  : previewReplies,
              );
              const previewVisibleCount =
                !isExpanded && !isPreviewHidden ? previewReplies.length : 0;
              const remainingReplyCount = Math.max(
                replyCount - previewVisibleCount,
                0,
              );
              const remainingExpandedCount = Math.max(
                replyCount - expandedReplyItems.length,
                0,
              );
              const hasLoadedAllReplies =
                Number.isFinite(comment.replyPage) &&
                expandedReplyItems.length >= replyCount;
              const isLoadingReplies = Boolean(loadingReplies[comment.id]);
              const isReplyTarget =
                replyTarget?.targetId !== null &&
                replyTarget?.targetId !== undefined &&
                String(replyTarget.targetId) === String(comment.id);

              return (
                <View key={comment.id} style={styles.commentGroup}>
                  <AnimatedPressable
                    style={[
                      styles.commentItem,
                      isMenuTarget ? styles.commentItemSelected : null,
                    ]}
                    onLongPress={() => handleCommentLongPress(comment)}
                    ref={node => {
                      if (node) {
                        itemMeasureMapRef.current[comment.id] = node;
                      }
                    }}
                    onLayout={event => {
                      const {y, height} = event.nativeEvent.layout;
                      setItemLayoutWithSize(comment.id, y, height);
                    }}>
                    <Animated.View
                      pointerEvents="none"
                      style={[
                        styles.commentHighlight,
                        isReplyTarget
                          ? {opacity: 1}
                          : getHighlightOpacityStyle(comment.id),
                      ]}
                    />
                    <Image
                      source={
                        comment.profileImage
                          ? {uri: comment.profileImage}
                          : defaultProfile
                      }
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentBody}>
                      <View style={styles.commentHeader}>
                        <CustomText style={styles.commentAuthor}>
                          {comment.author}
                        </CustomText>
                        <CustomText style={styles.commentDate}>
                          {comment.createdAt}
                        </CustomText>
                      </View>
                      {(() => {
                        const mention = comment.taggedUserNickname;
                        const textWithoutMention = mention
                          ? comment.text?.replace(
                              new RegExp(`^@${mention}\\s?`),
                              '',
                            )
                          : comment.text;
                        const shouldHideMention =
                          mention && mention === currentUserNickname;
                        console.log('[mention-check][comment]', {
                          mention,
                          currentUserNickname,
                          shouldHideMention,
                          author: comment.author,
                          id: comment.id,
                        });
                        const showMention = Boolean(
                          mention && !shouldHideMention,
                        );
                        return (
                          <CustomText style={styles.commentText}>
                            {showMention ? (
                              <>
                                <CustomText style={styles.commentMention}>
                                  @{mention}{' '}
                                </CustomText>
                                {textWithoutMention}
                              </>
                            ) : (
                              textWithoutMention
                            )}
                          </CustomText>
                        );
                      })()}
                      <Pressable
                        style={styles.commentReplyPressable}
                        onPress={() =>
                          handleReplyPress(
                            comment.author,
                            comment.id,
                            comment.rootCommentId ?? comment.id,
                            comment.writerId ?? null,
                          )
                        }>
                        <CustomText style={styles.commentReplyText}>
                          답글 달기
                        </CustomText>
                      </Pressable>
                    </View>
                    <View style={styles.commentLikeColumn}>
                      <Pressable
                        hitSlop={8}
                        onPress={() => handleCommentLikeToggle(comment.id)}>
                        <Ionicons
                          name={
                            commentLikeState[comment.id]
                              ? 'heart'
                              : 'heart-outline'
                          }
                          size={18}
                          color={
                            commentLikeState[comment.id] ? '#FF5E5E' : '#A0A5AE'
                          }
                        />
                      </Pressable>
                      <CustomText style={styles.commentLikeCount}>
                        {formatLikeCount(
                          (comment.likes ?? 0) +
                            (commentLikeState[comment.id] ? 1 : 0) -
                            (comment.isLiked ? 1 : 0),
                        )}
                      </CustomText>
                    </View>
                    {isMenuTarget ? (
                      <View
                        pointerEvents="none"
                        style={styles.commentItemDimmer}
                      />
                    ) : null}
                  </AnimatedPressable>
                  {isExpanded ? (
                    <View style={styles.commentReplyList}>
                      {expandedReplyItems.map(reply => {
                        const isReplyMenuTarget =
                          selectedMenuTarget?.id === reply.id;
                        const isReplyItemTarget =
                          replyTarget?.targetId !== null &&
                          replyTarget?.targetId !== undefined &&
                          String(replyTarget.targetId) === String(reply.id);
                        return (
                          <AnimatedPressable
                            key={reply.id}
                            style={[
                              styles.commentReplyItem,
                              isReplyMenuTarget
                                ? styles.commentItemSelected
                                : null,
                            ]}
                            onLongPress={() => handleCommentLongPress(reply)}
                            ref={node => {
                              if (node) {
                                itemMeasureMapRef.current[reply.id] = node;
                              }
                            }}
                            onLayout={event => {
                              const {y} = event.nativeEvent.layout;
                              setReplyListLayout(reply.id, y);
                            }}>
                            <Animated.View
                              pointerEvents="none"
                              style={[
                                styles.commentHighlight,
                                isReplyItemTarget
                                  ? {opacity: 1}
                                  : getHighlightOpacityStyle(reply.id),
                              ]}
                            />
                            <Image
                              source={
                                reply.profileImage
                                  ? {uri: reply.profileImage}
                                  : defaultProfile
                              }
                              style={styles.commentReplyAvatar}
                            />
                            <View style={styles.commentReplyBody}>
                              <View style={styles.commentReplyHeader}>
                                <CustomText style={styles.commentAuthor}>
                                  {reply.author}
                                </CustomText>
                                <CustomText style={styles.commentDate}>
                                  {reply.createdAt}
                                </CustomText>
                              </View>
                              {(() => {
                                const mention = reply.taggedUserNickname;
                                const textWithoutMention = mention
                                  ? reply.text?.replace(
                                      new RegExp(`^@${mention}\\s?`),
                                      '',
                                    )
                                  : reply.text;
                                const shouldHideMention =
                                  mention && mention === currentUserNickname;
                                console.log('[mention-check][reply-expanded]', {
                                  mention,
                                  currentUserNickname,
                                  shouldHideMention,
                                  author: reply.author,
                                  id: reply.id,
                                });
                                const showMention = Boolean(
                                  mention && !shouldHideMention,
                                );
                                return (
                                  <CustomText style={styles.commentText}>
                                    {showMention ? (
                                      <>
                                        <CustomText
                                          style={styles.commentMention}>
                                          @{mention}{' '}
                                        </CustomText>
                                        {textWithoutMention}
                                      </>
                                    ) : (
                                      textWithoutMention
                                    )}
                                  </CustomText>
                                );
                              })()}
                              <Pressable
                                style={styles.commentReplyPressable}
                                onPress={() =>
                                  handleReplyPress(
                                    reply.author,
                                    reply.id,
                                    reply.rootCommentId ?? comment.id,
                                    reply.writerId ?? null,
                                  )
                                }>
                                <CustomText style={styles.commentReplyText}>
                                  답글 달기
                                </CustomText>
                              </Pressable>
                            </View>
                            <View style={styles.commentReplyLikeColumn}>
                              <Pressable
                                hitSlop={8}
                                onPress={() =>
                                  handleCommentLikeToggle(reply.id)
                                }>
                                <Ionicons
                                  name={
                                    commentLikeState[reply.id]
                                      ? 'heart'
                                      : 'heart-outline'
                                  }
                                  size={18}
                                  color={
                                    commentLikeState[reply.id]
                                      ? '#FF5E5E'
                                      : '#A0A5AE'
                                  }
                                />
                              </Pressable>
                              <CustomText style={styles.commentLikeCount}>
                                {formatLikeCount(
                                  (reply.likes ?? 0) +
                                    (commentLikeState[reply.id] ? 1 : 0) -
                                    (reply.isLiked ? 1 : 0),
                                )}
                              </CustomText>
                            </View>
                            {isReplyMenuTarget ? (
                              <View
                                pointerEvents="none"
                                style={styles.commentItemDimmer}
                              />
                            ) : null}
                          </AnimatedPressable>
                        );
                      })}
                      {remainingExpandedCount > 0 ? (
                        <Pressable
                          style={[
                            styles.commentReplyToggle,
                            {
                              paddingLeft: 48,
                            },
                          ]}
                          disabled={isLoadingReplies}
                          onPress={() => {
                            if (hasLoadedAllReplies) {
                              return;
                            }
                            const nextPage = Number.isFinite(comment.replyPage)
                              ? comment.replyPage + 1
                              : 0;
                            requestReplies(comment.id, nextPage);
                          }}>
                          <View style={styles.commentReplyToggleLine} />
                          <CustomText style={[styles.commentReplyToggleText]}>
                            {isLoadingReplies
                              ? ''
                              : `답글 ${remainingExpandedCount}개 더보기`}
                          </CustomText>
                          {isLoadingReplies ? (
                            <ActivityIndicator size="small" color="#9AA1AE" />
                          ) : null}
                        </Pressable>
                      ) : (
                        <Pressable
                          style={[
                            styles.commentReplyToggle,
                            {
                              paddingLeft: 48,
                            },
                          ]}
                          onPress={() =>
                            setExpandedReplies(prev => ({
                              ...prev,
                              [comment.id]: false,
                            }))
                          }>
                          <View style={styles.commentReplyToggleLine} />
                          <CustomText style={[styles.commentReplyToggleText]}>
                            답글 접기
                          </CustomText>
                        </Pressable>
                      )}
                    </View>
                  ) : null}
                  {!isExpanded && !isPreviewHidden && previewReplies.length ? (
                    <View style={styles.commentReplyList}>
                      {previewReplies.map(reply => (
                        <View key={reply.id} style={styles.commentReplyItem}>
                          <Animated.View
                            pointerEvents="none"
                            style={[
                              styles.commentHighlight,
                              replyTarget?.targetId !== null &&
                              replyTarget?.targetId !== undefined &&
                              String(replyTarget.targetId) === String(reply.id)
                                ? {opacity: 1}
                                : getHighlightOpacityStyle(reply.id),
                            ]}
                          />
                          <Image
                            source={
                              reply.profileImage
                                ? {uri: reply.profileImage}
                                : defaultProfile
                            }
                            style={styles.commentReplyAvatar}
                          />
                          <View style={styles.commentReplyBody}>
                            <View style={styles.commentReplyHeader}>
                              <CustomText style={styles.commentAuthor}>
                                {reply.author}
                              </CustomText>
                              <CustomText style={styles.commentDate}>
                                {reply.createdAt}
                              </CustomText>
                            </View>
                            {(() => {
                              const mention = reply.taggedUserNickname;
                                const textWithoutMention = mention
                                  ? reply.text?.replace(
                                      new RegExp(`^@${mention}\\s?`),
                                      '',
                                    )
                                  : reply.text;
                                const shouldHideMention =
                                  mention && mention === currentUserNickname;
                                console.log('[mention-check][reply-preview]', {
                                  mention,
                                  currentUserNickname,
                                  shouldHideMention,
                                  author: reply.author,
                                  id: reply.id,
                                });
                                const showMention = Boolean(
                                  mention && !shouldHideMention,
                                );
                              return (
                                <CustomText style={styles.commentText}>
                                  {showMention ? (
                                    <>
                                      <CustomText style={styles.commentMention}>
                                        @{mention}{' '}
                                      </CustomText>
                                      {textWithoutMention}
                                    </>
                                  ) : (
                                    textWithoutMention
                                  )}
                                </CustomText>
                              );
                            })()}
                          </View>
                          <View style={styles.commentReplyLikeColumn}>
                            <Pressable
                              hitSlop={8}
                              onPress={() => handleCommentLikeToggle(reply.id)}>
                              <Ionicons
                                name={
                                  commentLikeState[reply.id]
                                    ? 'heart'
                                    : 'heart-outline'
                                }
                                size={18}
                                color={
                                  commentLikeState[reply.id]
                                    ? '#FF5E5E'
                                    : '#A0A5AE'
                                }
                              />
                            </Pressable>
                            <CustomText style={styles.commentLikeCount}>
                              {formatLikeCount(
                                (reply.likes ?? 0) +
                                  (commentLikeState[reply.id] ? 1 : 0) -
                                  (reply.isLiked ? 1 : 0),
                              )}
                            </CustomText>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {!isExpanded && previewVisibleCount > 0 ? (
                    remainingReplyCount > 0 ? (
                      <Pressable
                        style={[styles.commentReplyToggle, {paddingLeft: 48}]}
                        disabled={isLoadingReplies}
                        onPress={() => {
                          setHiddenPreviewReplies(prev => ({
                            ...prev,
                            [comment.id]: false,
                          }));
                          setExpandedReplies(prev => ({
                            ...prev,
                            [comment.id]: true,
                          }));
                          if (
                            !hasLoadedAllReplies &&
                            !Number.isFinite(comment.replyPage)
                          ) {
                            requestReplies(comment.id, 0);
                          }
                        }}>
                        <View style={styles.commentReplyToggleLine} />
                        <CustomText style={styles.commentReplyToggleText}>
                          {isLoadingReplies
                            ? '불러오는 중...'
                            : `답글 ${remainingReplyCount}개 더보기`}
                        </CustomText>
                        {isLoadingReplies ? (
                          <ActivityIndicator size="small" color="#9AA1AE" />
                        ) : null}
                      </Pressable>
                    ) : (
                      <Pressable
                        style={[styles.commentReplyToggle, {paddingLeft: 48}]}
                        onPress={() =>
                          setHiddenPreviewReplies(prev => ({
                            ...prev,
                            [comment.id]: true,
                          }))
                        }>
                        <View style={styles.commentReplyToggleLine} />
                        <CustomText style={styles.commentReplyToggleText}>
                          답글 접기
                        </CustomText>
                      </Pressable>
                    )
                  ) : null}
                  {!isExpanded &&
                  previewVisibleCount === 0 &&
                  replyCount > 0 ? (
                    <Pressable
                      style={[styles.commentReplyToggle, {paddingLeft: 48}]}
                      disabled={isLoadingReplies}
                      onPress={() => {
                        setHiddenPreviewReplies(prev => ({
                          ...prev,
                          [comment.id]: false,
                        }));
                        setExpandedReplies(prev => ({
                          ...prev,
                          [comment.id]: true,
                        }));
                        if (
                          !hasLoadedAllReplies &&
                          !Number.isFinite(comment.replyPage)
                        ) {
                          requestReplies(comment.id, 0);
                        }
                      }}>
                      <View style={styles.commentReplyToggleLine} />
                      <CustomText style={styles.commentReplyToggleText}>
                        {isLoadingReplies
                          ? '불러오는 중...'
                          : `답글 ${replyCount}개 더보기`}
                      </CustomText>
                      {isLoadingReplies ? (
                        <ActivityIndicator size="small" color="#9AA1AE" />
                      ) : null}
                    </Pressable>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
        <Animated.View
          style={[
            styles.commentInputWrapper,
            {
              transform: [{translateY: keyboardTranslate}],
            },
          ]}>
          <CommentFooter
            inputRef={inputRef}
            onChangeCommentInput={handleChangeCommentInput}
            onPressSend={handlePressSend}
            onFocusInput={handleInputFocus}
            onPressInput={handleInputPressIn}
            defaultProfileImage={defaultProfile}
            currentUserProfileImage={currentUserProfileImage}
            bottomInset={insets.bottom}
            replyTargetStore={replyTargetStoreRef}
            onClearReplyTarget={handleClearReplyTarget}
          />
        </Animated.View>
      </Animated.View>
      <PostReportBottomSheet
        sheetRef={reportSheetRef}
        reasons={COMMENT_REPORT_REASONS}
        selectedReason={selectedReportReason}
        onSelectReason={handleSelectReportReason}
        onSubmit={handleReportSubmit}
        title="댓글 신고하기"
      />
    </View>
  );

  if (Platform.OS === 'android') {
    return (
      <Portal>
        <BottomSheetModalProvider>{content}</BottomSheetModalProvider>
      </Portal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    zIndex: 10000,
    elevation: 10000,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sheetContainer: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
    zIndex: 10001,
    elevation: 10001,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  commentSheetHandleIndicator: {
    backgroundColor: '#E4E4E4',
    width: 48,
    height: 3,
    borderRadius: 2,
  },
  commentSheetHeader: {
    paddingBottom: 15,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F4',
  },
  commentSheetTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#222',
  },
  commentSheetContent: {
    paddingTop: 12,
    paddingBottom: 80,
    gap: 18,
  },
  commentSortRow: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 18,
  },
  commentSortText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#9AA1AE',
  },
  commentSortTextActive: {
    color: '#333',
  },
  moreMenuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 20,
  },
  moreMenu: {
    position: 'absolute',
    right: 16,
    top: 60,
    backgroundColor: '#fff',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
    minWidth: 140,
    zIndex: 21,
  },
  moreMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  moreMenuItemTextDestructive: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#E03131',
    textAlign: 'center',
  },
  moreMenuItemTextPrimary: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#007AFF',
    textAlign: 'center',
  },
  commentEmptyText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
    textAlign: 'center',
    paddingVertical: 24,
  },
  commentLoadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
    paddingHorizontal: 18,
    position: 'relative',
  },
  commentItemDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.08)',
    borderRadius: 8,
    zIndex: 2,
  },
  commentItemSelected: {
    transform: [{scale: 0.9}],
  },
  commentGroup: {
    gap: 6,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F2F2F2',
  },
  commentBody: {
    flex: 1,
    gap: 6,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
  },
  commentDate: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    lineHeight: 20,
  },
  commentMention: {
    color: '#3CBBFF',
  },
  commentReplyText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: ColorUtil.subText,
  },
  commentReplyPressable: {
    alignSelf: 'flex-start',
  },
  commentReplyList: {
    // gap: 14,
  },
  commentReplyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingLeft: 48,
    paddingRight: 18,
    paddingVertical: 7,
    position: 'relative',
  },
  commentHighlight: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: ColorUtil.mainChip,
  },
  commentReplyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F2F2F2',
  },
  commentReplyBody: {
    flex: 1,
    gap: 6,
  },
  commentReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentReplyLikeColumn: {
    width: 42,
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  commentReplyToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  commentReplyToggleLine: {
    width: 18,
    height: 1,
    backgroundColor: '#D6D9DF',
  },
  commentReplyToggleText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#9AA1AE',
  },
  commentLikeColumn: {
    width: 42,
    alignItems: 'center',
    gap: 4,
    paddingTop: 2,
  },
  commentLikeCount: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: '#8F96A3',
  },
  commentInputWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    elevation: 10,
  },
  commentInputBar: {
    borderTopWidth: 0.5,
    borderTopColor: '#E8EBF1',
    paddingHorizontal: 14,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
  },
  commentInputAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F2',
  },
  replyField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#E7ECEF',
    borderBottomWidth: 0,
    backgroundColor: '#F8F9F9',
    paddingHorizontal: 15,
  },
  replyTarget: {
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
    paddingVertical: 10,
    flex: 1,
    marginRight: 8,
  },
  commentInputField: {
    flex: 1,
    minHeight: 32,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E7ECEF',
    borderRadius: 20,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentInputFieldReply: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderRadius: 0,
    borderTopWidth: 0,
  },
  commentInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    marginLeft: 8,
    maxHeight: 80,
    padding: 0,
    margin: 0,
    paddingVertical: 12,
  },
  commentSendButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3CBBFF',
  },
});

export default PostCommentScreen;
