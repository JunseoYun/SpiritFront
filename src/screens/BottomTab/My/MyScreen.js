import React, {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  useRef,
} from 'react';
import {
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Pressable,
  View,
  ScrollView,
  useWindowDimensions,
  Animated,
} from 'react-native';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import PagerView from 'react-native-pager-view';
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
  const [reviewCount, setReviewCount] = useState(0);
  const {width: screenWidth} = useWindowDimensions();
  const verticalScrollRef = useRef(null);
  const pagerRef = useRef(null);
  const pagerPosition = useRef(new Animated.Value(selectedTab)).current;
  const reviewRef = useRef(null);
  const managerRef = useRef(null);
  const [reviewRefreshing, setReviewRefreshing] = useState(false);
  const [managerRefreshing, setManagerRefreshing] = useState(false);
  const isRefreshing =
    selectedTab === 0
      ? reviewRefreshing
      : selectedTab === 2
      ? managerRefreshing
      : false;
  const scrollYRef = useRef(0);
  const tabsOffsetRef = useRef(null);
  const [tabsHeight, setTabsHeight] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [reviewPageHeight, setReviewPageHeight] = useState(0);
  const [locationPageHeight, setLocationPageHeight] = useState(0);
  const [managerPageHeight, setManagerPageHeight] = useState(0);
  const [isTabsSticky, setIsTabsSticky] = useState(false);
  const reviewHeightRef = useRef(0);
  const locationHeightRef = useRef(0);
  const managerHeightRef = useRef(0);
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
  const scrollContentHeight = headerHeight + tabsHeight + basePagerHeight;
  const canScrollVertically = scrollContentHeight > viewportHeight + 1;
  const scrollEnabled = isTabsSticky || canScrollVertically;
  const refreshEnabled =
    scrollEnabled &&
    (selectedTab === 0
      ? true
      : selectedTab === 2
      ? canScrollVertically
      : false);

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

  const isManager = userdata?.isManager === true;
  const pagerKey = isManager ? 'manager' : 'user';
  useEffect(() => {
    if (invitationManager && isManager) {
      setSelectedTab(2);
      pagerRef.current?.setPage?.(2);
    }
  }, [invitationManager, isManager, screenWidth]);

  useEffect(() => {
    if (!isManager && selectedTab > maxTabIndex) {
      setSelectedTab(0);
      pagerPosition.setValue(0);
    }
  }, [isManager, maxTabIndex, pagerPosition, selectedTab]);

  const handleScrollBeginDrag = useCallback(() => {
    if (selectedTab !== 0 && isTabsSticky && !canScrollVertically) {
      setIsTabsSticky(false);
      verticalScrollRef.current?.scrollTo?.({y: 0, animated: false});
      scrollYRef.current = 0;
    }
  }, [canScrollVertically, isManager, isTabsSticky, selectedTab]);

  const handleChangePage = useCallback(
    index => {
      if (typeof index === 'number') {
        if (!isManager && index > maxTabIndex) {
          return;
        }
        setSelectedTab(index);
        pagerRef.current?.setPage?.(index);
        if (isTabsSticky && tabsOffsetRef.current != null) {
          verticalScrollRef.current?.scrollTo?.({
            y: tabsOffsetRef.current,
            animated: false,
          });
          scrollYRef.current = tabsOffsetRef.current;
        }
      }
    },
    [pagerRef, screenWidth, isTabsSticky, isManager, pagerPosition],
  );

  const handlePageSelected = useCallback(
    event => {
      const nextIndex = event.nativeEvent.position ?? 0;
      if (!isManager && nextIndex > maxTabIndex) {
        return;
      }
      setSelectedTab(nextIndex);
      pagerPosition.setValue(nextIndex);
      if (isTabsSticky && tabsOffsetRef.current != null) {
        verticalScrollRef.current?.scrollTo?.({
          y: tabsOffsetRef.current,
          animated: false,
        });
        scrollYRef.current = tabsOffsetRef.current;
      }
    },
    [isManager, isTabsSticky, pagerPosition],
  );

  const renderTabs = () => (
    <MyTabs
      selectedTab={selectedTab}
      changePage={handleChangePage}
      isManager={isManager}
      tabPosition={pagerPosition}
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
      postCount={reviewCount}
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
      scrollYRef.current = contentOffset.y;
      if (tabsOffsetRef.current != null) {
        const nextSticky = contentOffset.y >= tabsOffsetRef.current;
        setIsTabsSticky(prev => (prev === nextSticky ? prev : nextSticky));
      }
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

  const handlePagerMoveCapture = useCallback((_, gestureState) => {
    const {dx, dy} = gestureState;
    return Math.abs(dx) > Math.abs(dy);
  }, []);

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

  if (!userdata) {
    return <Loading loading={true} />;
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView
        ref={verticalScrollRef}
        stickyHeaderIndices={[1]}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScroll={handleVerticalScroll}
        scrollEventThrottle={16}
        nestedScrollEnabled
        onLayout={({nativeEvent}) => {
          setViewportHeight(nativeEvent.layout.height);
        }}
        scrollEnabled={scrollEnabled}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            enabled={refreshEnabled}
          />
        }>
        <View
          onLayout={({nativeEvent}) => {
            setHeaderHeight(nativeEvent.layout.height);
          }}>
          {renderProfileHeader()}
        </View>
        <View
          style={styles.tabsContainer}
          onLayout={({nativeEvent}) => {
            tabsOffsetRef.current = nativeEvent.layout.y;
            setTabsHeight(nativeEvent.layout.height);
          }}>
          {renderTabs()}
        </View>
        <View onMoveShouldSetResponderCapture={handlePagerMoveCapture}>
          <PagerView
            key={pagerKey}
            ref={pagerRef}
            style={[styles.pager, pagerHeight ? {height: pagerHeight} : null]}
            initialPage={selectedTab}
            onPageScroll={event => {
              const {position, offset} = event.nativeEvent;
              pagerPosition.setValue(position + offset);
            }}
            onPageSelected={handlePageSelected}
            scrollEnabled>
            <View key="review" style={[styles.page, {width: screenWidth}]}>
              <MyReview
                ref={reviewRef}
                navigation={navigation}
                onRefreshingChange={setReviewRefreshing}
                onContentLayout={({nativeEvent}) => {
                  updateReviewHeight(nativeEvent.layout.height);
                }}
                onCountChange={setReviewCount}
                userProfile={{
                  nickname: userdata.nickname,
                  imageuri: userdata.imgUrl,
                }}
              />
            </View>
            <View key="location" style={[styles.page, {width: screenWidth}]}>
              <MyLocation
                navigation={navigation}
                onContentLayout={({nativeEvent}) => {
                  updateLocationHeight(nativeEvent.layout.height);
                }}
              />
            </View>
            {isManager ? (
              <View key="manager" style={[styles.page, {width: screenWidth}]}>
                <MyManager
                  ref={managerRef}
                  navigation={navigation}
                  onRefreshingChange={setManagerRefreshing}
                  onContentLayout={({nativeEvent}) => {
                    updateManagerHeight(nativeEvent.layout.height);
                  }}
                />
              </View>
            ) : null}
          </PagerView>
        </View>
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
