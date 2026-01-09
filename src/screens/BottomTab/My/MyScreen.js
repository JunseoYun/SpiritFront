import React, {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
} from 'react';
import {
  Animated,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Pressable,
  View,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import MyPageheader from '../../../components/MyScreen/MyPageheader';
import {Userdataget} from '../../../api/userApi';
import useCustomAlert from '../../../hooks/useCustomAlert';
import MyTabs from '../../../components/MyScreen/MyTabs';
import MyReview from '../../../components/MyScreen/MyReview';
import MyManager from '../../../components/MyScreen/MyManager/MyManager';
import MyLocation from '../../../components/MyScreen/MyLocation';
import Loading from '../../../hooks/Loading';
import {Bell} from 'lucide-react-native';
import {has_unread_notification} from '../../../api/notificationApi';
import {RefreshControl} from 'react-native-gesture-handler';

const MyScreen = ({navigation}) => {
  const [userdata, setUserdata] = useState(null);
  const {showAlert, AlertComponent} = useCustomAlert();
  const [selectedTab, setSelectedTab] = useState(0);
  const route = useRoute();
  const invitationManager = route.params?.invitationManager;
  const [unreadNotification, setUnreadNotification] = useState(false);
  const [loading, setLoading] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const {width: screenWidth} = useWindowDimensions();
  const reviewRef = useRef(null);
  const managerRef = useRef(null);
  const [reviewRefreshing, setReviewRefreshing] = useState(false);
  const [managerRefreshing, setManagerRefreshing] = useState(false);
  const pagerRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const isPagerDragging = useRef(false);
  const skipPagerSync = useRef(false);
  const isRefreshing =
    selectedTab === 0
      ? reviewRefreshing
      : selectedTab === 2
      ? managerRefreshing
      : false;
  const [tabsHeight, setTabsHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [reviewPageHeight, setReviewPageHeight] = useState(0);
  const [locationPageHeight, setLocationPageHeight] = useState(0);
  const [managerPageHeight, setManagerPageHeight] = useState(0);
  const reviewHeightRef = useRef(0);
  const locationHeightRef = useRef(0);
  const managerHeightRef = useRef(0);
  const isManager = userdata?.isManager === true;
  const tabCount = isManager ? 3 : 2;
  const maxTabIndex = tabCount - 1;
  const activePageHeight =
    selectedTab === 0
      ? reviewPageHeight
      : selectedTab === 1
      ? locationPageHeight
      : managerPageHeight;
  const minPagerHeight = Math.max(0, viewportHeight - tabsHeight);
  const basePagerHeight = activePageHeight > 0 ? activePageHeight : 0;
  const pagerHeight =
    basePagerHeight || minPagerHeight
      ? Math.max(basePagerHeight, minPagerHeight || 0)
      : undefined;
  const tabPosition = useMemo(() => {
    const safeWidth = screenWidth || 1;
    return Animated.divide(scrollX, safeWidth);
  }, [scrollX, screenWidth]);

  const scrollToPage = useCallback(
    (index, animated) => {
      if (!screenWidth) return;
      const pagerNode =
        pagerRef.current && typeof pagerRef.current.getNode === 'function'
          ? pagerRef.current.getNode()
          : pagerRef.current;
      pagerNode?.scrollTo?.({x: index * screenWidth, animated});
    },
    [screenWidth],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          hitSlop={15}
          style={{marginRight: 24}}
          onPress={() => navigation.navigate('NotificationScreen')}>
          <Bell size={22} color="#121212" />
          {unreadNotification && (
            <View
              style={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 5,
                height: 5,
                borderRadius: 5,
                backgroundColor: '#3CBBFF',
                zIndex: 20,
              }}
            />
          )}
        </Pressable>
      ),
    });
  }, [unreadNotification, navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('MainScreen');
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation]),
  );

  useFocusEffect(
    useCallback(() => {
      const fetchUnread = async () => {
        try {
          const unread = await has_unread_notification();
          setUnreadNotification(unread.hasUnread);
        } catch (err) {
          console.error('알림 조회 실패:', err);
        }
      };

      fetchUnread();
    }, []),
  );

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const data = await Userdataget();
        setUserdata(data);
      } catch (error) {
        if (error.response) {
          const statusCode = error.response.status;

          switch (statusCode) {
            case 404:
              showAlert({
                title: '유저 정보 없음',
                message: '유저 정보가 없습니다. 다시 로그인해주세요.',
              });
              break;
            default:
              showAlert({
                title: '네트워크 오류',
                message: '다시 시도해주세요.',
              });
              break;
          }
        } else {
          console.error('Unexpected Error:', error);
          showAlert({
            title: '알 수 없는 오류',
            message: '다시 시도해주세요.',
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [showAlert]);

  useEffect(() => {
    if (invitationManager && isManager) {
      setSelectedTab(2);
    }
  }, [invitationManager, isManager, screenWidth]);

  useEffect(() => {
    if (!isManager && selectedTab > maxTabIndex) {
      setSelectedTab(0);
    }
  }, [isManager, maxTabIndex, selectedTab]);

  useEffect(() => {
    if (skipPagerSync.current) {
      skipPagerSync.current = false;
      return;
    }
    scrollToPage(selectedTab, false);
  }, [scrollToPage, selectedTab]);

  const handleChangePage = useCallback(
    index => {
      if (typeof index !== 'number') return;
      if (!isManager && index > maxTabIndex) {
        return;
      }
      isPagerDragging.current = false;
      skipPagerSync.current = true;
      setSelectedTab(index);
      scrollToPage(index, true);
    },
    [isManager, maxTabIndex, scrollToPage],
  );
  const renderTabs = tabPosition => (
    <MyTabs
      selectedTab={selectedTab}
      changePage={handleChangePage}
      isManager={isManager}
      tabPosition={tabPosition}
    />
  );

  const handleImagePress = () => {
    navigation.navigate('StoreStack', {
      screen: 'ImageViewerScreen',
      params: {
        images: userdata.imgUrl,
      },
    });
  };

  const handleWritePostPress = useCallback(() => {
    navigation.navigate('PostPhotoSelectScreen');
  }, [navigation]);

  const renderProfileHeader = () => (
    <MyPageheader
      nickname={userdata.nickname}
      postCount={postCount}
      imageuri={userdata.imgUrl}
      handleImagePress={handleImagePress}
      onWritePress={handleWritePostPress}
      onProfilePress={() =>
        navigation.navigate('MyStack', {
          screen: 'ConfigScreen',
        })
      }
    />
  );

  const handleVerticalScroll = useCallback(
    event => {
      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
      const scrollable = contentSize.height > layoutMeasurement.height + 1;
      if (!scrollable) {
        return;
      }
      const bottomSpace =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);
      if (bottomSpace > 200) {
        return;
      }
      if (selectedTab === 0) {
        reviewRef.current?.loadMore?.();
      } else if (selectedTab === 2) {
        managerRef.current?.loadMore?.();
      }
    },
    [selectedTab],
  );

  const handleRefresh = useCallback(() => {
    if (selectedTab === 0) {
      reviewRef.current?.refresh?.();
      return;
    }
    if (selectedTab === 2) {
      managerRef.current?.refresh?.();
    }
  }, [selectedTab]);

  const updateReviewHeight = useCallback(height => {
    if (Math.abs(reviewHeightRef.current - height) < 1) {
      return;
    }
    reviewHeightRef.current = height;
    setReviewPageHeight(height);
  }, []);

  const updateLocationHeight = useCallback(height => {
    if (Math.abs(locationHeightRef.current - height) < 1) {
      return;
    }
    locationHeightRef.current = height;
    setLocationPageHeight(height);
  }, []);

  const updateManagerHeight = useCallback(height => {
    if (Math.abs(managerHeightRef.current - height) < 1) {
      return;
    }
    managerHeightRef.current = height;
    setManagerPageHeight(height);
  }, []);

  const handlePagerMomentumEnd = useCallback(
    event => {
      if (!isPagerDragging.current) {
        return;
      }
      isPagerDragging.current = false;
      const offsetX = event.nativeEvent.contentOffset.x || 0;
      const nextIndex = screenWidth ? Math.round(offsetX / screenWidth) : 0;
      if (nextIndex !== selectedTab) {
        setSelectedTab(Math.min(nextIndex, maxTabIndex));
      }
    },
    [maxTabIndex, screenWidth, selectedTab],
  );

  const handlePagerScroll = useMemo(
    () =>
      Animated.event([{nativeEvent: {contentOffset: {x: scrollX}}}], {
        useNativeDriver: false,
      }),
    [scrollX],
  );

  if (!userdata) {
    return <Loading loading={true} />;
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        stickyHeaderIndices={[1]}
        onScroll={handleVerticalScroll}
        scrollEventThrottle={16}
        onLayout={({nativeEvent}) => {
          setViewportHeight(nativeEvent.layout.height);
        }}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }>
        <View>{renderProfileHeader()}</View>
        <View
          style={styles.tabsContainer}
          onLayout={({nativeEvent}) => {
            setTabsHeight(nativeEvent.layout.height);
          }}>
          {renderTabs(tabPosition)}
        </View>
        <Animated.ScrollView
          ref={pagerRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}
          onScrollBeginDrag={() => {
            isPagerDragging.current = true;
          }}
          onMomentumScrollEnd={handlePagerMomentumEnd}
          onScroll={handlePagerScroll}
          style={[styles.pager, pagerHeight ? {height: pagerHeight} : null]}>
          <View style={[styles.page, {width: screenWidth}]}>
            <MyReview
              ref={reviewRef}
              navigation={navigation}
              onRefreshingChange={setReviewRefreshing}
              onContentLayout={({nativeEvent}) => {
                updateReviewHeight(nativeEvent.layout.height);
              }}
              onCountChange={setPostCount}
              userProfile={{
                nickname: userdata.nickname,
                imageuri: userdata.imgUrl,
              }}
            />
          </View>
          <View style={[styles.page, {width: screenWidth}]}>
            <MyLocation
              navigation={navigation}
              onContentLayout={({nativeEvent}) => {
                updateLocationHeight(nativeEvent.layout.height);
              }}
            />
          </View>
          {isManager && (
            <View style={[styles.page, {width: screenWidth}]}>
              <MyManager
                ref={managerRef}
                navigation={navigation}
                onRefreshingChange={setManagerRefreshing}
                onContentLayout={({nativeEvent}) => {
                  updateManagerHeight(nativeEvent.layout.height);
                }}
              />
            </View>
          )}
        </Animated.ScrollView>
      </ScrollView>

      <AlertComponent />
      <Loading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  innerviewtext: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservationtext: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingtext: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    fontSize: 20,
    color: '#333',
  },
  tabsContainer: {
    backgroundColor: '#fff',
  },
  pager: {
    flexGrow: 0,
  },
  page: {
    flex: 1,
  },
});

export default MyScreen;
