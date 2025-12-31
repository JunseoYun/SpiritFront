import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  DeviceEventEmitter,
  Easing,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {openSettings} from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import {Portal} from 'react-native-paper';

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
import {getLocation} from '../../storage/locationStorage';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {PostGetByRecent} from '../../api/postApi';
import Loading from '../../hooks/Loading';

const defaultProfile = require('../../assets/default_profile.png');

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
  const listHeightRef = useRef(0);
  const itemLayoutsRef = useRef(new Map());
  const scrollOffsetRef = useRef(0);
  const [showWriteLabel, setShowWriteLabel] = useState(true);
  const [isWriteMenuVisible, setIsWriteMenuVisible] = useState(false);
  const [isWriteMenuOpen, setIsWriteMenuOpen] = useState(false);
  const [selectedFeed, setSelectedFeed] = useState(null);
  const [isCommentSheetOpen, setIsCommentSheetOpen] = useState(false);
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

  const fetchPosts = useCallback(async ({isRefresh = false} = {}) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setFeedLoading(true);
    }
    try {
      const data = await PostGetByRecent({page: 0, size: 10});
      console.log('MainScreen 최근 게시글:', data);
      const mapped = (data?.content ?? []).map(post => ({
        id: String(post.id ?? ''),
        nickname: post.writerNickname ?? '게스트',
        profileImage: post.writerImgUrl ?? null,
        postImages: Array.isArray(post.postImgUrlList)
          ? post.postImgUrlList
          : [],
        storeAddress: post.storeAddress ?? '',
        name: post.storeName ?? '',
        content: post.content ?? '',
        likes: post.likes ?? 0,
        comments: post.commentCount ?? 0,
        shares: post.shareCount ?? 0,
        isWriter: false,
      }));
      setFeedData(mapped);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setFeedLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchPosts();
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
      },
      {
        id: 'c2',
        author: '푸드파이터',
        profileImage: null,
        text: '위치 저장했습니다. 주말에 가볼게요 😋',
        createdAt: '1시간 전',
        likes: 8,
      },
      {
        id: 'c3',
        author: '카페투어러',
        profileImage:
          'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80',
        text: '분위기 궁금했는데 사진으로 감 잡았어요. 공유 감사합니다!',
        createdAt: '어제',
        likes: 14,
      },
      {
        id: 'c4',
        author: '야식러버',
        profileImage: null,
        text: '여기 늦게까지 하나요? 2차로 딱일 것 같네요.',
        createdAt: '어제',
        likes: 5,
      },
      {
        id: 'c5',
        author: '술한잔각',
        profileImage:
          'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
        text: '안주 비주얼 미쳤네요… 저장!',
        createdAt: '2일 전',
        likes: 21,
      },
      {
        id: 'c6',
        author: '맛집메모장',
        profileImage: null,
        text: '가격대는 어느 정도인지 궁금합니다.',
        createdAt: '2일 전',
        likes: 3,
      },
      {
        id: 'c7',
        author: '혼술마스터',
        profileImage:
          'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
        text: '혼자 가도 부담 없을까요?',
        createdAt: '3일 전',
        likes: 9,
      },
      {
        id: 'c8',
        author: '주말계획중',
        profileImage: null,
        text: '이번 주말 후보에 넣어둘게요 👍',
        createdAt: '3일 전',
        likes: 6,
      },
      {
        id: 'c9',
        author: '사진중독',
        profileImage:
          'https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=200&q=80',
        text: '사진 색감 너무 좋아요. 직접 찍으신 건가요?',
        createdAt: '4일 전',
        likes: 11,
      },
      {
        id: 'c10',
        author: '연남동주민',
        profileImage: null,
        text: '여기 실제로 가봤는데 분위기 괜찮아요.',
        createdAt: '4일 전',
        likes: 18,
      },
      {
        id: 'c11',
        author: '데이트코스수집가',
        profileImage:
          'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80',
        text: '데이트 장소로도 괜찮을 것 같네요.',
        createdAt: '5일 전',
        likes: 7,
      },
      {
        id: 'c12',
        author: '가성비헌터',
        profileImage: null,
        text: '양 대비 가격은 어떤 편인가요?',
        createdAt: '5일 전',
        likes: 4,
      },
      {
        id: 'c13',
        author: '퇴근후한잔',
        profileImage:
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
        text: '퇴근하고 바로 가기 좋은 느낌이네요.',
        createdAt: '6일 전',
        likes: 13,
      },
      {
        id: 'c14',
        author: '분위기중요',
        profileImage: null,
        text: '시끄러운 편인지 조용한 편인지 궁금해요.',
        createdAt: '6일 전',
        likes: 2,
      },
      {
        id: 'c15',
        author: '술친놈',
        profileImage:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        text: '여기 소주 말고 다른 술도 괜찮나요?',
        createdAt: '1주 전',
        likes: 16,
      },
      {
        id: 'c16',
        author: '지도저장중',
        profileImage: null,
        text: '지도에 저장 완료했습니다.',
        createdAt: '1주 전',
        likes: 5,
      },
      {
        id: 'c17',
        author: '안주중심',
        profileImage:
          'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
        text: '메뉴 구성 보니까 안주 위주네요. 취향입니다.',
        createdAt: '1주 전',
        likes: 12,
      },
      {
        id: 'c18',
        author: '첫방문예정',
        profileImage: null,
        text: '첫 방문인데 추천 메뉴 있으면 알려주세요!',
        createdAt: '1주 전',
        likes: 1,
      },
      {
        id: 'c19',
        author: '사진보고옴',
        profileImage:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        text: '사진 보고 바로 들어왔어요.',
        createdAt: '2주 전',
        likes: 9,
      },
      {
        id: 'c20',
        author: '술자리메이커',
        profileImage: null,
        text: '여기서 한잔하면 시간 순삭일 듯하네요.',
        createdAt: '2주 전',
        likes: 20,
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

  const renderCommentBackdrop = useCallback(
    props => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
      />
    ),
    [],
  );

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
        onRefresh={() => fetchPosts({isRefresh: true})}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={handleListLayout}
        CellRendererComponent={cellRenderer}
      />

      <BottomSheetModal
        ref={commentSheetRef}
        index={0}
        snapPoints={commentSheetSnapPoints}
        enablePanDownToClose
        onChange={index => setIsCommentSheetOpen(index >= 0)}
        onDismiss={() => {
          setSelectedFeed(null);
          setIsCommentSheetOpen(false);
        }}
        backdropComponent={renderCommentBackdrop}
        backgroundStyle={styles.commentSheetBackground}
        handleIndicatorStyle={styles.commentSheetHandleIndicator}>
        <BottomSheetView style={styles.commentSheetHeader}>
          <CustomText style={styles.commentSheetTitle}>댓글</CustomText>
        </BottomSheetView>
        <BottomSheetScrollView
          contentContainerStyle={[
            styles.commentSheetContent,
            {paddingBottom: 110 + Math.max(insets.bottom, 16)},
          ]}>
          {commentList.length === 0 ? (
            <CustomText style={styles.commentEmptyText}>
              아직 댓글이 없어요.
            </CustomText>
          ) : (
            commentList.map(comment => (
              <View key={comment.id} style={styles.commentItem}>
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
                  <CustomText style={styles.commentText}>
                    {comment.text}
                  </CustomText>
                  <CustomText style={styles.commentReplyText}>
                    답글 달기
                  </CustomText>
                </View>
                <View style={styles.commentLikeColumn}>
                  <Pressable
                    hitSlop={8}
                    onPress={() => handleCommentLikeToggle(comment.id)}>
                    <Ionicons
                      name={
                        commentLikeState[comment.id] ? 'heart' : 'heart-outline'
                      }
                      size={20}
                      color={
                        commentLikeState[comment.id] ? '#FF5E5E' : '#A0A5AE'
                      }
                    />
                  </Pressable>
                  <CustomText style={styles.commentLikeCount}>
                    {formatLikeCount(
                      (comment.likes ?? 0) +
                        (commentLikeState[comment.id] ? 1 : 0),
                    )}
                  </CustomText>
                </View>
              </View>
            ))
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
      {isCommentSheetOpen && (
        <Portal>
          <View style={styles.commentInputOverlay} pointerEvents="box-none">
            <View
              style={[
                styles.commentInputBar,
                {paddingBottom: Math.max(insets.bottom, 12)},
              ]}>
              <Image
                source={defaultProfile}
                style={styles.commentInputAvatar}
              />
              <View style={styles.commentInputField}>
                <TextInput
                  value={commentInput}
                  onChangeText={setCommentInput}
                  placeholder="회원님의 생각을 남겨보세요."
                  placeholderTextColor="#9AA1AE"
                  style={styles.commentInput}
                  multiline
                  underlineColorAndroid="transparent"
                />
              </View>
              <Pressable
                hitSlop={8}
                style={[
                  styles.commentSendButton,
                  commentInput.trim() ? styles.commentSendButtonActive : null,
                ]}>
                <Ionicons
                  name="paper-plane-outline"
                  size={18}
                  color={commentInput.trim() ? '#3CBBFF' : '#A0A5AE'}
                />
              </Pressable>
            </View>
          </View>
        </Portal>
      )}

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
  commentSheetBackground: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  commentSheetHandleIndicator: {
    backgroundColor: '#E4E4E4',
    width: 48,
    height: 3,
  },
  commentSheetHeader: {
    paddingBottom: 15,
    flexDirection: 'row',
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
  commentSheetClose: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: ColorUtil.subText,
  },
  commentSheetContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    gap: 18,
  },
  commentEmptyText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: ColorUtil.subText,
    textAlign: 'center',
    paddingVertical: 24,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 12,
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
  commentReplyText: {
    fontSize: 12,
    fontFamily: 'Pretendard-Medium',
    color: ColorUtil.subText,
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
  commentInputOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  commentInputBar: {
    borderTopWidth: 1,
    borderTopColor: '#E8EBF1',
    paddingHorizontal: 14,
    paddingTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    backgroundColor: '#FFF',
  },
  commentInputAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F2F2F2',
  },
  commentInputField: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderColor: '#E1E5EC',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#FAFBFC',
  },
  commentInput: {
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#222',
    lineHeight: 18,
    padding: 0,
    margin: 0,
  },
  commentSendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F3F6',
  },
  commentSendButtonActive: {
    backgroundColor: '#E8F4FF',
  },
});

export default MainScreen;
