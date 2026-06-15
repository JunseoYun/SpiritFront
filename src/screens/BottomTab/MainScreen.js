import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  BackHandler,
  DeviceEventEmitter,
  Easing,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  ToastAndroid,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {openSettings} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useToast} from '../../context/ToastContext';

import RejectModal from '../../components/Reject/RejectModal';
import ExploreSearchBar from '../../components/ExploreScreen/ExploreSearchBar';
import NotificationButton from '../../components/ExploreScreen/NotificationButton';
import {has_unread_notification} from '../../api/notificationApi';
import useHandlePendingNotification from '../../hooks/notification/useHandlePendingNotification';
import PencilIcon from '../../assets/svg/PencilIcon';
import StoreIcon from '../../assets/svg/StoreIcon';
import VerifyIcon from '../../assets/svg/VerifyIcon';
import WriteMenu from '../../components/MainScreen/WriteMenu';
import WriteButton from '../../components/MainScreen/WriteButton';
import TopCarousel from '../../components/MainScreen/TopCarousel';
import {iniBasictNotification} from '../../hooks/notification/useNotificationPermission';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useNotification} from '../../context/NotificationContext';
import PostItem from '../../components/Post/PostItem';
import PostItemSkeleton from '../../components/Post/PostItemSkeleton';
import PostCommentSheet from '../../components/Post/PostCommentSheet';
import {getLocation} from '../../storage/locationStorage';
import {PostGetByPopular, PostGetByRecent} from '../../api/postApi';
import {PostDelete} from '../../api/reviewApi';
import {
  CommentCreate,
  CommentDelete,
  CommentGetByPost,
  CommentGetByRootComment,
  CommentLike,
} from '../../api/commentApi';
import {Userdataget} from '../../api/userApi';
import formatRelativeTime from '../../utils/formatRelativeTime';
import Loading from '../../hooks/Loading';
import {
  getCachedImageRatio,
  loadImageRatio,
  preloadImageRatios,
} from '../../utils/imageRatioCache';

const defaultProfile = require('../../assets/default_profile.png');
const COMMENT_SORTS = {
  latest: ['id,DESC'],
  popular: ['likeCount,DESC', 'id,DESC'],
};
const FEED_PAGE_SIZE = 10;
const PREFETCH_REMAINING_ITEMS = 3;

const MainScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {showToast} = useToast();
  const {height: windowHeight, width: windowWidth} = useWindowDimensions();
  const [rejectModalData, setRejectModalData] = useState(null);
  const [unreadNotification, setUnreadNotification] = useState(false);
  const [location, setLocation] = useState(null);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {pendingNotification, setPendingNotification} = useNotification();
  const [centeredItemId, setCenteredItemId] = useState(null);
  const [feedData, setFeedData] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedPage, setFeedPage] = useState(0);
  const [feedTotalPages, setFeedTotalPages] = useState(0);
  const [feedLoadingMore, setFeedLoadingMore] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const listRef = useRef(null);
  const listHeightRef = useRef(0);
  const itemLayoutsRef = useRef(new Map());
  const scrollOffsetRef = useRef(0);
  const allowLoadMore = useRef(false);
  const onEndReachedCalledDuringMomentum = useRef(false);
  const lastFetchCountRef = useRef(0);
  const feedDataLengthRef = useRef(0);
  const lastPrefetchPageRef = useRef(-1);
  const feedTotalPagesRef = useRef(0);
  const loadMorePendingRef = useRef(false);
  const pendingLoadMoreIdsRef = useRef(new Set());
  const loadMoreTimeoutRef = useRef(null);
  const firstPendingIndexRef = useRef(-1);
  const [showWriteLabel, setShowWriteLabel] = useState(true);
  const [isWriteMenuVisible, setIsWriteMenuVisible] = useState(false);
  const [isWriteMenuOpen, setIsWriteMenuOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
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
  const [topRollItems, setTopRollItems] = useState([]);
  const [topRollLoading, setTopRollLoading] = useState(true);
  const writeLabelVisibleRef = useRef(true);
  const WRITE_BUTTON_COLLAPSE_OFFSET = 20;
  const writeButtonAnim = useRef(new Animated.Value(1)).current;
  const writeLabelAnim = useRef(new Animated.Value(1)).current;
  const writeIconAnim = useRef(new Animated.Value(0)).current;
  const writeMenuAnim = useRef(new Animated.Value(0)).current;
  const headerTranslateY = useRef(new Animated.Value(0)).current;
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerHiddenRef = useRef(false);
  const lastScrollOffsetRef = useRef(0);
  const headerScrollAccumulatorRef = useRef(0);
  const lastScrollDirectionRef = useRef(0);
  const isSendingCommentRef = useRef(false);
  const isLoadingMoreCommentsRef = useRef(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const commentSheetRef = useRef(null);
  const topRollScrollRef = useRef(null);
  const isInitialLoading = feedLoading || topRollLoading;

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('ExploreScreen');
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  const commentSheetSnapPoints = useMemo(() => {
    const topInset = insets.top === 0 ? 20 : insets.top;
    return ['70%', Math.max(0, windowHeight - topInset)];
  }, [insets.top, windowHeight]);
  const closeWriteMenu = useCallback(() => {
    setIsWriteMenuOpen(false);
    const shouldShowLabel =
      scrollOffsetRef.current <= WRITE_BUTTON_COLLAPSE_OFFSET;
    if (shouldShowLabel && !writeLabelVisibleRef.current) {
      writeLabelVisibleRef.current = true;
      setShowWriteLabel(true);
    }
  }, []);
  const skeletonData = useMemo(
    () => Array.from({length: 4}, (_, index) => `skeleton-${index}`),
    [],
  );
  const topRollSkeleton = useMemo(
    () => Array.from({length: 10}, (_, index) => `top-skeleton-${index}`),
    [],
  );
  const loadMorePadding = 24;
  const HEADER_TOGGLE_THRESHOLD = 28;
  const HEADER_ANIM_HIDE_DURATION = 300;
  const HEADER_ANIM_SHOW_DURATION = 340;
  const headerHideOffset = Math.max(0, headerHeight - insets.top);
  const mapPostItem = useCallback(post => {
    return {
      id: String(post.id ?? ''),
      nickname: post.writerNickname ?? '게스트',
      profileImage: post.writerImgUrl ?? null,
      postImages: Array.isArray(post.postImgUrlList) ? post.postImgUrlList : [],
      storeId: post.storeId ?? null,
      storeAddress: post.address ?? '',
      name: post.storeName ?? '',
      content: post.content ?? '',
      likes: post.likeCount ?? post.likes ?? 0,
      comments: post.commentCount ?? 0,
      shares: post.shareCount ?? 0,
      isWriter: post.isWriter ?? false,
      isLiked: post.isLiked ?? false,
      isSaved: post.isSaved ?? false,
      isStoreDeleted: post.isStoreDeleted ?? false,
      rate: post.rate ?? null,
      createdAt: post.createdAt ?? null,
      place: post.place ?? null,
    };
  }, []);
  const fetchTopRoll = useCallback(async () => {
    setTopRollLoading(true);
    try {
      const data = await PostGetByPopular({page: 0});
      const items = (data?.content ?? []).slice(0, 10).map(item => ({
        id: String(item.id ?? ''),
        uri: item.firstImgUrl ?? null,
        profileUri: item.writerImgUrl ?? null,
        name: item.writerNickname ?? '',
        likes: item.likeCount ?? 0,
      }));
      setTopRollItems(items);
    } catch (error) {
      setTopRollItems([]);
    } finally {
      setTopRollLoading(false);
    }
  }, []);
  const refreshFeed = useCallback(() => {
    allowLoadMore.current = false;
    setFeedPage(0);
    setFeedTotalPages(0);
    feedTotalPagesRef.current = 0;
    fetchTopRoll();
    fetchPosts({page: 0, isRefresh: true});
  }, [fetchPosts, fetchTopRoll]);
  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({offset: 0, animated: true});
    // refreshFeed();
  }, [refreshFeed]);

  useFocusEffect(
    useCallback(() => {
      navigation.setParams({scrollToTop: handleScrollToTop});
    }, [navigation, handleScrollToTop]),
  );

  const writeMenuItems = [
    {
      key: 'post',
      label: '게시글',
      icon: 'edit',
    },
    {
      key: 'store',
      label: '매장 제보',
      icon: 'plus-square',
    },
    {
      key: 'owner',
      label: '사장님 인증',
      icon: 'check-circle',
    },
  ];

  useHandlePendingNotification(
    false,
    pendingNotification,
    () => setPendingNotification(null),
    data => setRejectModalData(data),
  );

  useEffect(() => {
    fetchTopRoll();
  }, [fetchTopRoll]);

  const firstPendingIndex = useMemo(() => {
    for (let i = 0; i < feedData.length; i += 1) {
      const item = feedData[i];
      if (!item || item.__isLoadingMore) {
        continue;
      }
      const needsRatio = item.postImages?.length > 0 && !item.initialImageRatio;
      if (needsRatio) {
        return i;
      }
    }
    return -1;
  }, [feedData]);
  firstPendingIndexRef.current = firstPendingIndex;

  const targetVisibleCount = useMemo(() => {
    if (isInitialLoading) {
      return skeletonData.length;
    }
    if (firstPendingIndex === -1) {
      return feedData.length;
    }
    return firstPendingIndex + 1; // include the pending item (skeleton)
  }, [
    feedData.length,
    firstPendingIndex,
    isInitialLoading,
    skeletonData.length,
  ]);

  const visibleCount = targetVisibleCount;

  const visibleFeedData = useMemo(() => {
    const count = Math.max(0, Math.min(visibleCount, feedData.length));
    const sliceData = isInitialLoading
      ? skeletonData.slice(0, count)
      : feedData.slice(0, count);

    // 마지막에 스켈레톤 1개를 추가해 빈 공간 대신 채워준다.
    const needsSkeletonTail =
      !isInitialLoading &&
      firstPendingIndex !== -1 &&
      count === firstPendingIndex + 1;
    return needsSkeletonTail
      ? [...sliceData, {id: 'pending-tail', __pendingTail: true}]
      : sliceData;
  }, [
    feedData,
    firstPendingIndex,
    isInitialLoading,
    skeletonData,
    visibleCount,
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
    const checkStoredNotification = async () => {
      const stored = await AsyncStorage.getItem('PENDING_NOTIFICATION');
      if (stored) {
        try {
          const data = JSON.parse(stored);
          setPendingNotification(data);
          await AsyncStorage.removeItem('PENDING_NOTIFICATION');
        } catch (e) {}
      }
    };

    checkStoredNotification();
  }, [setPendingNotification]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const storedLocation = await getLocation();
        if (storedLocation) {
          setLocation(storedLocation);
        }
      } catch (error) {}
    };

    fetchLocation();
  }, []);

  const fetchPosts = useCallback(
    async ({page = 0, isRefresh = false} = {}) => {
      const isPaging = page > 0 && !isRefresh;
      if (isRefresh) {
        setRefreshing(true);
        setFeedLoading(true);
      } else if (isPaging) {
        setFeedLoadingMore(true);
        loadMorePendingRef.current = true;
        setFeedData(prev => {
          if (prev.some(item => item?.__isLoadingMore)) {
            return prev;
          }
          return [...prev, {id: 'loading-more', __isLoadingMore: true}];
        });
      } else {
        setFeedLoading(true);
      }
      try {
        const data = await PostGetByRecent({page, size: FEED_PAGE_SIZE});
        const mapped = (data?.content ?? []).map(post => ({
          ...mapPostItem(post),
          __page: page,
        }));
        preloadImageRatios(mapped.flatMap(post => post?.postImages ?? []));

        // 비율 측정은 백그라운드로 돌리고, 결과가 오면 해당 아이템만 갱신한다.
        mapped.forEach(post => {
          if (post.initialImageRatio || !post.postImages?.[0]) {
            return;
          }
          const firstUri = post.postImages[0];
          const cached = getCachedImageRatio(firstUri);
          if (cached) {
            post.initialImageRatio = cached;
            return;
          }
          loadImageRatio(firstUri).then(ratio => {
            if (!ratio) {
              return;
            }
            setFeedData(prev =>
              prev.map(item =>
                String(item?.id) === String(post.id)
                  ? {...item, initialImageRatio: ratio}
                  : item,
              ),
            );
          });
        });
        lastFetchCountRef.current = mapped.length;
        if (isPaging) {
          const nextPending = new Set(
            mapped
              .filter(item => item?.id && item?.postImages?.length)
              .map(item => item.id),
          );
          pendingLoadMoreIdsRef.current = nextPending;
          if (loadMoreTimeoutRef.current) {
            clearTimeout(loadMoreTimeoutRef.current);
            loadMoreTimeoutRef.current = null;
          }
          if (nextPending.size === 0) {
            loadMorePendingRef.current = false;
            setFeedLoadingMore(false);
          } else {
            loadMoreTimeoutRef.current = setTimeout(() => {
              loadMorePendingRef.current = false;
              setFeedLoadingMore(false);
              pendingLoadMoreIdsRef.current.clear();
              loadMoreTimeoutRef.current = null;
            }, 1500);
          }
        }
        const totalPages = Number.isFinite(data?.totalPages)
          ? data.totalPages
          : feedTotalPagesRef.current;
        feedTotalPagesRef.current = totalPages ?? 0;
        setFeedTotalPages(feedTotalPagesRef.current);
        setFeedData(prev => {
          if (!isPaging) {
            return mapped;
          }
          const withoutLoading = prev.filter(item => !item?.__isLoadingMore);
          const merged = [...withoutLoading, ...mapped];
          return Array.from(
            new Map(merged.map(item => [item.id, item])).values(),
          );
        });
        const reachedEnd =
          totalPages && totalPages > 0
            ? page >= totalPages - 1
            : mapped.length === 0;
        if (reachedEnd) {
          allowLoadMore.current = false;
        }
        if (!isPaging) {
          setFeedPage(0);
          lastPrefetchPageRef.current = -1;
        }
      } catch (error) {
        lastFetchCountRef.current = 0;
      } finally {
        if (isRefresh) {
          setRefreshing(false);
          setFeedLoading(false);
          listRef.current?.scrollToOffset({offset: 0, animated: true});
          topRollScrollRef.current?.scrollTo({x: 0, y: 0, animated: true});
        } else if (isPaging) {
          if (lastFetchCountRef.current === 0) {
            loadMorePendingRef.current = false;
            setFeedLoadingMore(false);
            if (loadMoreTimeoutRef.current) {
              clearTimeout(loadMoreTimeoutRef.current);
              loadMoreTimeoutRef.current = null;
            }
            setFeedData(prev => prev.filter(item => !item?.__isLoadingMore));
          }
        } else {
          setFeedLoading(false);
        }
        if (!isPaging) {
          itemLayoutsRef.current.clear();
          allowLoadMore.current = false;
          setTimeout(() => {
            allowLoadMore.current = true;
          }, 300);
        }
      }
    },
    [mapPostItem],
  );

  const handlePrimaryImageLoad = useCallback(itemId => {
    if (!loadMorePendingRef.current || !itemId) {
      return;
    }
    if (!pendingLoadMoreIdsRef.current.has(itemId)) {
      return;
    }
    pendingLoadMoreIdsRef.current.delete(itemId);
    if (pendingLoadMoreIdsRef.current.size === 0) {
      loadMorePendingRef.current = false;
      setFeedLoadingMore(false);
      if (loadMoreTimeoutRef.current) {
        clearTimeout(loadMoreTimeoutRef.current);
        loadMoreTimeoutRef.current = null;
      }
    }
  }, []);

  useEffect(() => {
    if (!feedLoadingMore) {
      setFeedData(prev => prev.filter(item => !item?.__isLoadingMore));
    }
  }, [feedLoadingMore]);

  useEffect(() => {
    fetchPosts({page: 0});
  }, [fetchPosts]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('SearchScreen');
  }, [navigation]);

  const loadHeaderData = useCallback(async () => {
    try {
      const unread = await has_unread_notification();
      setUnreadNotification(unread.hasUnread);
    } catch (error) {}
  }, []);

  useEffect(() => {
    loadHeaderData();
  }, [loadHeaderData]);

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
        setFeedData(prev =>
          prev.map(item => {
            if (String(item?.id) !== String(targetId)) {
              return item;
            }
            const nextLikes = payload?.likeCount ?? item?.likes ?? 0;
            return {
              ...item,
              isLiked: payload?.liked ?? item?.isLiked ?? false,
              likes: nextLikes,
            };
          }),
        );
        setSelectedFeed(prev => {
          if (!prev || String(prev?.id) !== String(targetId)) {
            return prev;
          }
          const nextLikes = payload?.likeCount ?? prev?.likes ?? 0;
          return {
            ...prev,
            isLiked: payload?.liked ?? prev?.isLiked ?? false,
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
        setFeedData(prev =>
          prev.map(item =>
            String(item?.id) === String(targetId)
              ? {
                  ...item,
                  isSaved: payload?.saved ?? item?.isSaved ?? false,
                }
              : item,
          ),
        );
        setSelectedFeed(prev => {
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
    const editSub = DeviceEventEmitter.addListener('post-updated', payload => {
      const updated = payload?.review;
      if (!updated?.id) {
        return;
      }
      const normalizeImages = source => {
        if (Array.isArray(source)) {
          return source.filter(Boolean);
        }
        return [];
      };
      const nextImages = normalizeImages(
        updated.postImgUrlList ?? updated.imgUrlList,
      );
      setFeedData(prev =>
        prev.map(item =>
          String(item?.id) === String(updated.id)
            ? {
                ...item,
                content: updated.content ?? item?.content ?? '',
                rate:
                  updated.rate ??
                  updated.rating ??
                  item?.rate ??
                  item?.rating ??
                  null,
                postImages: nextImages.length ? nextImages : item?.postImages,
              }
            : item,
        ),
      );
      setSelectedFeed(prev => {
        if (!prev || String(prev?.id) !== String(updated.id)) {
          return prev;
        }
        return {
          ...prev,
          content: updated.content ?? prev?.content ?? '',
          rate:
            updated.rate ??
            updated.rating ??
            prev?.rate ??
            prev?.rating ??
            null,
          postImages:
            nextImages.length > 0 ? nextImages : prev?.postImages ?? [],
        };
      });
    });
    return () => {
      likeSub.remove();
      savedSub.remove();
      editSub.remove();
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
    setFeedData(prev =>
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
              comment => String(comment.id) !== String(mappedComment.id),
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
      currentUserId,
      currentUserNickname,
      currentUserProfileImage,
      fetchComments,
      mapCommentItem,
      selectedFeed?.id,
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
      setCommentTotalCount(null);
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

  const handleEditPress = useCallback(
    item => {
      if (!item) {
        return;
      }
      const review = {
        id: item?.id,
        postImgUrlList: Array.isArray(item?.postImages) ? item.postImages : [],
        storeName: item?.name ?? '',
        storeAddress: item?.storeAddress ?? '',
        content: item?.content ?? '',
        rate: item?.rate ?? 0,
      };
      navigation.navigate('MyPostEditScreen', {
        review,
        returnTo: 'MainScreen',
      });
    },
    [navigation],
  );

  const handleDeletePress = useCallback(
    async item => {
      if (!item?.id) {
        return;
      }
      try {
        setIsDeleting(true);
        await PostDelete(item.id);
        setFeedData(prev =>
          prev.filter(feedItem => String(feedItem.id) !== String(item.id)),
        );
        itemLayoutsRef.current.delete(String(item.id));
        showToast('삭제가 완료되었습니다.');
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
    [showAlert, showToast],
  );

  const handleGoToSettings = useCallback(() => {
    openSettings().catch(() => {});
  }, []);

  // Track the feed item sitting closest to the vertical center of the screen.
  const updateCenteredItem = useCallback(
    (offsetY = scrollOffsetRef.current) => {
      const listHeight = listHeightRef.current;
      if (!listHeight || itemLayoutsRef.current.size === 0) {
        return;
      }

      const centerY = offsetY + listHeight / 2;
      let closestId = null;
      let closestDistance = Infinity;

      itemLayoutsRef.current.forEach((layout, id) => {
        const start = layout.y;
        const end = layout.y + layout.height;
        const distance =
          centerY >= start && centerY <= end
            ? 0
            : Math.min(Math.abs(centerY - start), Math.abs(centerY - end));

        if (distance < closestDistance) {
          closestDistance = distance;
          closestId = id;
        }
      });

      if (closestId) {
        setCenteredItemId(prev => (prev === closestId ? prev : closestId));
      }
    },
    [],
  );

  const handleListLayout = useCallback(
    event => {
      listHeightRef.current = event.nativeEvent.layout.height;
      updateCenteredItem();
    },
    [updateCenteredItem],
  );

  const handleItemLayout = useCallback(
    (id, layout) => {
      if (!layout) {
        return;
      }
      itemLayoutsRef.current.set(id, layout);
      updateCenteredItem();
    },
    [updateCenteredItem],
  );

  const handleScroll = useCallback(
    event => {
      const offsetY = event.nativeEvent.contentOffset.y;
      const deltaY = offsetY - lastScrollOffsetRef.current;
      const absDelta = Math.abs(deltaY);
      const direction = deltaY > 0 ? 1 : deltaY < 0 ? -1 : 0;
      scrollOffsetRef.current = offsetY;
      updateCenteredItem(offsetY);

      // Collapse the write button label after a small scroll.
      const shouldShowLabel = offsetY <= WRITE_BUTTON_COLLAPSE_OFFSET;
      if (shouldShowLabel !== writeLabelVisibleRef.current) {
        writeLabelVisibleRef.current = shouldShowLabel;
        setShowWriteLabel(shouldShowLabel);
      }

      if (direction !== 0 && direction !== lastScrollDirectionRef.current) {
        headerScrollAccumulatorRef.current = 0;
        lastScrollDirectionRef.current = direction;
      }
      if (direction !== 0) {
        headerScrollAccumulatorRef.current += absDelta;
      }

      if (offsetY <= 0) {
        headerScrollAccumulatorRef.current = 0;
        if (headerHiddenRef.current) {
          headerHiddenRef.current = false;
          Animated.parallel([
            Animated.timing(headerTranslateY, {
              toValue: 0,
              duration: HEADER_ANIM_SHOW_DURATION,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
            Animated.timing(headerOpacity, {
              toValue: 1,
              duration: HEADER_ANIM_SHOW_DURATION,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            }),
          ]).start();
        }
      } else if (headerHeight > 0) {
        const shouldToggle =
          headerScrollAccumulatorRef.current >= HEADER_TOGGLE_THRESHOLD;
        if (shouldToggle) {
          if (direction > 0 && !headerHiddenRef.current) {
            headerHiddenRef.current = true;
            headerScrollAccumulatorRef.current = 0;
            Animated.parallel([
              Animated.timing(headerTranslateY, {
                toValue: -headerHideOffset,
                duration: HEADER_ANIM_HIDE_DURATION,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(headerOpacity, {
                toValue: 0,
                duration: HEADER_ANIM_HIDE_DURATION,
                easing: Easing.inOut(Easing.cubic),
                useNativeDriver: true,
              }),
            ]).start();
          } else if (direction < 0 && headerHiddenRef.current) {
            headerHiddenRef.current = false;
            headerScrollAccumulatorRef.current = 0;
            Animated.parallel([
              Animated.timing(headerTranslateY, {
                toValue: 0,
                duration: HEADER_ANIM_SHOW_DURATION,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(headerOpacity, {
                toValue: 1,
                duration: HEADER_ANIM_SHOW_DURATION,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]).start();
          }
        }
      }

      lastScrollOffsetRef.current = offsetY;
    },
    [
      updateCenteredItem,
      headerHeight,
      headerHideOffset,
      headerTranslateY,
      headerOpacity,
    ],
  );

  useEffect(() => {
    Animated.parallel([
      Animated.timing(writeButtonAnim, {
        toValue: showWriteLabel ? 1 : 0,
        duration: showWriteLabel ? 240 : 170,
        easing: showWriteLabel
          ? Easing.out(Easing.cubic)
          : Easing.in(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.timing(writeLabelAnim, {
        toValue: showWriteLabel ? 1 : 0,
        duration: showWriteLabel ? 200 : 200,
        delay: showWriteLabel ? 70 : 0,
        easing: showWriteLabel
          ? Easing.out(Easing.cubic)
          : Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, [showWriteLabel, writeButtonAnim, writeLabelAnim]);

  useEffect(() => {
    Animated.timing(writeIconAnim, {
      toValue: isWriteMenuOpen ? 1 : 0,
      duration: 200,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();

    const menuAnim = Animated.timing(writeMenuAnim, {
      toValue: isWriteMenuOpen ? 1 : 0,
      duration: isWriteMenuOpen ? 200 : 200,
      easing: isWriteMenuOpen
        ? Easing.out(Easing.cubic)
        : Easing.in(Easing.quad),
      useNativeDriver: true,
    });

    menuAnim.start(({finished}) => {
      if (finished && !isWriteMenuOpen) {
        setIsWriteMenuVisible(false);
      }
    });
  }, [isWriteMenuOpen, writeIconAnim, writeMenuAnim]);

  useEffect(() => {
    if (headerHeight > 0 && headerHiddenRef.current) {
      headerTranslateY.setValue(-headerHideOffset);
      headerOpacity.setValue(0);
    }
  }, [headerHeight, headerHideOffset, headerTranslateY, headerOpacity]);

  const cellRenderer = useCallback(
    ({item, index, style, onLayout, children, ...rest}) => (
      <View
        {...rest}
        style={style}
        onLayout={event => {
          const itemId = item?.id ?? item;
          if (itemId) {
            handleItemLayout(itemId, event.nativeEvent.layout);
          }
          onLayout?.(event);
        }}>
        {children}
      </View>
    ),
    [handleItemLayout],
  );

  const closeMoreMenus = useCallback(() => {
    DeviceEventEmitter.emit('feed-more-menu-close');
  }, []);

  const handleScrollBeginDrag = useCallback(() => {
    closeMoreMenus();
    if (isWriteMenuOpen) {
      closeWriteMenu();
    }
  }, [closeMoreMenus, closeWriteMenu, isWriteMenuOpen]);

  const handleLoadMore = useCallback(() => {
    if (
      feedLoading ||
      feedLoadingMore ||
      refreshing ||
      !allowLoadMore.current
    ) {
      return;
    }
    if (feedTotalPages && feedPage >= feedTotalPages - 1) {
      return;
    }
    setFeedPage(prevPage => {
      const nextPage = prevPage + 1;
      fetchPosts({page: nextPage});
      return nextPage;
    });
  }, [
    feedLoading,
    feedLoadingMore,
    refreshing,
    feedTotalPages,
    feedPage,
    fetchPosts,
  ]);

  const handleViewableItemsChanged = useCallback(
    ({viewableItems}) => {
      if (
        feedLoading ||
        feedLoadingMore ||
        refreshing ||
        !allowLoadMore.current
      ) {
        return;
      }
      if (lastFetchCountRef.current < FEED_PAGE_SIZE) {
        return;
      }
      if (feedTotalPages && feedPage >= feedTotalPages - 1) {
        return;
      }
      const maxIndex = viewableItems.reduce(
        (max, item) => (item.index > max ? item.index : max),
        -1,
      );
      if (maxIndex < 0) {
        return;
      }
      const triggerIndex = feedDataLengthRef.current - PREFETCH_REMAINING_ITEMS;
      if (
        maxIndex >= triggerIndex &&
        lastPrefetchPageRef.current !== feedPage
      ) {
        lastPrefetchPageRef.current = feedPage;
        handleLoadMore();
      }
    },
    [
      feedLoading,
      feedLoadingMore,
      refreshing,
      feedTotalPages,
      feedPage,
      handleLoadMore,
    ],
  );

  useEffect(() => {
    feedDataLengthRef.current = isInitialLoading
      ? skeletonData.length
      : visibleFeedData.length;
  }, [isInitialLoading, skeletonData.length, visibleFeedData.length]);

  useFocusEffect(
    useCallback(() => {
      loadHeaderData();
    }, [loadHeaderData]),
  );

  const handleWritePress = useCallback(() => {
    setIsWriteMenuOpen(prev => {
      const next = !prev;
      if (next) {
        setIsWriteMenuVisible(true);
      }
      if (next && writeLabelVisibleRef.current) {
        writeLabelVisibleRef.current = false;
        setShowWriteLabel(false);
      }

      if (!next) {
        const shouldShowLabel =
          scrollOffsetRef.current <= WRITE_BUTTON_COLLAPSE_OFFSET;
        if (shouldShowLabel && !writeLabelVisibleRef.current) {
          writeLabelVisibleRef.current = true;
          setShowWriteLabel(true);
        }
      }
      return next;
    });
  }, []);

  const handleWriteMenuItemPress = useCallback(
    async key => {
      closeWriteMenu();

      if (key === 'post') {
        navigation.navigate('PostPhotoSelectScreen');
        return;
      }

      if (key === 'store') {
        navigation.navigate('StoreSearchScreen', {index: 0, location});
        return;
      }

      if (key === 'owner') {
        const isAuthorized = await iniBasictNotification(1);
        if (isAuthorized) {
          navigation.navigate('StoreSearchScreen', {index: 1, location});
        } else {
          showAlert({
            title: '알림 미설정',
            message: '사장님 인증 결과를 받기 위해\n알림 권한이 필요해요',
            type: 'notificationSetting',
            onConfirm: handleGoToSettings,
            onCancel: () => {},
          });
        }
        return;
      }

    },
    [closeWriteMenu, navigation, location, handleGoToSettings, showAlert],
  );

  const writeIconRotation = writeIconAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
  });

  const writeMenuStyle = {
    opacity: writeMenuAnim,
    transform: [
      {
        scale: writeMenuAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      },
      {
        translateY: writeMenuAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [40, 0],
        }),
      },
    ],
  };

  const headerTopPadding = insets.top + (Platform.OS === 'android' ? 10 : 0);
  const refreshControlOffset =
    Platform.OS === 'android'
      ? Math.max(headerHeight, headerTopPadding + 40)
      : undefined;
  const fabBottomOffset = 20;
  const menuBottomOffset = useMemo(
    () => fabBottomOffset + 62,
    [fabBottomOffset],
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <Animated.View
        onLayout={event => {
          const nextHeight = event.nativeEvent.layout.height;
          if (nextHeight && nextHeight !== headerHeight) {
            setHeaderHeight(nextHeight);
          }
        }}
        style={[
          styles.header,
          {
            paddingTop: headerTopPadding + 6,
            transform: [{translateY: headerTranslateY}],
            opacity: headerOpacity,
          },
        ]}>
        <View style={styles.headerRow}>
          <ExploreSearchBar handleSearchPress={handleSearchPress} />
          <View style={styles.topView}>
            <NotificationButton
              unreadNotification={unreadNotification}
              floating={false}
              iconColor="#181a1a"
              badgeColor="#3CBBFF"
            />
          </View>
        </View>
      </Animated.View>

      <FlatList
        ref={listRef}
        data={isInitialLoading ? skeletonData : visibleFeedData}
        keyExtractor={(item, index) =>
          isInitialLoading ? item : item.id ?? `${index}`
        }
        ListHeaderComponent={
          (topRollLoading || topRollItems.length > 0) && (
            <TopCarousel
              topRollScrollRef={topRollScrollRef}
              topRollLoading={topRollLoading}
              topRollSkeleton={topRollSkeleton}
              topRollItems={topRollItems}
              navigation={navigation}
            />
          )
        }
        ListHeaderComponentStyle={styles.topCarouselHeaderGap}
        renderItem={({item, index}) => {
          if (item?.__pendingTail) {
            return <PostItemSkeleton />;
          }

          if (isInitialLoading || item?.__isLoadingMore) {
            return <PostItemSkeleton />;
          }

          const needsRatio =
            item?.postImages?.length > 0 && !item?.initialImageRatio;

          if (needsRatio) {
            return <PostItemSkeleton />;
          }

          return (
            <PostItem
              item={item}
              onCommentPress={handleOpenCommentSheet}
              onPrimaryImageLoad={() => handlePrimaryImageLoad(item.id)}
              isCentered={item.id === centeredItemId}
              isWriter={item.isWriter}
              onEditPress={handleEditPress}
              onDeletePress={handleDeletePress}
              initialImageRatio={item.initialImageRatio}
            />
          );
        }}
        contentContainerStyle={[
          styles.feedContent,
          {
            paddingTop:
              insets.top +
              (Platform.OS === 'android' ? 40 : 0) +
              (insets.top === 0 && 40),
            paddingBottom: loadMorePadding,
          },
        ]}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!isInitialLoading}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshFeed}
            progressViewOffset={refreshControlOffset}
          />
        }
        onScrollBeginDrag={handleScrollBeginDrag}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={handleListLayout}
        CellRendererComponent={cellRenderer}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{itemVisiblePercentThreshold: 60}}
        onMomentumScrollBegin={() => {
          onEndReachedCalledDuringMomentum.current = false;
        }}
        onEndReached={() => {
          if (
            !onEndReachedCalledDuringMomentum.current &&
            allowLoadMore.current
          ) {
            handleLoadMore();
            onEndReachedCalledDuringMomentum.current = true;
          }
        }}
        onEndReachedThreshold={0.9}
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

      <WriteMenu
        visible={isWriteMenuVisible}
        bottomOffset={menuBottomOffset}
        menuStyle={writeMenuStyle}
        items={writeMenuItems}
        onClose={handleWritePress}
        onItemPress={handleWriteMenuItemPress}
        renderIcon={item => {
          if (item.key === 'post') {
            return <PencilIcon size={22} color="#3CBBFF" />;
          }
          if (item.key === 'store') {
            return <StoreIcon size={22} color="#308FF5" />;
          }
          if (item.key === 'owner') {
            return <VerifyIcon size={22} color="#2563EB" />;
          }
          return null;
        }}
      />

      <WriteButton
        isOpen={isWriteMenuOpen}
        onPress={handleWritePress}
        writeButtonAnim={writeButtonAnim}
        writeLabelAnim={writeLabelAnim}
        writeIconRotation={writeIconRotation}
        bottom={fabBottomOffset}
      />

      {rejectModalData && (
        <RejectModal
          data={rejectModalData}
          onClose={() => setRejectModalData(null)}
        />
      )}
      <AlertComponent />
      <Loading loading={refreshing || isDeleting} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingBottom: 10,
    backgroundColor: '#FFF',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    // elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    gap: 16,
  },
  topView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedContent: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  topCarouselHeaderGap: {
    marginBottom: 14,
  },
});

export default MainScreen;
