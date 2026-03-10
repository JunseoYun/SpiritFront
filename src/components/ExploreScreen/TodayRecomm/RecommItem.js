import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';

import Carousel from 'react-native-reanimated-carousel';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import RecommItemSkeleton from './RecommItemSkeleton';
import {drinkTabs, mockDataByDrinkType} from './mockRecommData';
import CustomText from '../../../utils/CustomText';
import {Store_getby_drinkPrice} from '../../../api/storeApi';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import ColorUtil from '../../../utils/ColorUtil';

const formatPrice = value => {
  if (value == null) return '';
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value.toLocaleString('ko-KR');
  }
  const numeric = String(value).replace(/[^\d]/g, '');
  if (!numeric) return '';
  return Number(numeric).toLocaleString('ko-KR');
};
const isValidDrinkTab = value => drinkTabs.some(tab => tab.value === value);
const {width: screenWidth} = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = 210;
const PARALLAX_OFFSET = 0;
const DEFAULT_PAGE_SIZE = 10;

const mapMockStoreToStoreItem = item => ({
  id: item.id,
  name: item.storeName,
  mainImgUrl: item.image,
  categories: [item.category],
  mainDrinkDtos: [
    {type: item.drinkType, price: `${formatPrice(item.price)}원`},
  ],
  storeRate: Number(Math.min(5, item.reviewCount / 40).toFixed(1)),
  isCertified: !!item.isCertified,
  operationInfoDtos: [],
});

