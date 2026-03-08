import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
  Dimensions,
  PixelRatio,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import LinearGradient from 'react-native-linear-gradient';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import Carousel from 'react-native-reanimated-carousel';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';
import RecommItemSkeleton from './RecommItemSkeleton';
import {drinkTabs, mockDataByDrinkType} from './mockRecommData';
import CustomText from '../../../utils/CustomText';

const formatPrice = value => Number(value || 0).toLocaleString('ko-KR');
const isValidDrinkTab = value => drinkTabs.some(tab => tab.value === value);
const fontScale = PixelRatio.getFontScale();
const {width: screenWidth} = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.75;
const CARD_HEIGHT = 200;
const PARALLAX_OFFSET = Math.max(24, screenWidth - CARD_WIDTH - 6);
const TAB_CONTENT_HORIZONTAL_PADDING = 20;

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

const TodayRecommCard = React.memo(({item}) => (
  <Pressable
    style={styles.card}
    hitSlop={{top: 4, bottom: 4, left: 4, right: 4}}>
    <View style={styles.cardImageWrap}>
      <FastImage
        source={{
          uri: item.image,
          priority: FastImage.priority.normal,
        }}
        style={styles.cardImage}
        resizeMode={FastImage.resizeMode.cover}>
        {item?.isCertified && (
          <FastImage
            source={require('../../../assets/verifyMaker.png')}
            style={[
              styles.imageStyle,
              fontScale >= 1.5 && {width: 21, height: 21},
            ]}
          />
        )}
        <View style={styles.semiOverlay}>
          <LinearGradient
            colors={
              item.image
                ? ['rgba(0, 0, 0, 0.5)', 'transparent']
                : ['rgba(0, 0, 0, 0.3)', 'transparent']
            }
            style={styles.gradientTop}
            pointerEvents="none"
          />
          <CustomText
            style={styles.storeName}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.storeName}
          </CustomText>
          <CustomText
            style={styles.menuPrice}
            numberOfLines={1}
            ellipsizeMode="tail">
            {item.drink} {formatPrice(item.price)}원
          </CustomText>
          <LinearGradient
            colors={['transparent', 'rgba(0, 0, 0, 0.45)']}
            style={styles.gradientBottom}
            pointerEvents="none"
          />
          <View style={styles.bottomInfoRow}>
            <CustomText style={styles.bottomInfoText} numberOfLines={1}>
              {item.category}
            </CustomText>
            <View style={styles.ratingWrap}>
              <FontAwesomeIcon name="star" size={16} color="#FED348" />
              <CustomText style={styles.ratingText} numberOfLines={1}>
                {(Number(item.rating) || 4.7).toFixed(1)}
              </CustomText>
            </View>
          </View>
        </View>
      </FastImage>
    </View>
  </Pressable>
));

const CarouselCardItem = React.memo(({item, animationValue}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      animationValue.value,
      [-1, 0, 1],
      [0.6, 1, 0.6],
      Extrapolation.CLAMP,
    );

    return {opacity};
  });

  return (
    <Animated.View style={[styles.carouselItem, animatedStyle]}>
      <TodayRecommCard item={item} />
    </Animated.View>
  );
});

