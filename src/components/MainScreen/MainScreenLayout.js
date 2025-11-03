import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FilterHeader from './FilterHeader';
import MainSection from './MainSection';
import MainSearchBar from './MainSearchBar';
import NotificationButton from './NotificationButton';
import PopularStoresSection from './PopularStroe/PopularStoresSection';
import ScrollToTopButton from '../common/ScrollToTopButton';

const screenHeight = Dimensions.get('window').height;
const FILTER_STICKY_DELAY = 36;

const MainScreenLayout = ({
  insets,
  showTopView2,
  scrollY,
  scrollRef,
  showLocation,
  address,
  formatAddress,
  setLocationHandle,
  handleSearchPress,
  unreadNotification,
  mainSectionData,
  popularstores,
  loading,
  popularloading,
  popularempty,
  setPopulartext,
  showScrollToTop,
  scrollToTopBottom,
  handleScrollToTop,
  onRefresh,
  isRefreshing,
  drinkType,
  setDrinkType,
  priceOrder,
  setPriceOrder,
  loadMoreData,
  screenWidth,
  stableLocation,
  stableNavigation,
}) => {
  const contentTopPadding = useMemo(
    () => (Platform.OS === 'android' ? insets.top + 20 : insets.top + 10),
    [insets.top],
  );

  const filterHeaderRef = useRef(null);

  const [addressHeight, setAddressHeight] = useState(0);
  const [searchBarHeight, setSearchBarHeight] = useState(0);
  const [mainSectionHeight, setMainSectionHeight] = useState(0);
  const [filterHeight, setFilterHeight] = useState(0);
  const [filterHeaderOffset, setFilterHeaderOffset] = useState(null);
  const [topView2Height, setTopView2Height] = useState(0);

  const defaultTopBarHeight = useMemo(
    () => (Platform.OS === 'android' ? insets.top + 64 : insets.top + 54),
    [insets.top],
  );
  const effectiveTopBarHeight = useMemo(
    () => (topView2Height > 0 ? topView2Height : defaultTopBarHeight),
    [topView2Height, defaultTopBarHeight],
  );

  const topContentHeight = useMemo(
    () =>
      contentTopPadding + addressHeight + searchBarHeight + mainSectionHeight,
    [contentTopPadding, addressHeight, searchBarHeight, mainSectionHeight],
  );

  const filterHeaderThreshold = useMemo(() => {
    if (filterHeaderOffset != null) {
      const headerHeight = filterHeight || 0;
      const extraSpacing =
        headerHeight > 0 ? Math.max(40, Math.min(headerHeight * 0.8, 120)) : 40;
      const threshold =
        filterHeaderOffset +
        headerHeight -
        effectiveTopBarHeight +
        extraSpacing +
        FILTER_STICKY_DELAY;
      return threshold > 0 ? threshold : 0;
    }
    if (topContentHeight === 0) {
      return 100000;
    }
    const overlayOffset =
      effectiveTopBarHeight + (Platform.OS === 'android' ? 12 : 6);
    const earlySpacing = filterHeight ? Math.min(filterHeight * 0.4, 28) : 6;
    const threshold =
      topContentHeight - overlayOffset - earlySpacing + FILTER_STICKY_DELAY;
    return threshold > 0 ? threshold : 0;
  }, [
    filterHeaderOffset,
    topContentHeight,
    effectiveTopBarHeight,
    filterHeight,
  ]);

  const [isFilterSticky, setIsFilterSticky] = useState(false);

  useEffect(() => {
    if (filterHeaderThreshold === 100000) {
      setIsFilterSticky(false);
      return undefined;
    }

    const detachThreshold = Math.max(filterHeaderThreshold, 10);
    const attachThreshold = filterHeaderThreshold;
    const listenerId = scrollY.addListener(({value}) => {
      setIsFilterSticky(prev => {
        if (prev) {
          if (value <= detachThreshold) {
            return false;
          }
          return true;
        }
        return value >= attachThreshold;
      });
    });

    return () => scrollY.removeListener(listenerId);
  }, [scrollY, filterHeaderThreshold]);

  const fixedFilterOpacity = isFilterSticky ? 1 : 0;
  const listFilterOpacity = isFilterSticky ? 0 : 1;

  const topBarThreshold = useMemo(
    () => (Platform.OS === 'ios' ? insets.top + 36 : insets.top + 96),
    [insets.top],
  );

  const topBarProgress = scrollY.interpolate({
    inputRange: [topBarThreshold - 10, topBarThreshold + 10],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const topViewAddressOpacity = Animated.subtract(1, topBarProgress);
  const topView2Opacity = topBarProgress;
  const topView2TranslateY = scrollY.interpolate({
    inputRange: [topBarThreshold - 10, topBarThreshold + 10],
    outputRange: [-6, 0],
    extrapolate: 'clamp',
  });

  const sectionsData = useMemo(
    () => [
      {
        key: 'address',
        data: [{}],
        renderItem: () => (
          <View
            onLayout={e => {
              const {height} = e.nativeEvent.layout;
              setAddressHeight(prev =>
                Math.abs(prev - height) > 1 ? height : prev,
              );
            }}>
            <View style={styles.topView}>
              <Animated.View
                style={[
                  styles.addressContainer,
                  {opacity: topViewAddressOpacity},
                ]}>
                <Pressable
                  hitSlop={{
                    left: 15,
                    right: 15,
                    top: 15,
                    bottom: 15,
                  }}
                  style={styles.addressPressable}
                  onPress={setLocationHandle}>
                  <Text
                    allowFontScaling={false}
                    style={styles.todayAddress}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {formatAddress(address)}
                  </Text>
                  {!showLocation && (
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
          </View>
        ),
      },
      {
        key: 'searchBar',
        data: [{}],
        renderItem: () => (
          <View
            onLayout={e => {
              const {height} = e.nativeEvent.layout;
              setSearchBarHeight(prev =>
                Math.abs(prev - height) > 1 ? height : prev,
              );
            }}>
            <MainSearchBar handleSearchPress={handleSearchPress} />
          </View>
        ),
      },
      {
        key: 'mainSection',
        data: [mainSectionData],
        renderItem: ({item}) => (
          <View
            onLayout={e => {
              const {height} = e.nativeEvent.layout;
              setMainSectionHeight(prev =>
                Math.abs(prev - height) > 1 ? height : prev,
              );
            }}>
            <MainSection
              {...item}
              onHeaderLayout={height => setPopulartext(height)}
            />
          </View>
        ),
      },
      {
        key: 'popularStoresCombined',
        data: [{}],
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
          />
        ),
      },
    ],
    [
      address,
      formatAddress,
      handleSearchPress,
      loading,
      mainSectionData,
      popularempty,
      popularloading,
      popularstores,
      screenWidth,
      setPopulartext,
      showLocation,
      stableLocation,
      stableNavigation,
      topViewAddressOpacity,
      unreadNotification,
    ],
  );

  return (
    <>
      <View
        pointerEvents="box-none"
        style={[
          styles.absoluteTop,
          {
            paddingTop: contentTopPadding,
            backgroundColor: showTopView2 ? '#F5F5F5' : '#3CBBFF',
          },
        ]}
      />

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
                shadowOpacity: isFilterSticky ? 0 : 0.1,
                shadowRadius: 1,
              },
              android: {
                elevation: isFilterSticky ? 0 : 1,
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
          <Text
            allowFontScaling={false}
            style={styles.todayAddress2}
            numberOfLines={1}
            ellipsizeMode="tail">
            {formatAddress(address)}
          </Text>
          <Feather name="chevron-right" size={20} color="#181a1a" />
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
        pointerEvents={isFilterSticky ? 'auto' : 'none'}
        style={[
          styles.fixedFilterHeader,
          {
            top: topView2Height,
            opacity: fixedFilterOpacity,
          },
        ]}>
        <FilterHeader
          ref={filterHeaderRef}
          navigation={stableNavigation}
          drinkType={drinkType}
          setDrinkType={setDrinkType}
          screenWidth={screenWidth}
          priceOrder={priceOrder}
          setPriceOrder={setPriceOrder}
        />
      </Animated.View>

      <Animated.SectionList
        ref={scrollRef}
        sections={sectionsData}
        keyExtractor={(item, index) => item.id ?? index.toString()}
        renderItem={({item, section}) => section.renderItem({item})}
        onScrollBeginDrag={() => filterHeaderRef.current?.closeDropdown(false)}
        onMomentumScrollBegin={() =>
          filterHeaderRef.current?.closeDropdown(false)
        }
        onScroll={Animated.event(
          [{nativeEvent: {contentOffset: {y: scrollY}}}],
          {
            useNativeDriver: Platform.OS === 'android',
          },
        )}
        renderSectionHeader={({section}) => {
          if (section.key === 'popularStoresCombined') {
            return (
              <Animated.View
                pointerEvents={isFilterSticky ? 'none' : 'auto'}
                onLayout={event => {
                  const {height, y} = event.nativeEvent.layout;
                  setFilterHeight(prev =>
                    Math.abs(prev - height) > 1 ? height : prev,
                  );
                  setFilterHeaderOffset(prev => {
                    if (y <= 0) return prev;
                    if (prev === null || Math.abs(prev - y) > 1) {
                      return y;
                    }
                    return prev;
                  });
                }}
                style={{
                  opacity: listFilterOpacity,
                  paddingTop: 10,
                  backgroundColor: '#fff',
                }}>
                <FilterHeader
                  ref={filterHeaderRef}
                  navigation={stableNavigation}
                  drinkType={drinkType}
                  setDrinkType={setDrinkType}
                  screenWidth={screenWidth}
                  priceOrder={priceOrder}
                  setPriceOrder={setPriceOrder}
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
              ? {progressViewOffset: insets.top + 110}
              : {})}
          />
        }
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.7}
        contentContainerStyle={{
          paddingTop: contentTopPadding,
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
    </>
  );
};

const styles = StyleSheet.create({
  absoluteTop: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: screenHeight,
    paddingHorizontal: 14,
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
    backgroundColor: '#fff',
    zIndex: 40,
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
});

export default MainScreenLayout;
