import React, {useState, useEffect, useRef, useCallback, useMemo} from 'react';
import {
  BackHandler,
  ToastAndroid,
  Animated,
  Platform,
  Dimensions,
  StatusBar,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import Feather from 'react-native-vector-icons/Feather';
import {getLocation, getAddress} from '../../storage/locationStorage';
import useRecommendation from '../../hooks/useRecommendation';
import LinearGradient from 'react-native-linear-gradient';
import {AIFullIcon} from '../../assets/svg/AiTabIcon';
import ChatbotIcon from '../../assets/svg/ChatbotIcon';
import {Store_getby_main_banner, Store_getby_popular} from '../../api/storeApi';
import Loading from '../../hooks/Loading';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {has_unread_notification} from '../../api/notificationApi';
import {useDeepLink} from '../../context/DeepLinkContext';
import FilterHeader from '../../components/ExploreScreen/FilterHeader';
import {useNotification} from '../../context/NotificationContext';
import useHandlePendingNotification from '../../hooks/notification/useHandlePendingNotification';
import ExploreSection from '../../components/ExploreScreen/ExploreSection';
import ExploreSearchBar from '../../components/ExploreScreen/ExploreSearchBar';
import NotificationButton from '../../components/ExploreScreen/NotificationButton';
import PopularStoresSection from '../../components/ExploreScreen/PopularStroe/PopularStoresSection';
import ScrollToTopButton from '../../utils/ScrollToTopButton';
import CustomText from '../../utils/CustomText';
import useScrollToTopVisibility from '../../hooks/useScrollToTopVisibility';
import Ionicons from 'react-native-vector-icons/Ionicons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const TOP_TOUCHABLE_DISTANCE = 24;
const POPULAR_SECTION_ITEM = {id: 'popularStoresSection'};

const ExploreScreen = ({navigation, route}) => {
  const {pendingStoreId} = useDeepLink();
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const fixedFilterHeaderRef = useRef(null);
  const listFilterHeaderRef = useRef(null);
  const lastFilterScrollX = useRef(0);

  const [mainSectionHeight, setMainSectionHeight] = useState(0);
  const [topView2Height, setTopView2Height] = useState(0);
  const [touchable, setTouchable] = useState(false);

  const [recommStores, setRecommStores] = useState([]);
  const [recommCategory, setRecommCategory] = useState(null);
  const [recommReason, setRecommReason] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const todayRecommTabFromRoute = route?.params?.todayRecommTab;

  const {recommendCategory} = useRecommendation();
  const [unreadNotification, setUnreadNotification] = useState(false);
  const scrollTopThreshold = useMemo(() => {
    const base = Platform.OS === 'ios' ? 0.25 : 0.3;
    return screenHeight * base;
  }, []);
  const {visible: showScrollToTop, updateVisibility} = useScrollToTopVisibility(
    {
      externalRef: scrollRef,
      threshold: scrollTopThreshold,
    },
  );

  const formatAddress = useCallback(addr => {
    if (addr === '신논현역') {
      return addr;
    }
    return addr;
  }, []);

  const registerFixedFilterHeader = useCallback(instance => {
    fixedFilterHeaderRef.current = instance;
    if (instance?.syncScroll) {
      instance.syncScroll(lastFilterScrollX.current, false);
    }
  }, []);

  const registerListFilterHeader = useCallback(instance => {
    listFilterHeaderRef.current = instance;
    if (instance?.syncScroll) {
      instance.syncScroll(lastFilterScrollX.current, false);
    }
  }, []);

  const closeAllFilterDropdowns = useCallback((animated = true) => {
    fixedFilterHeaderRef.current?.closeDropdown(animated);
    listFilterHeaderRef.current?.closeDropdown(animated);
  }, []);

  const syncFilterScroll = useCallback((source, offset) => {
    lastFilterScrollX.current = offset;
    if (source === 'fixed') {
      listFilterHeaderRef.current?.syncScroll(offset);
    } else {
      fixedFilterHeaderRef.current?.syncScroll(offset);
    }
  }, []);

  const handleFixedFilterScroll = useCallback(
    offset => syncFilterScroll('fixed', offset),
    [syncFilterScroll],
  );

  const handleListFilterScroll = useCallback(
    offset => syncFilterScroll('list', offset),
    [syncFilterScroll],
  );

  const aiChatButtonBottom = useMemo(() => 20, []);
  const aiChatLift = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [0, scrollTopThreshold],
        outputRange: [0, -60],
        extrapolate: 'clamp',
      }),
    [scrollTopThreshold, scrollY],
  );

  const stickyTranslateY = 0;

  const filterHeaderThreshold = useMemo(() => {
    if (!mainSectionHeight) return 100000;
    return Math.max(0, mainSectionHeight);
  }, [mainSectionHeight]);

  const filterHeaderProgress = scrollY.interpolate({
    inputRange: [filterHeaderThreshold, filterHeaderThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const fixedFilterOpacity = filterHeaderProgress;
  const listFilterOpacity = Animated.subtract(1, filterHeaderProgress);

  const shadowOpacity = fixedFilterOpacity.interpolate({
    inputRange: [0, 0.1],
    outputRange: [0.1, 0],
    extrapolate: 'clamp',
  });

  const elevation = fixedFilterOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const id = fixedFilterOpacity.addListener(({value}) => {
      setTouchable(value > 0.01);
    });
    return () => fixedFilterOpacity.removeListener(id);
  }, [fixedFilterOpacity]);

  const headerOffsetFallback = useMemo(() => insets.top + 110, [insets.top]);
  const listTopPadding = useMemo(
    () => (topView2Height > 0 ? topView2Height : headerOffsetFallback),
    [topView2Height, headerOffsetFallback],
  );

  useFocusEffect(
    useCallback(() => {
      let lastBackPressed = 0;

      const onBackPress = () => {
        const now = Date.now();
        if (now - lastBackPressed < 2000) {
          BackHandler.exitApp();
          return true;
        }

        lastBackPressed = now;
        ToastAndroid.show('한 번 더 누르면 종료됩니다.', ToastAndroid.SHORT);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, []),
  );

  useEffect(() => {
    if (pendingStoreId) return;
    const fetchLocation = async () => {
      try {
        setLoading(true);
        const currentLocation = await getLocation();
        if (currentLocation) {
          setLocation(currentLocation);
          const recommStoreData = await Store_getby_main_banner(
            currentLocation.latitude,
            currentLocation.longitude,
          );
          const {reason} = recommendCategory(recommStoreData.category);
          setRecommCategory(recommStoreData.category);
          setRecommReason(reason);
          setRecommStores(recommStoreData.mainBannerStoreDtoList);
          PopularStores(0, true, currentLocation);
        }
        const currentAddress = await getAddress();
        if (currentAddress) {
          setAddress(currentAddress);
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [pendingStoreId]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);

    try {
      const currentLocation = await getLocation();
      if (currentLocation) {
        setLocation(currentLocation);

        const recommStoreData = await Store_getby_main_banner(
          currentLocation.latitude,
          currentLocation.longitude,
        );
        const {reason} = recommendCategory(recommStoreData.category);
        setRecommCategory(recommStoreData.category);
        setRecommReason(reason);
        setRecommStores(recommStoreData.mainBannerStoreDtoList);
        const unread = await has_unread_notification();
        setUnreadNotification(unread.hasUnread);
        PopularStores(0, true, currentLocation);
      }

      const currentAddress = await getAddress();
      if (currentAddress) {
        setAddress(currentAddress);
      }
    } catch (error) {
    } finally {
      setIsRefreshing(false);
    }
  }, [recommendCategory, PopularStores]);

  const handleScrollToTop = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
        viewPosition: 0,
        animated: true,
      });
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      navigation.setParams({scrollToTop: handleScrollToTop});
    }, [navigation, handleScrollToTop]),
  );

  const catagoryClick = index => {
    if (index >= 0 && index < 10) {
      navigation.navigate('CategoryListTabbar', {
        screen: screens[index],
      });
    }
  };

  const handlestoreItemClick = index => {
    navigation.navigate('StoreSearchScreen', {index, location: location});
  };

  const handleSearchPress = useCallback(() => {
    navigation.navigate('SearchScreen');
  }, [navigation]);

  const handleTopRecommViewAll = useCallback(
    ({stores, initialTab} = {}) => {
      const tabNavigatorKey = navigation?.getState?.()?.key;
      navigation.navigate('RecommStoreScreen', {
        stores: Array.isArray(stores) ? stores : recommStores,
        initialTab,
        sourceRouteKey: route?.key,
        tabNavigatorKey,
        location,
      });
    },
    [location, navigation, recommStores, route?.key],
  );

  const handleAiChatPress = useCallback(() => {
    navigation.navigate('ChatbotScreen');
  }, [navigation]);

  const setLocationHandle = useCallback(() => {
    setTimeout(() => {
      navigation.navigate('SetLocationScreen');
    }, 50);
  }, [navigation]);

  const [rejectModalData, setRejectModalData] = useState(null);
  const {pendingNotification, setPendingNotification} = useNotification();
  useHandlePendingNotification(
    loading,
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

  useFocusEffect(
    useCallback(() => {
      if (pendingStoreId) return;
      const fetchUnread = async () => {
        try {
          const unread = await has_unread_notification();
          setUnreadNotification(unread.hasUnread);
        } catch (err) {}
      };

      fetchUnread();
    }, [pendingStoreId]),
  );

  const [popularstores, setPopularstores] = useState([]);
  const [popularpage, setPopularpage] = useState(0);
  const [totalpage, setTotalpage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [drinkType, setDrinkType] = useState(null);
  const [priceOrder, setPriceOrder] = useState('');
  const [popularloading, setPopularloading] = useState(false);
  const [popularempty, setPopularempty] = useState(false);

  const PopularStores = async (
    currentPage,
    reset = false,
    currentLocation,
    currentDrinkType = null,
    currentPriceOrder = '',
  ) => {
    setPopularloading(true);
    if (currentLocation) {
      if (popularloading || (!hasMore && !reset)) return;

      if (reset) {
        setPopularpage(0);
        setHasMore(true);
      }
      try {
        const data = await Store_getby_popular(
          currentPage,
          currentLocation.latitude,
          currentLocation.longitude,
          currentDrinkType,
          currentPriceOrder,
        );

        setTotalpage(data.totalPages);
        setPopularempty(data.empty);

        if (data.content && data.content.length > 0) {
          setPopularstores(prevData => {
            const newData = reset
              ? data.content
              : [...prevData, ...data.content];
            const uniqueData = newData.filter(
              (item, index, self) =>
                index === self.findIndex(existing => existing.id === item.id),
            );
            return uniqueData;
          });
        } else {
          setHasMore(false);
        }
      } catch (error) {
      } finally {
        setPopularloading(false);
      }
    }
  };

  useEffect(() => {
    setPopularstores([]);
    setPopularempty(false);
    PopularStores(0, true, location, drinkType, priceOrder);
    if (!popularloading && popularstores.length > 0) {
      setTimeout(() => {
        scrollRef.current.scrollToLocation({
          sectionIndex: 1,
          itemIndex: 1,
          viewPosition: 0,
          viewOffset: insets.top + 40 + populartext,
          animated: true,
        });
      }, 300);
    }
  }, [drinkType, priceOrder]);

  const loadMoreData = () => {
    if (!popularloading && hasMore && popularpage < totalpage - 1) {
      setPopularpage(prevPage => {
        const nextPage = prevPage + 1;
        PopularStores(nextPage, false, location, drinkType, priceOrder);
        return nextPage;
      });
    }
  };

  const stableNavigation = useMemo(() => navigation, [navigation]);
  const stableLocation = useMemo(() => location, [location]);

  const mainSectionData = useMemo(
    () => ({
      id: 'mainSectionItem',
      recommCategory,
      recommReason,
      recommStores,
      location,
      address,
      isRefreshing,
      navigation,
      loading,
      todayRecommInitialTab: todayRecommTabFromRoute,
      handlestoreItemClick,
      catagoryClick,
      onPressRecommViewAll: handleTopRecommViewAll,
    }),
    [
      recommCategory,
      recommReason,
      recommStores,
      location,
      address,
      isRefreshing,
      loading,
      todayRecommTabFromRoute,
      navigation,
      handlestoreItemClick,
      catagoryClick,
      handleTopRecommViewAll,
    ],
  );

  const [populartext, setPopulartext] = useState(0);

  const sectionsData = useMemo(
    () => [
      {
        key: 'mainSection',
        data: [mainSectionData],
        renderItem: ({item}) => {
          const {id: _unusedId, ...sectionProps} = item || {};
          return (
            <View
              onLayout={e => {
                const {height} = e.nativeEvent.layout;
                setMainSectionHeight(prev =>
                  Math.abs(prev - height) > 1 ? height : prev,
                );
              }}>
              <ExploreSection
                {...sectionProps}
                onHeaderLayout={height => setPopulartext(height)}
              />
            </View>
          );
        },
      },
      {
        key: 'popularStoresCombined',
        data: [POPULAR_SECTION_ITEM],
        renderItem: () => (
          <PopularStoresSection
            popularstores={popularstores}
            location={stableLocation}
            navigation={stableNavigation}
            screenWidth={screenWidth}
            loading={loading}
            popularloading={popularloading}
            popularempty={popularempty}
            onHeaderLayout={height => setPopulartext(height)}
            drinkType={drinkType}
          />
        ),
      },
    ],
    [
      drinkType,
      loading,
      mainSectionData,
      popularempty,
      popularloading,
      popularstores,
      screenWidth,
      setPopulartext,
      stableLocation,
      stableNavigation,
    ],
  );
  const headerTopPadding = insets.top + (Platform.OS === 'android' ? 10 : 0);

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents={'auto'}
        style={[styles.topView2]}
        onLayout={event => {
          const {height} = event.nativeEvent.layout;
          setTopView2Height(height);
        }}>
        <View style={{flexDirection: 'column'}}>
          <View style={[styles.headerRow, {paddingTop: headerTopPadding + 6}]}>
            <ExploreSearchBar handleSearchPress={handleSearchPress} />
            <View style={styles.topView2Actions}>
              <NotificationButton
                unreadNotification={unreadNotification}
                floating={false}
                iconColor="#181a1a"
                badgeColor="#3CBBFF"
              />
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 20,
              marginVertical: 12,
            }}>
            <Pressable
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
              style={[styles.addressPressableCompact, {marginLeft: 0}]}
              onPress={setLocationHandle}>
              <Ionicons
                name="location-outline"
                size={18}
                color="#333"
                style={styles.noticeIcon}
              />
              <CustomText
                maxScale={1.0}
                style={styles.todayAddress2}
                numberOfLines={1}
                ellipsizeMode="tail">
                {formatAddress(address)}
              </CustomText>
              {address && (
                <Feather name="chevron-right" size={18} color="#333" />
              )}
            </Pressable>
          </View>
        </View>
      </Animated.View>

      <Animated.View
        pointerEvents={touchable ? 'auto' : 'none'}
        style={[
          styles.fixedFilterHeader,
          {
            top: topView2Height,
            opacity: filterHeaderProgress,
            transform: [{translateY: stickyTranslateY}],
          },
        ]}>
        <FilterHeader
          ref={registerFixedFilterHeader}
          navigation={stableNavigation}
          drinkType={drinkType}
          setDrinkType={setDrinkType}
          screenWidth={screenWidth}
          priceOrder={priceOrder}
          setPriceOrder={setPriceOrder}
          onFilterScroll={handleFixedFilterScroll}
        />
      </Animated.View>

      <Animated.SectionList
        ref={scrollRef}
        sections={sectionsData}
        keyExtractor={(item, index) => item?.id ?? index.toString()}
        renderItem={({item, section}) => section.renderItem({item})}
        onScrollBeginDrag={() => closeAllFilterDropdowns(false)}
        onMomentumScrollBegin={() => closeAllFilterDropdowns(false)}
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {
            useNativeDriver: Platform.OS === 'android',
            listener: event => {
              updateVisibility(event?.nativeEvent?.contentOffset?.y ?? 0);
            },
          },
        )}
        renderSectionHeader={({section}) => {
          if (section.key === 'popularStoresCombined') {
            return (
              <Animated.View style={{opacity: listFilterOpacity}}>
                <FilterHeader
                  ref={registerListFilterHeader}
                  navigation={stableNavigation}
                  drinkType={drinkType}
                  setDrinkType={setDrinkType}
                  screenWidth={screenWidth}
                  priceOrder={priceOrder}
                  setPriceOrder={setPriceOrder}
                  onFilterScroll={handleListFilterScroll}
                />
              </Animated.View>
            );
          }
          return null;
        }}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            {...(Platform.OS === 'android'
              ? {progressViewOffset: listTopPadding}
              : {})}
          />
        }
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.7}
        contentContainerStyle={{
          paddingTop: listTopPadding,
          backgroundColor: '#fff',
        }}
        automaticallyAdjustContentInsets={false}
        contentInsetAdjustmentBehavior="never"
        scrollIndicatorInsets={{top: 0, left: 0, bottom: 0, right: 0}}
        ListFooterComponent={null}
        initialNumToRender={4}
        maxToRenderPerBatch={7}
        windowSize={4}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      <AnimatedPressable
        hitSlop={10}
        onPress={handleAiChatPress}
        style={[
          styles.aiChatButton,
          {
            bottom: aiChatButtonBottom,
            transform: [{translateY: aiChatLift}],
          },
        ]}>
        <LinearGradient
          colors={['#3CBBFF', '#30D4F9', '#9A6CFF']}
          locations={[0, 0.5, 1]}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.aiChatButtonGradient}
        />
        <Animated.View>
          <ChatbotIcon size={35} color="#FFF" />
        </Animated.View>
      </AnimatedPressable>
      <ScrollToTopButton
        visible={showScrollToTop}
        onPress={handleScrollToTop}
        bottom={aiChatButtonBottom}
        right={16}
      />

      {rejectModalData && !loading && (
        <RejectModal
          data={rejectModalData}
          onClose={() => setRejectModalData(null)}
        />
      )}
      <Loading loading={isRefreshing || loading || popularloading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  absoluteTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: screenHeight,
  },
  topView: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 3,
    marginHorizontal: 18,
    paddingHorizontal: 4,
  },
  todayAddress: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
    flexShrink: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    gap: 16,
  },
  addressContainer: {
    flex: 1,
  },
  addressPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  addressPressableCompact: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topView2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    backgroundColor: '#fff',
  },
  noticeIcon: {
    marginRight: 4,
  },
  todayAddress2: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#181a1a',
    flexShrink: 1,
    marginRight: 3,
  },
  topView2Actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fixedFilterHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: '#fff',
  },
  aiChatButton: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    width: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.17,
    shadowRadius: 2,
    elevation: 2,
    borderRadius: 100,
    paddingBottom: 1,
    overflow: 'hidden',
  },
  aiChatButtonGradient: {
    ...StyleSheet.absoluteFillObject,
  },
});

const screens = [
  'IZAKAYA',
  'KOREAN',
  'WESTERN',
  'CHINESE',
  'POCHA',
  'GAMSEONG',
  'GRILLED_STEW',
  'CHICKEN_HOF',
  'RAW_SEAFOOD',
  'PUB_BAR',
];

export default ExploreScreen;