const RecommItem = ({
  recommStores,
  location,
  navigation,
  loading,
  refresh,
  initialTab,
  onPressViewAll,
}) => {
  const [selectedTab, setSelectedTab] = useState(() =>
    isValidDrinkTab(initialTab) ? initialTab : drinkTabs[0].value,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const tabScrollRef = useRef(null);
  const tabPositionMapRef = useRef({});

  const selectedTabCards = useMemo(
    () => mockDataByDrinkType[selectedTab] || [],
    [selectedTab],
  );

  const fallbackStores = useMemo(
    () => selectedTabCards.map(mapMockStoreToStoreItem),
    [selectedTabCards],
  );

  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedTab]);

  const scrollSelectedTabToLeft = useCallback((tabValue, animated = true) => {
    const measuredX = tabPositionMapRef.current?.[tabValue];
    if (typeof measuredX !== 'number') {
      return;
    }
    const targetX = Math.max(0, measuredX - TAB_CONTENT_HORIZONTAL_PADDING);
    tabScrollRef.current?.scrollTo({x: targetX, y: 0, animated});
  }, []);

  useEffect(() => {
    if (isValidDrinkTab(initialTab)) {
      setSelectedTab(prev => (prev === initialTab ? prev : initialTab));
    }
  }, [initialTab]);

  useEffect(() => {
    const frameId = requestAnimationFrame(() => {
      scrollSelectedTabToLeft(selectedTab, true);
    });
    return () => cancelAnimationFrame(frameId);
  }, [scrollSelectedTabToLeft, selectedTab]);

  const handleCarouselProgress = useCallback(
    (_offsetProgress, absoluteProgress) => {
      if (!Number.isFinite(absoluteProgress)) {
        return;
      }
      const maxIndex = Math.max(selectedTabCards.length - 1, 0);
      const nextIndex = Math.min(
        maxIndex,
        Math.max(0, Math.round(absoluteProgress)),
      );
      setCurrentIndex(prev => (prev === nextIndex ? prev : nextIndex));
    },
    [selectedTabCards.length],
  );

  const handlePressViewAll = useCallback(() => {
    const stores =
      Array.isArray(recommStores) && recommStores.length > 0
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
    selectedTab,
  ]);

  if (loading || refresh) {
    return <RecommItemSkeleton />;
  }

  return (
    <View style={styles.sectionContainer}>
      <View style={styles.titleRow}>
        <CustomText style={styles.sectionTitle}>가성비 술집</CustomText>
        <Pressable
          style={{flexDirection: 'row', alignItems: 'center'}}
          onPress={handlePressViewAll}
          hitSlop={8}>
          <CustomText style={styles.moreButtonText}>전체보기</CustomText>
          <Feather name={'chevron-right'} size={15} color="#333" />
        </Pressable>
      </View>

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

      {selectedTabCards.length > 0 && (
        <View style={styles.carouselWrap}>
          <Carousel
            loop={true}
            width={screenWidth}
            height={CARD_HEIGHT}
            data={selectedTabCards}
            onProgressChange={handleCarouselProgress}
            mode="parallax"
            modeConfig={{
              parallaxScrollingScale: 1,
              parallaxScrollingOffset: PARALLAX_OFFSET,
              parallaxAdjacentItemScale: 0.9,
            }}
            renderItem={({item, animationValue}) => (
              <CarouselCardItem item={item} animationValue={animationValue} />
            )}
          />

          <View style={styles.pagination}>
            {selectedTabCards.map((card, index) => (
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
    paddingTop: 12,
    paddingBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
  moreButtonText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'Pretendard-Regular',
  },
  tabTrack: {
    borderBottomWidth: 1,
    borderBottomColor: '#E6E6E6',
    marginBottom: 14,
  },
  tabContentContainer: {
    paddingLeft: 20,
    paddingRight: 2,
  },
  tabItem: {
    height: 40,
    paddingHorizontal: 6,
    marginRight: 18,
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
  carouselWrap: {
    marginTop: 2,
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
    borderRadius: 12,
  },
  cardImage: {
    width: '100%',
    height: CARD_HEIGHT,
    borderRadius: 12,
    backgroundColor: '#ECECEC',
  },
  imageStyle: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 18,
    height: 18,
    zIndex: 5,
  },
  semiOverlay: {
    alignItems: 'flex-start',
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
  },
  gradientTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 1,
  },
  gradientBottom: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 66,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    zIndex: 1,
  },
  storeName: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#fff',
    marginTop: 8,
    marginLeft: 12,
    marginRight: 22,
    textAlign: 'center',
    zIndex: 3,
  },
  menuPrice: {
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
    marginLeft: 15,
    marginRight: 22,
    textAlign: 'center',
    zIndex: 3,
    marginTop: -1,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  bottomInfoRow: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 3,
  },
  bottomInfoText: {
    fontSize: 13,
    color: '#fff',
    fontFamily: 'Pretendard-Medium',
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 13,
    color: '#fff',
    fontFamily: 'Pretendard-SemiBold',
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 3,
  },
  pagination: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#CCC',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#111',
  },
});

export default RecommItem;
