import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {CommonActions} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import PopularItemSkeleton from '../../components/ExploreScreen/PopularStroe/PopularItemSkeleton';
import RecommTotalItem from '../../components/TotalScreen/RecommTotalItem';
import {drinkTabs} from '../../components/ExploreScreen/TodayRecomm/mockRecommData';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import useScrollToTopVisibility from '../../hooks/useScrollToTopVisibility';
import ScrollToTopButton from '../../utils/ScrollToTopButton';
import CustomText from '../../utils/CustomText';
import {mockTodayRecommStoresByType} from './mockRecommStoreData';

const isValidDrinkTab = value => drinkTabs.some(tab => tab.value === value);
const TAB_CONTENT_HORIZONTAL_PADDING = 26;

const RecommStoreScreen = ({navigation, route}) => {
  const {bottom} = useSafeAndroidInsets();
  const insets = useSafeAreaInsets();
  const initialTabFromRoute = route?.params?.initialTab;
  const sourceRouteKey = route?.params?.sourceRouteKey;
  const tabNavigatorKey = route?.params?.tabNavigatorKey;
  const tabScrollRef = useRef(null);
  const tabPositionMapRef = useRef({});

  const [selectedTab, setSelectedTab] = useState(() =>
    isValidDrinkTab(initialTabFromRoute)
      ? initialTabFromRoute
      : drinkTabs[0].value,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [firstloading, setFirstloading] = useState(true);

  const stores = useMemo(
    () => mockTodayRecommStoresByType[selectedTab] || [],
    [selectedTab],
  );

  const {
    scrollRef,
    visible: showScrollToTop,
    handleScroll,
    updateVisibility,
    scrollToTop,
  } = useScrollToTopVisibility();
  const scrollButtonBottom = (bottom || 16) + 34;

  const scrollSelectedTabToLeft = useCallback((tabValue, animated = true) => {
    const measuredX = tabPositionMapRef.current?.[tabValue];
    if (typeof measuredX !== 'number') {
      return;
    }
    const targetX = Math.max(0, measuredX - TAB_CONTENT_HORIZONTAL_PADDING);
    tabScrollRef.current?.scrollTo({x: targetX, y: 0, animated});
  }, []);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      setFirstloading(false);
    });
    return () => cancelAnimationFrame(frameId);
  }, []);

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
    if (firstloading || refreshing) {
      updateVisibility(0);
    }
  }, [firstloading, refreshing, updateVisibility]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    requestAnimationFrame(() => {
      setRefreshing(false);
    });
  }, []);

  const renderStoreItem = ({item}) => (
    <RecommTotalItem
      store={item}
      navigation={navigation}
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
          data={[1, 2, 3, 4]}
          keyExtractor={(item, index) => `${item}-${index}`}
          renderItem={() => <PopularItemSkeleton />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: insets.bottom + 20}}
        />
      ) : (
        <FlatList
          ref={scrollRef}
          data={stores}
          renderItem={renderStoreItem}
          keyExtractor={(item, index) => `${item?.id ?? selectedTab}-${index}`}
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
          onEndReachedThreshold={0.5}
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
    backgroundColor: '#FFF',
  },
  tabTrack: {
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    backgroundColor: '#fff',
  },
  tabContentContainer: {
    paddingLeft: TAB_CONTENT_HORIZONTAL_PADDING,
  },
  tabItem: {
    height: 44,
    marginRight: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: '#111',
  },
  tabText: {
    fontSize: 15,
    color: '#8E8E8E',
    fontFamily: 'Pretendard-Medium',
  },
  tabTextActive: {
    color: '#111',
    fontFamily: 'Pretendard-SemiBold',
  },
  scrollViewContent: {
    paddingBottom: 24,
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
