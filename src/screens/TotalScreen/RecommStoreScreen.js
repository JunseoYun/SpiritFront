import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import RecommTotalItem from '../../components/TotalScreen/RecommTotalItem';
import RecommTotalItemSkeleton from '../../components/TotalScreen/TotalSkeleton/RecommTotalItemSkeleton';
import {drinkTabs} from '../../components/ExploreScreen/TodayRecomm/mockRecommData';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import useScrollToTopVisibility from '../../hooks/useScrollToTopVisibility';
import ScrollToTopButton from '../../utils/ScrollToTopButton';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import {Store_getby_drinkPrice} from '../../api/storeApi';

const isValidDrinkTab = value => drinkTabs.some(tab => tab.value === value);
const TAB_CONTENT_HORIZONTAL_PADDING = 20;
const DEFAULT_PAGE_SIZE = 10;

const RecommStoreScreen = ({navigation, route}) => {
  const {bottom} = useSafeAndroidInsets();
  const insets = useSafeAreaInsets();
  const initialTabFromRoute = route?.params?.initialTab;
  const sourceRouteKey = route?.params?.sourceRouteKey;
  const tabNavigatorKey = route?.params?.tabNavigatorKey;
  const location = route?.params?.location;
  const tabScrollRef = useRef(null);
  const tabPositionMapRef = useRef({});
  const requestSeqRef = useRef(0);
  const loadingMoreRef = useRef(false);

  const [selectedTab, setSelectedTab] = useState(() =>
    isValidDrinkTab(initialTabFromRoute)
      ? initialTabFromRoute
      : drinkTabs[0].value,
  );
  const [stores, setStores] = useState(() =>
    Array.isArray(route?.params?.stores) ? route.params.stores : [],
  );
  const [page, setPage] = useState(0);
  const [isLastPage, setIsLastPage] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [firstloading, setFirstloading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const headerTitleText = useCallback(() => {
    const tabLabel =
      drinkTabs.find(tab => tab.value === selectedTab)?.label ||
      drinkTabs[0].label;

    return `${tabLabel} 최저가 매장`;
  }, [selectedTab]);

  const renderHeaderTitle = useCallback(
    () => (
      <CustomText style={styles.headerTitle}>{headerTitleText()}</CustomText>
    ),
    [headerTitleText],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: renderHeaderTitle,
    });
  }, [navigation, renderHeaderTitle]);

  const {
    scrollRef,
    visible: showScrollToTop,
    handleScroll,
    updateVisibility,
    scrollToTop,
  } = useScrollToTopVisibility();
  const listKey = selectedTab;
  const scrollButtonBottom = (bottom || 16) + 34;

  const scrollSelectedTabToLeft = useCallback((tabValue, animated = true) => {
    const measuredX = tabPositionMapRef.current?.[tabValue];
    if (typeof measuredX !== 'number') {
      return;
    }
    const targetX = Math.max(0, measuredX - TAB_CONTENT_HORIZONTAL_PADDING);
    tabScrollRef.current?.scrollTo({x: targetX, y: 0, animated});
  }, []);

  const fetchDrinkPricePage = useCallback(
    async ({tabValue, pageToLoad = 0, append = false} = {}) => {
      const latitude = location?.latitude;
      const longitude = location?.longitude;
      if (!latitude || !longitude || !isValidDrinkTab(tabValue)) {
        return;
      }

      const requestSeq = ++requestSeqRef.current;

      const data = await Store_getby_drinkPrice(
        latitude,
        longitude,
        tabValue,
        pageToLoad,
        DEFAULT_PAGE_SIZE,
      );

      if (requestSeq !== requestSeqRef.current) {
        return;
      }

      const content = Array.isArray(data?.content) ? data.content : [];
      const nextPage =
        typeof data?.number === 'number' ? data.number : pageToLoad;
      const lastFromApi =
        typeof data?.last === 'boolean' ? data.last : undefined;
      const computedLast =
        typeof lastFromApi === 'boolean'
          ? lastFromApi
          : content.length < DEFAULT_PAGE_SIZE;
      const effectiveLast = computedLast || content.length === 0;

      setPage(nextPage);
      setIsLastPage(effectiveLast);
      setStores(prev => (append ? [...prev, ...content] : content));
    },
    [location?.latitude, location?.longitude],
  );

  useEffect(() => {
    if (isValidDrinkTab(initialTabFromRoute)) {
      setSelectedTab(prev =>
        prev === initialTabFromRoute ? prev : initialTabFromRoute,
      );
    }
  }, [initialTabFromRoute]);

  useEffect(() => {
    if (!sourceRouteKey || !isValidDrinkTab(selectedTab)) {
      return;
    }
    navigation.dispatch({
      ...CommonActions.setParams({
        todayRecommTab: selectedTab,
      }),
      source: sourceRouteKey,
      target: tabNavigatorKey,
    });
  }, [navigation, selectedTab, sourceRouteKey, tabNavigatorKey]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      scrollSelectedTabToLeft(selectedTab, true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [scrollSelectedTabToLeft, selectedTab]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      scrollRef.current?.scrollToOffset({offset: 0, animated: true});
      updateVisibility(0);
    });
    return () => cancelAnimationFrame(frameId);
  }, [selectedTab, scrollRef, updateVisibility]);

  useEffect(() => {
    if (firstloading || refreshing) {
      updateVisibility(0);
    }
  }, [firstloading, refreshing, updateVisibility]);

  useEffect(() => {
    const latitude = location?.latitude;
    const longitude = location?.longitude;
    if (!latitude || !longitude || !isValidDrinkTab(selectedTab)) {
      setStores([]);
      setPage(0);
      setIsLastPage(true);
      setFirstloading(false);
      return;
    }

    let canceled = false;
    loadingMoreRef.current = false;
    setLoadingMore(false);
    setFirstloading(true);
    setPage(0);
    setIsLastPage(false);

    fetchDrinkPricePage({tabValue: selectedTab, pageToLoad: 0, append: false})
      ?.catch?.(() => {})
      ?.finally?.(() => {
        if (!canceled) {
          setFirstloading(false);
        }
      });

    return () => {
      canceled = true;
      requestSeqRef.current += 1;
    };
  }, [
    fetchDrinkPricePage,
    location?.latitude,
    location?.longitude,
    selectedTab,
  ]);

  const onRefresh = useCallback(() => {
    const latitude = location?.latitude;
    const longitude = location?.longitude;
    if (!latitude || !longitude || !isValidDrinkTab(selectedTab)) {
      return;
    }

    setRefreshing(true);
    loadingMoreRef.current = false;
    setLoadingMore(false);
    setIsLastPage(false);
    setPage(0);

    fetchDrinkPricePage({tabValue: selectedTab, pageToLoad: 0, append: false})
      ?.catch?.(() => {})
      ?.finally?.(() => {
        setRefreshing(false);
      });
  }, [
    fetchDrinkPricePage,
    location?.latitude,
    location?.longitude,
    selectedTab,
  ]);

  const handleEndReached = useCallback(() => {
    const latitude = location?.latitude;
    const longitude = location?.longitude;
    if (
      !latitude ||
      !longitude ||
      firstloading ||
      refreshing ||
      isLastPage ||
      loadingMoreRef.current
    ) {
      return;
    }

    loadingMoreRef.current = true;
    setLoadingMore(true);
    const nextPage = page + 1;

    fetchDrinkPricePage({
      tabValue: selectedTab,
      pageToLoad: nextPage,
      append: true,
    })
      ?.catch?.(() => {})
      ?.finally?.(() => {
        loadingMoreRef.current = false;
        setLoadingMore(false);
      });
  }, [
    fetchDrinkPricePage,
    firstloading,
    isLastPage,
    location?.latitude,
    location?.longitude,
    page,
    refreshing,
    selectedTab,
  ]);

  const renderStoreItem = ({item}) => (
    <RecommTotalItem
      store={item}
      navigation={navigation}
      location={location}
      drinkType={selectedTab}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabTrack}>
        <ScrollView
          ref={tabScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabContentContainer}>
          {drinkTabs.map(tab => {
            const isActive = selectedTab === tab.value;

            return (
              <Pressable
                key={tab.value}
                onPress={() => setSelectedTab(tab.value)}
                hitSlop={8}
                onLayout={({nativeEvent}) => {
                  tabPositionMapRef.current[tab.value] = nativeEvent.layout.x;
                  if (tab.value === selectedTab) {
                    scrollSelectedTabToLeft(tab.value, true);
                  }
                }}
                style={[styles.tabItem, isActive && styles.tabItemActive]}>
                <CustomText
                  style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.label}
                </CustomText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {firstloading || refreshing ? (
        <FlatList
          key={listKey}
          data={[1, 2, 3, 4]}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={() => <RecommTotalItemSkeleton />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: insets.bottom + 20}}
        />
      ) : (
        <FlatList
          ref={scrollRef}
          key={listKey}
          data={stores}
          renderItem={renderStoreItem}
          keyExtractor={(item, index) =>
            String(item?.id ?? `${selectedTab}-${index}`)
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollViewContent,
            {paddingBottom: insets.bottom + 20},
          ]}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={6}
          removeClippedSubviews={Platform.OS === 'android'}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.listFooter}>
                <ActivityIndicator size="small" color={ColorUtil.main} />
              </View>
            ) : null
          }
        />
      )}

      {stores.length === 0 && !firstloading && !refreshing && (
        <CustomText style={styles.emptyText}>추천 매장이 없어요.</CustomText>
      )}

      <ScrollToTopButton
        visible={showScrollToTop}
        bottom={scrollButtonBottom}
        onPress={scrollToTop}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
    color: '#333',
  },
  tabTrack: {
    marginTop: 10,
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  tabContentContainer: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: TAB_CONTENT_HORIZONTAL_PADDING,
  },
  tabItem: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: ColorUtil.placeholderBorder,
  },
  tabItemActive: {
    backgroundColor: ColorUtil.mainChip,
    borderColor: ColorUtil.main,
  },
  tabText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Pretendard-Medium',
  },
  tabTextActive: {
    color: ColorUtil.main,
  },
  scrollViewContent: {
    paddingBottom: 24,
  },
  listFooter: {
    paddingVertical: 18,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 60,
    fontFamily: 'Pretendard-Medium',
    fontSize: 17,
    color: '#c0c0c0',
    alignSelf: 'center',
  },
});

export default RecommStoreScreen;
