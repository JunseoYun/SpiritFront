import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
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
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import useScrollToTopVisibility from '../../hooks/useScrollToTopVisibility';
import ScrollToTopButton from '../../utils/ScrollToTopButton';
import CustomText from '../../utils/CustomText';
import ColorUtil from '../../utils/ColorUtil';
import {Store_getby_drinkPrice} from '../../api/storeApi';

export const drinkTabs = [
  {label: '소주', value: 'SOJU'},
  {label: '맥주', value: 'BEER'},
  {label: '막걸리', value: 'MAKGEOLLI'},
  {label: '와인', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '사케', value: 'SAKE'},
  {label: '고량주', value: 'KAOLIANG'},
  {label: '위스키', value: 'WHISKEY'},
  {label: '보드카', value: 'VODKA'},
  {label: '전통주', value: 'TRADITIONAL'},
  {label: '하이볼', value: 'HIGHBALL'},
  {label: '데킬라', value: 'TEQUILA'},
];

const isValidDrinkTab = value => drinkTabs.some(tab => tab.value === value);
const TAB_CONTENT_HORIZONTAL_PADDING = 20;
const DEFAULT_PAGE_SIZE = 10;
const TAB_HEIGHT = 44;
const TAB_TOP_OFFSET = 10;
const TAB_HIDE_START = 16;

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList);

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

  const scrollY = useRef(new Animated.Value(0)).current;

  const scrollYAdjusted = Animated.subtract(scrollY, TAB_HIDE_START);
  const clampedScroll = Animated.diffClamp(scrollYAdjusted, 0, TAB_HEIGHT);

  const tabTranslateY = clampedScroll.interpolate({
    inputRange: [0, TAB_HEIGHT],
    outputRange: [0, -TAB_HEIGHT],
    extrapolate: 'clamp',
  });
  const tabOpacity = clampedScroll.interpolate({
    inputRange: [0, TAB_HEIGHT * 0.6, TAB_HEIGHT],
    outputRange: [1, 0.35, 0],
    extrapolate: 'clamp',
  });

  const [selectedTab, setSelectedTab] = useState(() =>
    isValidDrinkTab(initialTabFromRoute)
      ? initialTabFromRoute
      : drinkTabs[0].value,
  );

  const [stores, setStores] = useState([]);
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
    if (typeof measuredX !== 'number') return;

    const targetX = Math.max(0, measuredX - TAB_CONTENT_HORIZONTAL_PADDING);

    tabScrollRef.current?.scrollTo({
      x: targetX,
      y: 0,
      animated,
    });
  }, []);

  const fetchDrinkPricePage = useCallback(
    async ({tabValue, pageToLoad = 0, append = false} = {}) => {
      const latitude = location?.latitude;
      const longitude = location?.longitude;

      if (!latitude || !longitude || !isValidDrinkTab(tabValue)) return;

      const requestSeq = ++requestSeqRef.current;

      const data = await Store_getby_drinkPrice(
        latitude,
        longitude,
        tabValue,
        pageToLoad,
        DEFAULT_PAGE_SIZE,
      );

      if (requestSeq !== requestSeqRef.current) return;

      const content = Array.isArray(data?.content) ? data.content : [];

      const nextPage =
        typeof data?.number === 'number' ? data.number : pageToLoad;

      const computedLast =
        typeof data?.last === 'boolean'
          ? data.last
          : content.length < DEFAULT_PAGE_SIZE;

      const effectiveLast = computedLast || content.length === 0;

      setPage(nextPage);
      setIsLastPage(effectiveLast);
      setStores(prev => (append ? [...prev, ...content] : content));
    },
    [location?.latitude, location?.longitude],
  );

  useEffect(() => {
    const latitude = location?.latitude;
    const longitude = location?.longitude;

    if (!latitude || !longitude || !isValidDrinkTab(selectedTab)) {
      setStores([]);
      setFirstloading(false);
      return;
    }

    setFirstloading(true);
    setPage(0);
    setIsLastPage(false);

    fetchDrinkPricePage({
      tabValue: selectedTab,
      pageToLoad: 0,
      append: false,
    }).finally(() => {
      setFirstloading(false);
    });
  }, [fetchDrinkPricePage, location, selectedTab]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);

    fetchDrinkPricePage({
      tabValue: selectedTab,
      pageToLoad: 0,
      append: false,
    }).finally(() => setRefreshing(false));
  }, [fetchDrinkPricePage, selectedTab]);

  const handleEndReached = useCallback(() => {
    if (firstloading || refreshing || isLastPage || loadingMoreRef.current)
      return;

    loadingMoreRef.current = true;
    setLoadingMore(true);

    const nextPage = page + 1;

    fetchDrinkPricePage({
      tabValue: selectedTab,
      pageToLoad: nextPage,
      append: true,
    }).finally(() => {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    });
  }, [
    fetchDrinkPricePage,
    firstloading,
    refreshing,
    isLastPage,
    page,
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
      <Animated.View
        style={[
          styles.tabTrack,
          {
            transform: [{translateY: tabTranslateY}],
            opacity: tabOpacity,
          },
        ]}>
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
      </Animated.View>

      {firstloading || refreshing ? (
        <FlatList
          data={[1, 2, 3, 4]}
          renderItem={() => <RecommTotalItemSkeleton />}
          keyExtractor={(item, index) => `${item}-${index}`}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={{
            paddingTop: TAB_HEIGHT + 20 + TAB_TOP_OFFSET,
            paddingBottom: insets.bottom + 20,
          }}
        />
      ) : (
        <AnimatedFlatList
          ref={scrollRef}
          key={listKey}
          data={stores}
          renderItem={renderStoreItem}
          keyExtractor={(item, index) =>
            String(item?.id ?? `${selectedTab}-${index}`)
          }
          showsVerticalScrollIndicator={false}
          bounces={false}
          overScrollMode="never"
          contentContainerStyle={{
            paddingTop: TAB_HEIGHT + TAB_TOP_OFFSET,
            paddingBottom: insets.bottom + 20,
          }}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={6}
          removeClippedSubviews={Platform.OS === 'android'}
          scrollEventThrottle={16}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onEndReached={handleEndReached}
          onEndReachedThreshold={0.5}
          onScroll={Animated.event(
            [{nativeEvent: {contentOffset: {y: scrollY}}}],
            {
              useNativeDriver: true,
              listener: handleScroll,
            },
          )}
          ListFooterComponent={
            loadingMore ? (
              <View style={styles.listFooter}>
                <ActivityIndicator size="small" color={ColorUtil.main} />
              </View>
            ) : null
          }
        />
      )}

      <ScrollToTopButton
        visible={showScrollToTop}
        bottom={(bottom || 16) + 34}
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: 10,
    backgroundColor: '#FFF',
    marginTop: 0,
    paddingBottom: 8,
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

  listFooter: {
    paddingVertical: 18,
  },
});

export default RecommStoreScreen;
