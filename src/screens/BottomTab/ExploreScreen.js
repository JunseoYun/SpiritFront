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
import {Store_getby_main_banner, Store_getby_popular} from '../../api/storeApi';
import Loading from '../../hooks/Loading';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {has_unread_notification} from '../../api/notificationApi';
import {useDeepLink} from '../../context/DeepLinkContext';
import FilterHeader from '../../components/ExploreScreen/FilterHeader';
import ExploreSection from '../../components/ExploreScreen/ExploreSection';
import ExploreSearchBar from '../../components/ExploreScreen/ExploreSearchBar';
import NotificationButton from '../../components/ExploreScreen/NotificationButton';
import PopularStoresSection from '../../components/ExploreScreen/PopularStroe/PopularStoresSection';
import ScrollToTopButton from '../../utils/ScrollToTopButton';
import CustomText from '../../utils/CustomText';

const screenHeight = Dimensions.get('window').height;
const screenWidth = Dimensions.get('window').width;
const TOP_TOUCHABLE_DISTANCE = 24;
const POPULAR_SECTION_ITEM = {id: 'popularStoresSection'};

const ExploreScreen = ({navigation}) => {
  const {pendingStoreId} = useDeepLink();
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState('');
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const fixedFilterHeaderRef = useRef(null);
  const listFilterHeaderRef = useRef(null);
  const lastFilterScrollX = useRef(0);
  const scrollToTopListenerRef = useRef(null);
  const topViewScrollListener = useRef(null);
  const topOverlayListenerRef = useRef(null);
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  const contentTopPadding = useMemo(
    () => (Platform.OS === 'android' ? insets.top + 20 : insets.top + 10),
    [insets.top],
  );

  const [addressHeight, setAddressHeight] = useState(0);
  const [searchBarHeight, setSearchBarHeight] = useState(0);
  const [mainSectionHeight, setMainSectionHeight] = useState(0);
  const [showTopView2, setShowTopView2] = useState(false);
  const [topView2Height, setTopView2Height] = useState(0);
  const [touchable, setTouchable] = useState(false);
  const [isTopOverlayInteractive, setIsTopOverlayInteractive] = useState(true);
  const overlayInteractionOpacity = useMemo(
    () => (Platform.OS === 'ios' ? 0.02 : 0),
    [],
  );

  const [recommStores, setRecommStores] = useState([]);
  const [recommCategory, setRecommCategory] = useState(null);
  const [recommReason, setRecommReason] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const {recommendCategory} = useRecommendation();
  const [unreadNotification, setUnreadNotification] = useState(false);

  const formatAddress = useCallback(addr => {
    if (addr === '신논현역') {
      return addr;
    }
    return addr;
  }, []);

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

  const handleAddressLayout = useCallback(event => {
    const {height} = event.nativeEvent.layout;
    setAddressHeight(prev => (Math.abs(prev - height) > 1 ? height : prev));
  }, []);

  const handleSearchBarLayout = useCallback(event => {
    const {height} = event.nativeEvent.layout;
    setSearchBarHeight(prev => (Math.abs(prev - height) > 1 ? height : prev));
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

  const scrollToTopThreshold = useMemo(
    () => (Platform.OS === 'ios' ? screenHeight * 0.25 : screenHeight * 0.3),
    [],
  );
  const scrollToTopBottom = useMemo(() => 18, []);

  useEffect(() => {
    scrollToTopListenerRef.current = scrollY.addListener(({value}) => {
      const iosThreshold = insets.top + 40;
      const androidThreshold = insets.top + 100;
      const threshold = Platform.OS === 'ios' ? iosThreshold : androidThreshold;

      setShowScrollToTop(prev => {
        if (value >= scrollToTopThreshold && !prev) return true;
        if (value < scrollToTopThreshold && prev) return false;
        return prev;
      });
    });

    return () => {
      if (scrollToTopListenerRef.current)
        scrollY.removeListener(scrollToTopListenerRef.current);
    };
  }, [insets.top, scrollToTopThreshold, scrollY]);

  useEffect(() => {
    topViewScrollListener.current = scrollY.addListener(({value}) => {
      const iosThreshold = insets.top + 30;
      const androidThreshold = insets.top + 120;
      const threshold = Platform.OS === 'ios' ? iosThreshold : androidThreshold;

      setShowTopView2(prev => {
        if (value >= threshold && !prev) return true;
        if (value < threshold && prev) return false;
        return prev;
      });
    });

    return () => {
      if (topViewScrollListener.current)
        scrollY.removeListener(topViewScrollListener.current);
    };
  }, [insets.top, scrollY]);

  const stickyTranslateY = 0;

  const filterHeaderThreshold = useMemo(() => {
    if (!mainSectionHeight) return 100000;
    return Math.max(
      0,
      mainSectionHeight +
        searchBarHeight +
        contentTopPadding +
        addressHeight -
        topView2Height,
    );
  }, [
    mainSectionHeight,
    searchBarHeight,
    addressHeight,
    contentTopPadding,
    topView2Height,
  ]);

  const filterHeaderProgress = scrollY.interpolate({
    inputRange: [filterHeaderThreshold, filterHeaderThreshold],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const fixedFilterOpacity = filterHeaderProgress;
  const listFilterOpacity = Animated.subtract(1, filterHeaderProgress);

  const topBarThreshold = useMemo(
    () => (Platform.OS === 'ios' ? insets.top + 20 : insets.top + 50),
    [insets.top],
  );

  const topBarProgress = useMemo(
    () =>
      scrollY.interpolate({
        inputRange: [topBarThreshold - 10, topBarThreshold + 10],
        outputRange: [0, 1],
        extrapolate: 'clamp',
      }),
    [topBarThreshold, scrollY],
  );

  const topView2Opacity = topBarProgress;
  const topView2TranslateY = scrollY.interpolate({
    inputRange: [topBarThreshold - 10, topBarThreshold + 10],
    outputRange: [-6, 0],
    extrapolate: 'clamp',
  });
  const topBackgroundColor = topBarProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#3CBBFF', '#F5F5F5'],
    extrapolate: 'clamp',
  });

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
  const measuredHeaderHeight = useMemo(
    () => contentTopPadding + addressHeight + searchBarHeight,
    [contentTopPadding, addressHeight, searchBarHeight],
  );
  const headerOffset = useMemo(
    () =>
      measuredHeaderHeight > 0 ? measuredHeaderHeight : headerOffsetFallback,
    [measuredHeaderHeight, headerOffsetFallback],
  );
  const overlayTouchThreshold = useMemo(
    () => Math.max(TOP_TOUCHABLE_DISTANCE, headerOffset * 0.2),
    [headerOffset],
  );

  useEffect(() => {
    if (topOverlayListenerRef.current) {
      scrollY.removeListener(topOverlayListenerRef.current);
      topOverlayListenerRef.current = null;
    }

    const listenerId = scrollY.addListener(({value}) => {
      const shouldEnable = value <= overlayTouchThreshold;
      setIsTopOverlayInteractive(prev =>
        prev === shouldEnable ? prev : shouldEnable,
      );
    });

    topOverlayListenerRef.current = listenerId;

    return () => {
      if (listenerId) {
        scrollY.removeListener(listenerId);
      }
    };
  }, [overlayTouchThreshold, scrollY]);

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

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(showTopView2 ? 'white' : '#3CBBFF');
      }

      return () => {
        if (Platform.OS === 'android') {
          StatusBar.setBackgroundColor('white');
        }
      };
    }, [showTopView2]),
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

  const onRefresh = async () => {
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
  };

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

  const handleGoToChatbot = useCallback(() => {
    navigation.navigate('ChatbotScreen');
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('SearchScreen');
  }, [navigation]);

  const setLocationHandle = useCallback(() => {
    setTimeout(() => {
      navigation.navigate('SetLocationScreen');
    }, 50);
  }, [navigation]);

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
      isRefreshing,
      navigation,
      loading,
      handlestoreItemClick,
      catagoryClick,
    }),
    [
      recommCategory,
      recommReason,
      recommStores,
      location,
      isRefreshing,
      loading,
      navigation,
      handlestoreItemClick,
      catagoryClick,
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

  const renderTopStack = useCallback(
    ({onAddressLayout, onSearchLayout} = {}) => (
      <>
        <View
          style={styles.topView}
          onLayout={event => {
            if (onAddressLayout) {
              onAddressLayout(event);
            }
          }}>
          <Animated.View style={[styles.addressContainer]}>
            <Pressable
              hitSlop={{
                left: 15,
                right: 15,
                top: 15,
                bottom: 15,
              }}
              style={styles.addressPressable}
              onPress={setLocationHandle}>
              <CustomText
                maxScale={1.0}
                style={styles.todayAddress}
                numberOfLines={1}
                ellipsizeMode="tail">
                {formatAddress(address)}
              </CustomText>
              {formatAddress(address) && (
                <Feather name="chevron-right" size={22} color="#fff" />
              )}
            </Pressable>
          </Animated.View>
          <NotificationButton
            unreadNotification={unreadNotification}
            floating={false}
            iconColor="#fff"
          />
        </View>

        <View
          onLayout={event => {
            if (onSearchLayout) {
              onSearchLayout(event);
            }
          }}>
          <ExploreSearchBar handleSearchPress={handleSearchPress} />
        </View>
      </>
    ),
    [
      address,
      formatAddress,
      handleSearchPress,
      setLocationHandle,
      unreadNotification,
    ],
  );

  return (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.absoluteTop,
          {
            paddingTop: contentTopPadding,
            backgroundColor: topBackgroundColor,
          },
        ]}>
        {renderTopStack({
          onAddressLayout: handleAddressLayout,
          onSearchLayout: handleSearchBarLayout,
        })}
      </Animated.View>

      <Animated.View
        pointerEvents={isTopOverlayInteractive ? 'box-none' : 'none'}
        style={[
          styles.absoluteTop,
          {
            paddingTop: contentTopPadding,
            backgroundColor: 'transparent',
            zIndex: 60,
            opacity: isTopOverlayInteractive ? overlayInteractionOpacity : 0,
          },
        ]}>
        {renderTopStack()}
      </Animated.View>
      <Animated.View
        pointerEvents={topView2Opacity.__getValue() === 0 ? 'none' : 'auto'}
        style={[
          styles.topView2,
          {paddingTop: insets.top},
          insets.top === 0 && {height: 50},
          {
            opacity: topView2Opacity,
            transform: [{translateY: topView2TranslateY}],
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 1},
                shadowOpacity,
                shadowRadius: 1,
              },
              android: {
                elevation,
              },
            }),
          },
        ]}
        onLayout={event => {
          const {height} = event.nativeEvent.layout;
          setTopView2Height(height);
        }}>
        <Pressable
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          style={styles.addressPressableCompact}
          onPress={setLocationHandle}>
          <CustomText
            maxScale={1.0}
            style={styles.todayAddress2}
            numberOfLines={1}
            ellipsizeMode="tail">
            {formatAddress(address)}
          </CustomText>
          {address && (
            <Feather name="chevron-right" size={20} color="#181a1a" />
          )}
        </Pressable>
        <View style={styles.topView2Actions}>
          <Pressable
            hitSlop={10}
            style={{marginRight: 10}}
            onPress={handleSearchPress}>
            <Feather name="search" size={20} color="#181a1a" />
          </Pressable>
          <NotificationButton
            unreadNotification={unreadNotification}
            floating={false}
            iconColor="#181a1a"
            badgeColor="#3CBBFF"
          />
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
          },
        )}
        ListHeaderComponent={
          <View style={styles.chatbotButtonContainer}>
            <Pressable
              style={styles.chatbotButton}
              onPress={handleGoToChatbot}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <CustomText style={styles.chatbotButtonText}>
                AI 탐색/챗봇 바로가기
              </CustomText>
            </Pressable>
          </View>
        }
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
              ? {progressViewOffset: headerOffset}
              : {})}
          />
        }
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.7}
        contentContainerStyle={{
          paddingTop: headerOffset,
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

      <ScrollToTopButton
        visible={showScrollToTop}
        bottom={scrollToTopBottom}
        onPress={handleScrollToTop}
      />

      <Loading loading={isRefreshing || loading || popularloading} />
    </>
  );
};

const styles = StyleSheet.create({
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
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  topView2: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    backgroundColor: '#fff',
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  todayAddress2: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#181a1a',
    flexShrink: 1,
    marginRight: 3,
  },
  topView2Actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  fixedFilterHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 30,
    backgroundColor: '#fff',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  chatbotButtonContainer: {
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  chatbotButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#3CBBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatbotButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Pretendard-Bold',
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
