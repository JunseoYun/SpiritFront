import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  BackHandler,
  DeviceEventEmitter,
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {TabView} from 'react-native-tab-view';
import {Store_getby_liked} from '../../api/storeApi';
import {PostGetBySaved} from '../../api/postApi';
import {Userdataget} from '../../api/userApi';
import LikedGridItem from '../../components/LikedScreen/LikedGridItem';
import ScrapImageItem from '../../components/LikedScreen/ScrapImageItem';
import LikedGridItemSkeleton from '../../components/LikedScreen/LikedGridItemSkeleton';
import {useAuth} from '../../context/AuthContext';
import Loading from '../../hooks/Loading';
import useScrollToTopVisibility from '../../hooks/useScrollToTopVisibility';
import ScrollToTopButton from '../../utils/ScrollToTopButton';
import CustomText from '../../utils/CustomText';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import ColorUtil from '../../utils/ColorUtil';

const TABS = [
  {
    key: 'liked',
    label: '매장',
    empty: '좋아요한 매장이 없어요',
  },
  {
    key: 'saved',
    label: '게시글',
    empty: '저장한 매장이 없어요',
  },
];

const SCRAP_GRID_COLUMNS = 3;
const SCRAP_GRID_GAP = 1;
const STORE_GRID_COLUMNS = 2;
const STORE_GRID_GAP = 14;
const STORE_LIST_PADDING = 16;
const SAVED_POST_PAGE_SIZE = 20;

const createTabState = () => ({
  items: [],
  page: 0,
  loading: false,
  refreshing: false,
  hasMore: true,
  firstLoading: true,
});

