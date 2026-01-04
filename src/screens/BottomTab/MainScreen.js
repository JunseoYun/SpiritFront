import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  DeviceEventEmitter,
  Easing,
  FlatList,
  Platform,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {openSettings} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
import {iniBasictNotification} from '../../hooks/notification/useNotificationPermission';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useNotification} from '../../context/NotificationContext';
import PostItem from '../../components/Post/PostItem';
import PostItemSkeleton from '../../components/Post/PostItemSkeleton';
import PostCommentSheet from '../../components/Post/PostCommentSheet';
import {getLocation} from '../../storage/locationStorage';
import {PostGetByRecent} from '../../api/postApi';
import Loading from '../../hooks/Loading';

const defaultProfile = require('../../assets/default_profile.png');
const FEED_PAGE_SIZE = 10;
const PREFETCH_REMAINING_ITEMS = 3;

const MainScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const {height: windowHeight} = useWindowDimensions();
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
  const [showWriteLabel, setShowWriteLabel] = useState(true);
  const [isWriteMenuVisible, setIsWriteMenuVisible] = useState(false);
  const [isWriteMenuOpen, setIsWriteMenuOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [commentLikeState, setCommentLikeState] = useState({});
  const [commentInput, setCommentInput] = useState('');
  const writeLabelVisibleRef = useRef(true);
  const WRITE_BUTTON_COLLAPSE_OFFSET = 20;
  const writeButtonAnim = useRef(new Animated.Value(1)).current;
  const writeLabelAnim = useRef(new Animated.Value(1)).current;
  const writeIconAnim = useRef(new Animated.Value(0)).current;
  const writeMenuAnim = useRef(new Animated.Value(0)).current;
  const commentSheetRef = useRef(null);
  const commentSheetSnapPoints = useMemo(
    () => ['70%', Math.max(0, windowHeight - insets.top)],
    [insets.top, windowHeight],
  );
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
  const refreshFeed = useCallback(() => {
    allowLoadMore.current = false;
    setFeedPage(0);
    setFeedTotalPages(0);
    feedTotalPagesRef.current = 0;
    fetchPosts({page: 0, isRefresh: true});
  }, [fetchPosts]);
  const handleScrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({offset: 0, animated: true});
    //TODO 탭 재클릭 새로고침
    // refreshFeed();
  }, [refreshFeed]);

  useEffect(() => {
    navigation.setParams({scrollToTop: handleScrollToTop});
  }, [navigation, handleScrollToTop]);

  const writeMenuItems = [
    {
      key: 'post',
      label: '게시글 작성',
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

  const fetchPosts = useCallback(async ({page = 0, isRefresh = false} = {}) => {
    const isPaging = page > 0 && !isRefresh;
    if (isRefresh) {
      setRefreshing(true);
    } else if (isPaging) {
      setFeedLoadingMore(true);
    } else {
      setFeedLoading(true);
    }
    try {
      const data = await PostGetByRecent({page, size: FEED_PAGE_SIZE});
      // console.log('MainScreen 최근 게시글:', data);
      const mapped = (data?.content ?? []).map(post => ({
        id: String(post.id ?? ''),
        nickname: post.writerNickname ?? '게스트',
        profileImage: post.writerImgUrl ?? null,
        postImages: Array.isArray(post.postImgUrlList)
          ? post.postImgUrlList
          : [],
        storeId: post.storeId ?? null,
        storeAddress: post.storeAddress ?? post.address ?? '',
        name: post.storeName ?? '',
        content: post.content ?? '',
        likes: post.likes ?? 0,
        comments: post.commentCount ?? 0,
        shares: post.shareCount ?? 0,
        isWriter: post.isWriter ?? false,
      }));
      lastFetchCountRef.current = mapped.length;
      const totalPages = Number.isFinite(data?.totalPages)
        ? data.totalPages
        : feedTotalPagesRef.current;
      feedTotalPagesRef.current = totalPages ?? 0;
      setFeedTotalPages(feedTotalPagesRef.current);
      setFeedData(prev => {
        if (!isPaging) {
          return mapped;
        }
        const merged = [...prev, ...mapped];
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
      console.error('게시글 조회 실패:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else if (isPaging) {
        setFeedLoadingMore(false);
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
  }, []);

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

  const commentList = useMemo(() => {
    if (!selectedFeed) {
      return [];
    }

    return [
      {
        id: 'c1',
        author: selectedFeed?.nickname ?? '게스트',
        profileImage:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        text: '방금 본 메뉴 정말 맛있어 보여요!',
        createdAt: '방금 전',
        likes: 2,
        isMine: true,
      },
      {
        id: 'c2',
        author: '푸드파이터',
        profileImage: null,
        text: '위치 저장했습니다. 주말에 가볼게요 😋',
        createdAt: '1시간 전',
        likes: 8,
        isMine: false,
      },
      {
        id: 'c3',
        author: '카페투어러',
        profileImage:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80',
        text: '분위기 궁금했는데 사진으로 감 잡았어요. 공유 감사합니다!',
        createdAt: '어제',
        likes: 14,
        isMine: false,
      },
      {
        id: 'c4',
        author: '야식러버',
        profileImage: null,
        text: '여기 늦게까지 하나요? 2차로 딱일 것 같네요.',
        createdAt: '어제',
        likes: 5,
        isMine: false,
      },
      {
        id: 'c5',
        author: '술한잔각',
        profileImage:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
        text: '안주 비주얼 미쳤네요… 저장!',
        createdAt: '2일 전',
        likes: 21,
        isMine: false,
      },
      {
        id: 'c6',
        author: '맛집메모장',
        profileImage: null,
        text: '가격대는 어느 정도인지 궁금합니다.',
        createdAt: '2일 전',
        likes: 3,
        isMine: false,
      },
      {
        id: 'c7',
        author: '혼술마스터',
        profileImage:
          'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
        text: '혼자 가도 부담 없을까요?',
        createdAt: '3일 전',
        likes: 9,
        isMine: false,
      },
      {
        id: 'c8',
        author: '주말계획중',
        profileImage: null,
        text: '이번 주말 후보에 넣어둘게요 👍',
        createdAt: '3일 전',
        likes: 6,
        isMine: false,
      },
      {
        id: 'c9',
        author: '사진중독',
        profileImage:
          'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=200&q=80',
        text: '사진 색감 너무 좋아요. 직접 찍으신 건가요?',
        createdAt: '4일 전',
        likes: 11,
        isMine: false,
      },
      {
        id: 'c10',
        author: '연남동주민',
        profileImage: null,
        text: '여기 실제로 가봤는데 분위기 괜찮아요.',
        createdAt: '4일 전',
        likes: 18,
        isMine: false,
      },
      {
        id: 'c11',
        author: '데이트코스수집가',
        profileImage:
          'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
        text: '데이트 장소로도 괜찮을 것 같네요.',
        createdAt: '5일 전',
        likes: 7,
        isMine: false,
      },
      {
        id: 'c12',
        author: '가성비헌터',
        profileImage: null,
        text: '양 대비 가격은 어떤 편인가요?',
        createdAt: '5일 전',
        likes: 4,
        isMine: false,
      },
      {
        id: 'c13',
        author: '퇴근후한잔',
        profileImage:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        text: '퇴근하고 바로 가기 좋은 느낌이네요.',
        createdAt: '6일 전',
        likes: 13,
        isMine: false,
      },
      {
        id: 'c14',
        author: '분위기중요',
        profileImage: null,
        text: '시끄러운 편인지 조용한 편인지 궁금해요.',
        createdAt: '6일 전',
        likes: 2,
        isMine: false,
      },
      {
        id: 'c15',
        author: '술친놈',
        profileImage:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        text: '여기 소주 말고 다른 술도 괜찮나요?',
        createdAt: '1주 전',
        likes: 16,
        isMine: false,
      },
      {
        id: 'c16',
        author: '지도저장중',
        profileImage: null,
        text: '지도에 저장 완료했습니다.',
        createdAt: '1주 전',
        likes: 5,
        isMine: false,
      },
      {
        id: 'c17',
        author: '안주중심',
        profileImage:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        text: '메뉴 구성 보니까 안주 위주네요. 취향입니다.',
        createdAt: '1주 전',
        likes: 12,
        isMine: false,
      },
      {
        id: 'c18',
        author: '첫방문예정',
        profileImage: null,
        text: '첫 방문인데 추천 메뉴 있으면 알려주세요!',
        createdAt: '1주 전',
        likes: 1,
        isMine: false,
      },
      {
        id: 'c19',
        author: '사진보고옴',
        profileImage:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        text: '사진 보고 바로 들어왔어요.',
        createdAt: '2주 전',
        likes: 9,
        isMine: false,
      },
      {
        id: 'c20',
        author: '술자리메이커',
        profileImage: null,
        text: '여기서 한잔하면 시간 순삭일 듯하네요.',
        createdAt: '2주 전',
        likes: 20,
        isMine: false,
      },
    ];
  }, [selectedFeed]);

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

  const handleOpenCommentSheet = useCallback(feed => {
    setSelectedFeed(feed);
    requestAnimationFrame(() => {
      commentSheetRef.current?.present();
    });
  }, []);

  const handleGoToSettings = useCallback(() => {
    openSettings().catch(() => console.warn('설정 열기에 실패했습니다.'));
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
      scrollOffsetRef.current = offsetY;
      updateCenteredItem(offsetY);

      // Collapse the write button label after a small scroll.
      const shouldShowLabel = offsetY <= WRITE_BUTTON_COLLAPSE_OFFSET;
      if (shouldShowLabel !== writeLabelVisibleRef.current) {
        writeLabelVisibleRef.current = shouldShowLabel;
        setShowWriteLabel(shouldShowLabel);
      }
    },
    [updateCenteredItem],
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
    feedDataLengthRef.current = feedData.length;
  }, [feedData.length]);

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

      // TODO: Replace with navigation or action for each menu item when available.
      console.log('write menu item selected', key);
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

  return (
    <View
      style={[
        styles.container,
        {paddingTop: insets.top + (Platform.OS === 'android' ? 10 : 0)},
      ]}>
      <View style={[styles.header]}>
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
      </View>

      <FlatList
        ref={listRef}
        data={feedLoading ? skeletonData : feedData}
        keyExtractor={(item, index) =>
          feedLoading ? item : item.id ?? `${index}`
        }
        renderItem={({item}) =>
          feedLoading ? (
            <PostItemSkeleton />
          ) : (
            <PostItem
              item={item}
              onCommentPress={handleOpenCommentSheet}
              isCentered={item.id === centeredItemId}
              isWriter={item.isWriter}
            />
          )
        }
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        scrollEnabled={!feedLoading}
        refreshing={refreshing}
        onRefresh={refreshFeed}
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
        defaultProfile={defaultProfile}
        commentLikeState={commentLikeState}
        onToggleLike={handleCommentLikeToggle}
        formatLikeCount={formatLikeCount}
        commentInput={commentInput}
        onChangeCommentInput={setCommentInput}
        onPressSend={() => {}}
        isPostWriter={selectedFeed?.isWriter ?? false}
      />

      <WriteMenu
        visible={isWriteMenuVisible}
        bottomOffset={insets.bottom + (Platform.OS === 'android' ? 40 : 50)}
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
      />

      {rejectModalData && (
        <RejectModal
          data={rejectModalData}
          onClose={() => setRejectModalData(null)}
        />
      )}
      <AlertComponent />
      <Loading loading={refreshing} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 6,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    gap: 20,
  },
  topView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feedContent: {
    paddingTop: 10,
    paddingBottom: 24,
  },
});

export default MainScreen;
