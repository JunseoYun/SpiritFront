import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  BackHandler,
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
import {Store_getby_liked, Store_getby_saved} from '../../api/storeApi';
import LikedGridItem from '../../components/LikedScreen/LikedGridItem';
import ScrapImageItem from '../../components/LikedScreen/ScrapImageItem';
import LikedGridItemSkeleton from '../../components/LikedScreen/LikedGridItemSkeleton';
import {useAuth} from '../../context/AuthContext';
import Loading from '../../hooks/Loading';
import useScrollToTopVisibility from '../../hooks/useScrollToTopVisibility';
import ScrollToTopButton from '../../utils/ScrollToTopButton';
import CustomText from '../../utils/CustomText';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

const TABS = [
  {
    key: 'liked',
    label: '매장',
    empty: '좋아요한 매장이 없어요',
  },
  {
    key: 'saved',
    label: '스크랩',
    empty: '저장한 매장이 없어요',
  },
];

const SCRAP_GRID_COLUMNS = 3;
const SCRAP_GRID_GAP = 1;
const STORE_GRID_COLUMNS = 2;
const STORE_GRID_GAP = 14;
const STORE_LIST_PADDING = 16;

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
        onPress={onPress}
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
      contentContainerStyle={{paddingBottom: insets.bottom}}
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
      const [state, setState] = getTabState(tabKey);
      const fetcher =
        tabKey === 'liked' ? Store_getby_liked : Store_getby_liked;

      if (state.loading || (!state.hasMore && !refresh)) return;
      setState(prev => ({...prev, loading: true}));

      try {
        const storesData = await fetcher(currentPage);
        if (storesData && storesData.length > 0) {
          setState(prev => {
            const merged = refresh
              ? storesData
              : [...prev.items, ...storesData];
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
    [likedState, savedState],
  );

  const handleStorePress = store => {
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
      setActiveTab(0);
      setLikedState(createTabState());
      setSavedState(createTabState());
      scrollOffsetsRef.current = {liked: 0, saved: 0};
      likedListRef.current?.scrollToOffset({offset: 0, animated: false});
      savedListRef.current?.scrollToOffset({offset: 0, animated: false});
      scrollRef.current = likedListRef.current;
      updateVisibility(0);
    }, [updateVisibility]),
  );

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
      if (activeState.firstLoading) {
        fetchStoresForTab(activeTabKey, 0, true);
      }
      updateVisibility(0);
    }, [
      token,
      activeState.firstLoading,
      activeTabKey,
      fetchStoresForTab,
      updateVisibility,
    ]),
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
        onPress={handleStorePress}
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
    marginBottom: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
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
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#f4f4f5',
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
