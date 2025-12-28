import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
  Animated,
  DeviceEventEmitter,
  Easing,
  FlatList,
  Platform,
  StyleSheet,
  View,
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
import {useNavigation} from '@react-navigation/native';
import {getLocation} from '../../storage/locationStorage';

const sampleFeedData = [
  {
    id: '1',
    nickname: '커피러버',
    profileImage:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',

    postImages: [
      'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80',
    ],
    storeAddress: '서울 성동구 성수동 1가',
    name: '커피맛집',
    content:
      '연남동에서 발견한 숯불 향 가득한 버거집! 치즈가 진짜 대박이에요 🍔',
    likes: 342,
    comments: 22,
    shares: 32,
  },
  {
    id: '2',
    nickname: '야식탐방가',
    profileImage: null,
    storeAddress: '서울 마포구 연남동',
    name: '치즈버거맛집',
    postImages: [
      'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    ],
    content:
      '연남동에서 발견한 숯불 향 가득한 버거집! 치즈가 진짜 대박이에요 🍔',
    likes: 342,
    content:
      '오늘의 시그니처 메뉴! 에스프레소 위에 시트러스 폼을 올려서 상큼하게 즐겨 보세요.오늘의 시그니처 메뉴! 에스프레소 위에 시트러스 폼을 올려서 상큼하게 즐겨 보세요.오늘의 시그니처 메뉴! 에스프레소 위에 시트러스 폼을 올려서 상큼하게 즐겨 보세요.',
    likes: 128,
    comments: 48,
    shares: 332,
  },
  {
    id: '3',
    nickname: '주말러너',
    profileImage:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    postImages: [
      'https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    ],
    storeAddress: '서울 송파구 석촌호수',
    name: '연어스테이크맛집',
    content:
      '러닝 끝나고 들른 건강식 카페. 그릭요거트 볼이 신선하고 가볍게 먹기 좋아요!',
    likes: 210,
    comments: 17,
    shares: 12,
  },
  {
    id: '4',
    nickname: '빵순이',
    profileImage:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80',
    storeAddress: '서울 서대문구 연희동',
    name: '버터향가득브런치',
    postImages: [
      'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80',
    ],
    content:
      '갓 구운 크루아상이 버터향 가득! 라떼와 함께 먹으면 완벽한 브런치.',
    likes: 189,
    comments: 11,
    shares: 20,
  },
  {
    id: '5',
    nickname: '와인초보',
    profileImage:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    storeAddress: '서울 용산구 한남동',
    name: '내추럴와인바',
    postImages: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    ],
    content:
      '내추럴 와인 페어링 코스 추천받고 왔어요. 분위기도 조용해서 데이트 코스로 딱!',
    likes: 256,
    comments: 34,
    shares: 45,
  },
  {
    id: '6',
    nickname: '디저트헌터',
    profileImage: null,
    storeAddress: '서울 광진구 화양동',
    name: '말차디저트카페',
    postImages: [
      'https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&w=800&q=80',
    ],
    content:
      '말차 티라미수가 녹진하고 덜 달아서 딱 좋았어요. 플레이트도 예뻐서 사진 필수!',
    likes: 312,
    comments: 29,
    shares: 51,
  },
];

const MainScreen = ({navigation}) => {
  const nav = useNavigation();
  const insets = useSafeAreaInsets();
  const [rejectModalData, setRejectModalData] = useState(null);
  const [unreadNotification, setUnreadNotification] = useState(false);
  const [location, setLocation] = useState(null);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {pendingNotification, setPendingNotification} = useNotification();
  const [centeredItemId, setCenteredItemId] = useState(null);
  const listHeightRef = useRef(0);
  const itemLayoutsRef = useRef(new Map());
  const scrollOffsetRef = useRef(0);
  const [showWriteLabel, setShowWriteLabel] = useState(true);
  const [isWriteMenuVisible, setIsWriteMenuVisible] = useState(false);
  const [isWriteMenuOpen, setIsWriteMenuOpen] = useState(false);
  const writeLabelVisibleRef = useRef(true);
  const WRITE_BUTTON_COLLAPSE_OFFSET = 20;
  const writeButtonAnim = useRef(new Animated.Value(1)).current;
  const writeLabelAnim = useRef(new Animated.Value(1)).current;
  const writeIconAnim = useRef(new Animated.Value(0)).current;
  const writeMenuAnim = useRef(new Animated.Value(0)).current;
  const closeWriteMenu = useCallback(() => {
    setIsWriteMenuOpen(false);
    const shouldShowLabel =
      scrollOffsetRef.current <= WRITE_BUTTON_COLLAPSE_OFFSET;
    if (shouldShowLabel && !writeLabelVisibleRef.current) {
      writeLabelVisibleRef.current = true;
      setShowWriteLabel(true);
    }
  }, []);

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

  const handleOpenFeedDetail = useCallback(
    feed => {
      nav.navigate('PostDetailScreen', {item: feed});
    },
    [nav],
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
          handleItemLayout(item.id, event.nativeEvent.layout);
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
      <View style={styles.header}>
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
        data={sampleFeedData}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <PostItem
            item={item}
            onCommentPress={handleOpenFeedDetail}
            isCentered={item.id === centeredItemId}
          />
        )}
        contentContainerStyle={styles.feedContent}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onLayout={handleListLayout}
        CellRendererComponent={cellRenderer}
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#EEE',
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