const TodayRecommCard = React.memo(({item, currentIndex, totalCount}) => {
  const formattedPrice = formatPrice(item?.price);

  return (
    <Pressable
      style={styles.card}
      hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}>
      {({pressed}) => (
        <View style={styles.cardImageWrap}>
          <FastImage
            source={
              item?.image
                ? {
                    uri: item.image,
                    priority: FastImage.priority.normal,
                  }
                : require('../../../assets/default_store6.png')
            }
            style={[styles.cardImage, pressed && styles.cardImagePressed]}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.cardOverlay} pointerEvents="none">
            <View style={styles.semiOverlay}>
              <LinearGradient
                colors={['transparent', 'rgba(0, 0, 0, 0.55)']}
                style={styles.gradientBottom}
                pointerEvents="none"
              />
              <View style={styles.bottomInfoRow}>
                <View style={styles.storeNameRow}>
                  {item?.isCertified && (
                    <FastImage
                      source={require('../../../assets/verifyMaker.png')}
                      style={styles.verifyIcon}
                      resizeMode={FastImage.resizeMode.contain}
                    />
                  )}
                  <CustomText
                    style={styles.storeName}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {item.storeName}
                  </CustomText>
                </View>
                <CustomText style={styles.priceValue} numberOfLines={1}>
                  {formattedPrice ? `${formattedPrice}원` : ''}
                </CustomText>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
});

const CarouselCardItem = React.memo(
  ({item, animationValue, currentIndex, totalCount}) => {
    const animatedStyle = useAnimatedStyle(() => {
      const opacity = interpolate(
        animationValue.value,
        [-1, 0, 1],
        [0.85, 1, 0.85],
        Extrapolation.CLAMP,
      );

      return {opacity};
    });

    return (
      <Animated.View style={[styles.carouselItem, animatedStyle]}>
        <TodayRecommCard
          item={item}
          currentIndex={currentIndex}
          totalCount={totalCount}
        />
      </Animated.View>
    );
  },
);

const RecommItem = ({
  recommStores,
  location,
  navigation,
  loading,
  refresh,
  initialTab,
  onPressViewAll,
}) => {
  const {translateAlcohol} = useTranslateAlcohol();
  const [selectedTab, setSelectedTab] = useState(() =>
    isValidDrinkTab(initialTab) ? initialTab : drinkTabs[0].value,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDrinkTabsVisible, setIsDrinkTabsVisible] = useState(false);
  const [tabStoreMap, setTabStoreMap] = useState({});
  const [tabLoading, setTabLoading] = useState(false);

  const selectedTabCards = useMemo(
    () => mockDataByDrinkType[selectedTab] || [],
    [selectedTab],
  );

  const selectedTabLabel = useMemo(
    () =>
      drinkTabs.find(tab => tab.value === selectedTab)?.label ||
      drinkTabs[0].label,
    [selectedTab],
  );

  const fallbackStores = useMemo(
    () => selectedTabCards.map(mapMockStoreToStoreItem),
    [selectedTabCards],
  );

  const selectedTabStores = useMemo(
    () => tabStoreMap?.[selectedTab] || [],
    [selectedTab, tabStoreMap],
  );

  const recommCardItems = useMemo(() => {
    if (!Array.isArray(selectedTabStores) || selectedTabStores.length === 0) {
      return selectedTabCards;
    }

    return selectedTabStores.map(store => {
      const drinkDtos = Array.isArray(store?.mainDrinkDtos)
        ? store.mainDrinkDtos
        : [];
      const matchedDrink = drinkDtos.find(drink => drink?.type === selectedTab);

      return {
        id: store?.id ?? `${selectedTab}-${store?.name ?? 'store'}`,
        image: store?.mainImgUrl,
        storeName: store?.name || store?.storeName || '이름 없는 매장',
        drink: translateAlcohol(selectedTab),
        price: matchedDrink?.price ?? '',
        isCertified: !!store?.isCertified,
      };
    });
  }, [selectedTab, selectedTabCards, selectedTabStores, translateAlcohol]);

  const resolveStorePage = useCallback(data => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.stores)) return data.stores;
    if (Array.isArray(data?.storeList)) return data.storeList;
    if (typeof data === 'object' && data?.id && data?.name) return [data];
    return [];
  }, []);

  const fetchDrinkPricePage = useCallback(
    async (drinkType, options = {}) => {
      if (!location?.latitude || !location?.longitude) return;
      setTabLoading(true);
      try {
        const data = await Store_getby_drinkPrice(
          location.latitude,
          location.longitude,
          drinkType,
          options.page ?? 0,
          options.size ?? DEFAULT_PAGE_SIZE,
          options.sort,
        );
        const stores = resolveStorePage(data);
        console.log(data);
        setTabStoreMap(prev => ({
          ...prev,
          [drinkType]: stores,
        }));
      } catch (error) {
      } finally {
        setTabLoading(false);
      }
    },
    [location?.latitude, location?.longitude, resolveStorePage],
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedTab]);

  useEffect(() => {
    if (isValidDrinkTab(initialTab)) {
      setSelectedTab(prev => (prev === initialTab ? prev : initialTab));
    }
  }, [initialTab]);

  useEffect(() => {
    setTabStoreMap({});
  }, [location?.latitude, location?.longitude]);

  useEffect(() => {
    if (!isValidDrinkTab(selectedTab)) return;
    if (tabStoreMap?.[selectedTab]) return;
    fetchDrinkPricePage(selectedTab);
  }, [fetchDrinkPricePage, selectedTab, tabStoreMap]);

  useEffect(() => {
    if (!refresh || !isValidDrinkTab(selectedTab)) return;
    fetchDrinkPricePage(selectedTab);
  }, [fetchDrinkPricePage, refresh, selectedTab]);

  const handleCarouselProgress = useCallback(
    (_offsetProgress, absoluteProgress) => {
      if (!Number.isFinite(absoluteProgress)) {
        return;
      }
      const maxIndex = Math.max(recommCardItems.length - 1, 0);
      const nextIndex = Math.min(
        maxIndex,
        Math.max(0, Math.round(absoluteProgress)),
      );
      setCurrentIndex(prev => (prev === nextIndex ? prev : nextIndex));
    },
    [recommCardItems.length],
  );

  const handlePressViewAll = useCallback(() => {
    const stores =
      Array.isArray(selectedTabStores) && selectedTabStores.length > 0
        ? selectedTabStores
        : Array.isArray(recommStores) && recommStores.length > 0
        ? recommStores
        : fallbackStores;

    const payload = {
      stores,
      initialTab: selectedTab,
    };

    if (typeof onPressViewAll === 'function') {
      onPressViewAll(payload);
      return;
    }

    navigation?.navigate('RecommStoreScreen', {
      ...payload,
      location,
    });
  }, [
    fallbackStores,
    location,
    navigation,
    onPressViewAll,
    recommStores,
    selectedTabStores,
    selectedTab,
  ]);

  if (loading || refresh || tabLoading) {
    return <RecommItemSkeleton />;
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.titleRow}>
        <View style={styles.sectionTitleGroup}>
          <Pressable
            hitSlop={8}
            onPress={() => setIsDrinkTabsVisible(prev => !prev)}
            style={styles.titleDrinkPill}>
            <CustomText style={styles.titleDrinkText}>
              {selectedTabLabel}
            </CustomText>
            <Entypo
              name="triangle-down"
              size={12}
              color="#3CBBFF"
              style={[
                styles.titleDrinkArrow,
                isDrinkTabsVisible && styles.titleDrinkArrowOpen,
              ]}
            />
          </Pressable>
          <CustomText style={styles.sectionTitle}>최저가 매장</CustomText>
        </View>
        <Pressable
          onPress={handlePressViewAll}
          hitSlop={8}
          style={styles.viewAllButton}>
          <CustomText style={styles.viewAllText}>전체보기</CustomText>
          <Feather name={'chevron-right'} size={13} color="#B9B9B9" />
        </Pressable>
      </View>

      {isDrinkTabsVisible && (
        <View style={styles.titleTabsRow}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.titleTabsContent}>
            {drinkTabs.map(tab => {
              const isActive = tab.value === selectedTab;
              return (
                <Pressable
                  key={tab.value}
                  onPress={() => {
                    setSelectedTab(tab.value);
                    setIsDrinkTabsVisible(false);
                  }}
                  hitSlop={8}
                  style={[
                    styles.titleTabItem,
                    isActive && styles.titleTabItemActive,
                  ]}>
                  <CustomText
                    style={[
                      styles.titleTabText,
                      isActive && styles.titleTabTextActive,
                    ]}>
                    {tab.label}
                  </CustomText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {recommCardItems.length > 0 && (
        <View style={styles.carouselWrap}>
          <Carousel
            loop={true}
            width={screenWidth}
            height={CARD_HEIGHT}
            data={recommCardItems}
            onProgressChange={handleCarouselProgress}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 1,
              parallaxScrollingOffset: PARALLAX_OFFSET,
              parallaxAdjacentItemScale: 1,
            }}
            renderItem={({item, animationValue}) => (
              <CarouselCardItem
                item={item}
                animationValue={animationValue}
                currentIndex={currentIndex}
                totalCount={recommCardItems.length}
              />
            )}
          />
          <View style={styles.bottomDots}>
            {recommCardItems.map((card, index) => (
              <View
                key={`${card.id}-dot`}
                style={[styles.dot, index === currentIndex && styles.dotActive]}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 4,
    justifyContent: 'space-between',
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 1,
  },
  titleDrinkPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleDrinkArrow: {
    marginRight: 4,
    transform: [{rotate: '0deg'}],
  },
  titleDrinkArrowOpen: {
    transform: [{rotate: '180deg'}],
  },
  titleDrinkText: {
    fontSize: 20,
    color: '#3CBBFF',
    fontFamily: 'Pretendard-SemiBold',
    letterSpacing: -0.4,
    marginRight: 4,
  },

  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#B9B9B9',
  },
  titleTabsRow: {
    marginTop: 10,
    marginBottom: 14,
  },
  titleTabsContent: {
    alignItems: 'center',

    gap: 8,
    paddingHorizontal: 20,
  },
  titleTabItem: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    backgroundColor: '#F2F3F5',
    borderRadius: 999,
  },
  titleTabItemActive: {
    backgroundColor: ColorUtil.mainChip,
    borderWidth: 1.0,
    borderColor: ColorUtil.main,
  },
  titleTabText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Pretendard-Medium',
  },
  titleTabTextActive: {
    color: '#3CBBFF',
  },
  sectionTitle: {
    fontSize: 20,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
    letterSpacing: -0.4,
    marginLeft: 2,
  },
  carouselWrap: {
    marginTop: 8,
  },
  bottomDots: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#DADADA',
    marginHorizontal: 3,
  },
  dotActive: {
    width: 16,
    height: 5,
    backgroundColor: '#3CBBFF',
  },
  carouselItem: {
    width: screenWidth,
    height: CARD_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: CARD_WIDTH,
  },
  cardImageWrap: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 16,
    backgroundColor: '#ECECEC',
    borderWidth: 0.5,
    borderColor: '#EEE',
  },
  cardImagePressed: {
    transform: [{scale: 1.04}],
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
  },

  semiOverlay: {
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    padding: 12,
  },
  gradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    //이새끼도
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    zIndex: 1,
  },

  storeName: {
    fontSize: 17,
    fontFamily: 'Pretendard-Bold',
    color: '#fff',
    zIndex: 3,
    flex: 1,
    minWidth: 0,
  },
  storeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
  },
  verifyIcon: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  bottomInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    zIndex: 3,
    gap: 8,
    paddingHorizontal: 3,
    //이새끼
  },

  priceValue: {
    fontSize: 17,
    fontFamily: 'Pretendard-ExtraBold',
    color: '#FFFFFF',
  },
});

export default RecommItem;