const StoreTabContent = ({
  data,
  listRef,
  onScroll,
  onEndReached,
  onRefresh,
  refreshing,
  loading,
  emptyText,
  insets,
  cardWidth,
  gap,
  onPress,
}) => {
  const renderItem = useCallback(
    ({item, index}) => (
      <LikedGridItem
        store={item}
        width={cardWidth}
        onPress={onPress}
        style={{
          marginRight:
            index % STORE_GRID_COLUMNS === STORE_GRID_COLUMNS - 1 ? 0 : gap,
          marginBottom: gap,
          paddingTop: 5,
        }}
      />
    ),
    [cardWidth, gap, onPress],
  );

  return (
    <FlatList
      ref={listRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={item => String(item?.id ?? item?.storeId ?? item?.store_id)}
      numColumns={STORE_GRID_COLUMNS}
      showsVerticalScrollIndicator={false}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={7}
      removeClippedSubviews={Platform.OS === 'android'}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={
        !loading && data.length === 0 ? (
          <CustomText style={styles.emptyText}>{emptyText}</CustomText>
        ) : null
      }
      contentContainerStyle={{
        paddingHorizontal: STORE_LIST_PADDING,
        paddingBottom: insets.bottom,
      }}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
};

const ScrapTabContent = ({
  data,
  listRef,
  onScroll,
  onEndReached,
  onRefresh,
  refreshing,
  loading,
  emptyText,
  insets,
  itemSize,
  gap,
  onPress,
}) => {
  const renderItem = useCallback(
    ({item, index}) => (
      <ScrapImageItem
        store={item}
        size={itemSize}
        onPress={() => onPress?.(item, index)}
        style={{
          marginRight:
            index % SCRAP_GRID_COLUMNS === SCRAP_GRID_COLUMNS - 1 ? 0 : gap,
          marginBottom: gap,
        }}
      />
    ),
    [itemSize, gap, onPress],
  );

  return (
    <FlatList
      ref={listRef}
      data={data}
      renderItem={renderItem}
      keyExtractor={item => String(item?.id ?? item?.storeId ?? item?.store_id)}
      numColumns={SCRAP_GRID_COLUMNS}
      showsVerticalScrollIndicator={false}
      initialNumToRender={18}
      maxToRenderPerBatch={12}
      windowSize={7}
      removeClippedSubviews={Platform.OS === 'android'}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      onRefresh={onRefresh}
      refreshing={refreshing}
      ListEmptyComponent={
        !loading && data.length === 0 ? (
          <CustomText style={styles.emptyText}>{emptyText}</CustomText>
        ) : null
      }
      contentContainerStyle={{paddingTop: 1, paddingBottom: insets.bottom}}
      onScroll={onScroll}
      scrollEventThrottle={16}
    />
  );
};

const LikeScreen = ({navigation}) => {
  const {token} = useAuth();
  const insets = useSafeAreaInsets();
  const {width: screenWidth} = useWindowDimensions();
  const [activeTab, setActiveTab] = useState(0);
  const [tabsWidth, setTabsWidth] = useState(0);
  const likedListRef = useRef(null);
  const savedListRef = useRef(null);
  const scrollRef = useRef(null);
  const scrollOffsetsRef = useRef({liked: 0, saved: 0});
  const [likedState, setLikedState] = useState(createTabState);
  const [savedState, setSavedState] = useState(createTabState);
  const likedStateRef = useRef(likedState);
  const savedStateRef = useRef(savedState);
  const [userProfile, setUserProfile] = useState(null);
  const isSwipingRef = useRef(false);
  const swipeTimerRef = useRef(null);
  const pendingReturnTabRef = useRef(null);
  const lastActiveTabKeyRef = useRef(TABS[0].key);
  const {
    visible: showScrollToTop,
    handleScroll,
    updateVisibility,
    scrollToTop,
  } = useScrollToTopVisibility({externalRef: scrollRef});

  const scrapItemSize = useMemo(
    () =>
      (screenWidth - SCRAP_GRID_GAP * (SCRAP_GRID_COLUMNS - 1)) /
      SCRAP_GRID_COLUMNS,
    [screenWidth],
  );
  const storeCardWidth = useMemo(
    () =>
      (screenWidth -
        STORE_LIST_PADDING * 2 -
        STORE_GRID_GAP * (STORE_GRID_COLUMNS - 1)) /
      STORE_GRID_COLUMNS,
    [screenWidth],
  );

  const activeTabKey = TABS[activeTab].key;
  const activeState = activeTabKey === 'liked' ? likedState : savedState;
  const tabWidth = tabsWidth ? tabsWidth / TABS.length : 0;
  const indicatorWidth = tabWidth ? tabWidth * 0.3 : 0;

  const getTabState = tabKey =>
    tabKey === 'liked'
      ? [likedState, setLikedState]
      : [savedState, setSavedState];

  const fetchStoresForTab = useCallback(
    async (tabKey, currentPage, refresh = false) => {
      const stateRef = tabKey === 'liked' ? likedStateRef : savedStateRef;
      const setState = tabKey === 'liked' ? setLikedState : setSavedState;
      const fetcher =
        tabKey === 'liked' ? Store_getby_liked : PostGetBySaved;
      const state = stateRef.current;

      if ((state.loading && !refresh) || (!state.hasMore && !refresh)) return;
      setState(prev => ({...prev, loading: true}));

      try {
        const response =
          tabKey === 'liked'
            ? await fetcher(currentPage)
            : await fetcher({page: currentPage, size: SAVED_POST_PAGE_SIZE});
        const items =
          tabKey === 'liked'
            ? Array.isArray(response)
              ? response
              : []
            : Array.isArray(response?.content)
            ? response.content
            : Array.isArray(response)
            ? response
            : [];
        if (items.length > 0) {
          setState(prev => {
            const merged = refresh ? items : [...prev.items, ...items];
            const unique = Array.from(
              new Map(
                merged.map(store => [
                  String(store?.id ?? store?.storeId ?? store?.store_id),
                  store,
                ]),
              ).values(),
            );
            return {
              ...prev,
              items: unique,
            };
          });
        } else {
          setState(prev => ({...prev, hasMore: false}));
        }
      } catch (error) {
        console.error('Failed to load stores:', error);
      } finally {
        setState(prev => ({
          ...prev,
          loading: false,
          refreshing: false,
          firstLoading: false,
        }));
      }
    },
    [],
  );

  const handleStorePress = store => {
    if (isSwipingRef.current) return;
    const storeId = store?.id ?? store?.storeId;
    if (!storeId) return;
    navigation.navigate('StoreStack', {
      screen: 'StoreMainScreen',
      params: {
        storeId,
        innerlatitude: store?.locationDto?.latitude,
        innerlongitude: store?.locationDto?.longitude,
      },
    });
  };

  const handleTabPress = index => {
    if (index === activeTab) return;
    setActiveTab(index);
  };

  const loadMoreStores = tabKey => {
    const [state, setState] = getTabState(tabKey);
    if (!state.loading && state.hasMore) {
      const nextPage = state.page + 1;
      setState(prev => ({...prev, page: nextPage}));
      fetchStoresForTab(tabKey, nextPage);
    }
  };

  const handleRefresh = tabKey => {
    const [, setState] = getTabState(tabKey);
    setState(prev => ({
      ...prev,
      items: [],
      page: 0,
      hasMore: true,
      refreshing: true,
    }));
    fetchStoresForTab(tabKey, 0, true);
    if (tabKey === activeTabKey) {
      updateVisibility(0);
    }
  };
  const refreshSavedPosts = useCallback((showRefreshing = true) => {
    setSavedState(prev => ({
      ...prev,
      items: [],
      page: 0,
      hasMore: true,
      refreshing: showRefreshing,
    }));
    fetchStoresForTab('saved', 0, true);
  }, [fetchStoresForTab]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (!token) return;
        navigation.navigate('MainScreen');
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove();
    }, [navigation, token]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        return () => {};
      }
      const nextTabKey =
        pendingReturnTabRef.current ?? lastActiveTabKeyRef.current;
      const nextTabIndex = TABS.findIndex(tab => tab.key === nextTabKey);
      setActiveTab(nextTabIndex >= 0 ? nextTabIndex : 0);
      pendingReturnTabRef.current = null;
      setLikedState(createTabState());
      setSavedState(createTabState());
      scrollOffsetsRef.current = {liked: 0, saved: 0};
      likedListRef.current?.scrollToOffset({offset: 0, animated: false});
      savedListRef.current?.scrollToOffset({offset: 0, animated: false});
      scrollRef.current =
        nextTabKey === 'saved' ? savedListRef.current : likedListRef.current;
      updateVisibility(0);
      fetchStoresForTab('liked', 0, true);
      fetchStoresForTab('saved', 0, true);
      return () => {};
    }, [fetchStoresForTab, token, updateVisibility]),
  );

  useEffect(() => {
    let isActive = true;
    const fetchUser = async () => {
      try {
        const data = await Userdataget();
        if (!isActive) return;
        setUserProfile({
          nickname: data?.nickname ?? '',
          imageuri: data?.imgUrl ?? null,
        });
      } catch (error) {}
    };
    if (token) {
      fetchUser();
    }
    return () => {
      isActive = false;
    };
  }, [token]);

  useEffect(() => {
    likedStateRef.current = likedState;
  }, [likedState]);

  useEffect(() => {
    savedStateRef.current = savedState;
  }, [savedState]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'post-saved-updated',
      () => refreshSavedPosts(true),
    );
    return () => sub.remove();
  }, [refreshSavedPosts]);

  useEffect(() => {
    const sub = DeviceEventEmitter.addListener(
      'like-screen-return-tab',
      payload => {
        pendingReturnTabRef.current = payload?.tabKey ?? null;
      },
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    lastActiveTabKeyRef.current = activeTabKey;
  }, [activeTabKey]);

  useEffect(() => {
    const offset = scrollOffsetsRef.current[activeTabKey] || 0;
    scrollRef.current =
      activeTabKey === 'liked' ? likedListRef.current : savedListRef.current;
    if (scrollRef.current) {
      scrollRef.current.scrollToOffset({offset, animated: false});
    }
    updateVisibility(offset);
  }, [activeTabKey, updateVisibility]);

  const handleTabScroll = useCallback(
    (tabKey, e) => {
      if (tabKey === activeTabKey) {
        handleScroll(e);
      }
      const offset = e.nativeEvent.contentOffset.y;
      scrollOffsetsRef.current[tabKey] = offset;
    },
    [activeTabKey, handleScroll],
  );

  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      updateVisibility(0);
    }, [token, updateVisibility]),
  );

  const renderScrapSkeletonItem = ({index}) => (
    <View
      style={[
        styles.skeletonItem,
        {
          width: scrapItemSize,
          height: scrapItemSize,
          marginRight:
            index % SCRAP_GRID_COLUMNS === SCRAP_GRID_COLUMNS - 1
              ? 0
              : SCRAP_GRID_GAP,
          marginBottom: SCRAP_GRID_GAP,
        },
      ]}
    />
  );

  const renderStoreSkeletonItem = ({index}) => (
    <LikedGridItemSkeleton
      width={storeCardWidth}
      style={{
        marginRight:
          index % STORE_GRID_COLUMNS === STORE_GRID_COLUMNS - 1
            ? 0
            : STORE_GRID_GAP,
        marginBottom: STORE_GRID_GAP,
      }}
    />
  );

  const skeletonData = useMemo(
    () => Array.from({length: 12}, (_, idx) => idx),
    [],
  );

  const renderTabBar = ({navigationState, position}) => {
    const tabIndicatorTranslateX = Animated.add(
      Animated.multiply(position, tabWidth),
      (tabWidth - indicatorWidth) / 2,
    );

    return (
      <View
        style={styles.tabs}
        onLayout={event => setTabsWidth(event.nativeEvent.layout.width)}>
        {navigationState.routes.map((tab, index) => {
          const selected = index === activeTab;
          return (
            <Pressable
              key={tab.key}
              style={styles.tabButton}
              onPress={() => handleTabPress(index)}>
              <CustomText
                style={[styles.tabText, selected && styles.tabTextActive]}>
                {tab.label}
              </CustomText>
            </Pressable>
          );
        })}
        <View style={styles.tabUnderline} />
        {tabWidth > 0 && (
          <Animated.View
            style={[
              styles.tabIndicator,
              {
                width: indicatorWidth,
                transform: [{translateX: tabIndicatorTranslateX}],
              },
            ]}
          />
        )}
      </View>
    );
  };

  const renderScene = ({route}) => {
    const tabKey = route.key;
    const tabState = tabKey === 'liked' ? likedState : savedState;
    const isStoreTab = tabKey === 'liked';
    const listRef = isStoreTab ? likedListRef : savedListRef;
    const showSkeleton = tabState.firstLoading || tabState.refreshing;

    if (showSkeleton) {
      return (
        <FlatList
          data={skeletonData}
          keyExtractor={item => String(item)}
          renderItem={
            isStoreTab ? renderStoreSkeletonItem : renderScrapSkeletonItem
          }
          numColumns={isStoreTab ? STORE_GRID_COLUMNS : SCRAP_GRID_COLUMNS}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          contentContainerStyle={
            isStoreTab ? {paddingHorizontal: STORE_LIST_PADDING} : null
          }
        />
      );
    }

    if (isStoreTab) {
      return (
        <StoreTabContent
          data={tabState.items}
          listRef={listRef}
          onScroll={e => handleTabScroll(tabKey, e)}
          onEndReached={() => loadMoreStores(tabKey)}
          onRefresh={() => handleRefresh(tabKey)}
          refreshing={tabState.refreshing}
          loading={tabState.loading}
          emptyText={TABS.find(tab => tab.key === tabKey)?.empty}
          insets={insets}
          cardWidth={storeCardWidth}
          gap={STORE_GRID_GAP}
          onPress={handleStorePress}
        />
      );
    }

    const handleScrapPress = (store, index) => {
      if (isSwipingRef.current) {
        return;
      }
      if (!Array.isArray(savedState.items) || savedState.items.length === 0) {
        return;
      }
      navigation.navigate('LikeSavedPostDetailScreen', {
        posts: savedState.items,
        initialIndex: index ?? 0,
        userProfile: userProfile ?? {nickname: '', imageuri: null},
      });
    };

    return (
      <ScrapTabContent
        data={tabState.items}
        listRef={listRef}
        onScroll={e => handleTabScroll(tabKey, e)}
        onEndReached={() => loadMoreStores(tabKey)}
        onRefresh={() => handleRefresh(tabKey)}
        refreshing={tabState.refreshing}
        loading={tabState.loading}
        emptyText={TABS.find(tab => tab.key === tabKey)?.empty}
        insets={insets}
        itemSize={scrapItemSize}
        gap={SCRAP_GRID_GAP}
        onPress={handleScrapPress}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {token ? (
        <TabView
          navigationState={{index: activeTab, routes: TABS}}
          renderScene={renderScene}
          onIndexChange={setActiveTab}
          onSwipeStart={() => {
            isSwipingRef.current = true;
            if (swipeTimerRef.current) {
              clearTimeout(swipeTimerRef.current);
            }
          }}
          onSwipeEnd={() => {
            if (swipeTimerRef.current) {
              clearTimeout(swipeTimerRef.current);
            }
            swipeTimerRef.current = setTimeout(() => {
              isSwipingRef.current = false;
            }, 120);
          }}
          renderTabBar={renderTabBar}
          initialLayout={{width: screenWidth}}
          lazy
          swipeEnabled
        />
      ) : (
        <CustomText style={styles.emptyText}>로그인 후 이용해주세요</CustomText>
      )}

      <ScrollToTopButton
        visible={showScrollToTop}
        bottom={18}
        onPress={scrollToTop}
      />
      <Loading loading={activeState.refreshing || activeState.loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 6,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: 'Pretendard-Bold',
    color: '#111827',
  },
  tabs: {
    flexDirection: 'row',
    position: 'relative',
    // marginBottom: 2,
  },
  tabButton: {
    flex: 1,
    paddingTop: 12,
    paddingBottom: 7,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    color: '#9ca3af',
    fontFamily: 'Pretendard-Medium',
  },
  tabTextActive: {
    color: '#111827',
    fontFamily: 'Pretendard-SemiBold',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 0.5,
    backgroundColor: ColorUtil.border,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: '#111827',
  },
  listContent: {},
  skeletonItem: {
    backgroundColor: '#f1f1f1',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 60,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default LikeScreen;
