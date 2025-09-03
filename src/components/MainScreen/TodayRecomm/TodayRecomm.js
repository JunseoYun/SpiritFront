import React, {useState, useRef, useEffect} from 'react';
import {View, Text, StyleSheet, FlatList, Dimensions} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import TodayRecommItem from './TodayRecommItem';
import FastImage from 'react-native-fast-image';
import TodayRecommItemSkeleton from './TodayRecommItemSkeleton';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const SPACING = width * 0.03;

const TodayRecomm = ({
  recommCategory,
  recommReason,
  recommStores,
  location,
  navigation,
  loading,
  refresh,
}) => {
  const {translateCategory} = useCategoryTranslation();
  const koreanCategory = translateCategory(recommCategory);
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef(null);

  const extendedStores =
    Array.isArray(recommStores) && recommStores.length >= 3
      ? [...recommStores, ...recommStores, ...recommStores]
      : recommStores;

  const handleScroll = ({nativeEvent}) => {
    const contentOffsetX = nativeEvent.contentOffset.x;
    const totalItems = recommStores.length;
    const index =
      Math.round(contentOffsetX / (ITEM_WIDTH + SPACING)) % totalItems;
    setCurrentIndex(index);
  };

  const handleScrollEnd = ({nativeEvent}) => {
    const contentOffsetX = nativeEvent.contentOffset.x;
    const totalItems = recommStores.length;
    const index = Math.round(contentOffsetX / (ITEM_WIDTH + SPACING));

    if (index === 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: (ITEM_WIDTH + SPACING) * totalItems - SPACING,
          animated: false,
        });
        setCurrentIndex(totalItems - 1);
      });
    } else if (index >= totalItems * 2) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({
          offset: (ITEM_WIDTH + SPACING) * totalItems - SPACING,
          animated: false,
        });
        setCurrentIndex(0);
      });
    }
  };

  return (
    <>
      {loading || refresh ? (
        <TodayRecommItemSkeleton />
      ) : (
        <>
          <View style={styles.todayPhrasesView}>
            <Text style={styles.todayReason}>{recommReason}</Text>
          </View>

          {recommStores && (
            <FlatList
              ref={listRef}
              key={recommStores.length}
              data={extendedStores}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              removeClippedSubviews={false}
              contentContainerStyle={[
                styles.scrollContainer,
                recommStores.length < 3 && styles.centeredListContainer,
              ]}
              snapToAlignment="center"
              snapToInterval={
                recommStores.length === 2
                  ? ITEM_WIDTH + SPACING + SPACING
                  : ITEM_WIDTH + SPACING
              }
              decelerationRate={0.8}
              onScroll={handleScroll}
              onMomentumScrollEnd={
                recommStores.length >= 3 ? handleScrollEnd : undefined
              }
              getItemLayout={(data, index) => ({
                length: ITEM_WIDTH + SPACING,
                offset: (ITEM_WIDTH + SPACING) * index,
                index,
              })}
              renderItem={({item, index}) => (
                <View key={index} style={[styles.slideItem]}>
                  <TodayRecommItem
                    store={item}
                    category={koreanCategory}
                    location={location}
                    navigation={navigation}
                  />
                </View>
              )}
              onLayout={() => {
                // FlatList가 렌더링되어 레이아웃이 잡힌 시점에 실행
                if (recommStores.length >= 3) {
                  requestAnimationFrame(() => {
                    listRef.current?.scrollToOffset({
                      offset:
                        (ITEM_WIDTH + SPACING) * recommStores.length - SPACING,
                      animated: false,
                    });
                    setCurrentIndex(0);
                  });
                }
              }}
            />
          )}

          {recommStores.length > 1 ? (
            <View style={styles.pagination}>
              {recommStores.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    currentIndex === index ? styles.activeDot : null,
                  ]}
                />
              ))}
            </View>
          ) : (
            <View style={styles.pagination} />
          )}

          {recommStores.length === 0 && (
            <View style={styles.noDataView}>
              <FastImage
                source={require('../../../assets/AppLogoNoback.png')}
                style={styles.imageStyle}
                resizeMode={FastImage.resizeMode.contain}
              />
              <Text style={styles.noDataText}>
                추천 카테고리에 등록된 술집이 없어요
              </Text>
            </View>
          )}
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  todayPhrasesView: {
    marginLeft: 20,
    alignContent: 'center',
  },
  todayReason: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#888',
    paddingLeft: 4,
  },
  slideItem: {
    width: ITEM_WIDTH,
    marginHorizontal: SPACING / 2,
  },
  scrollContainer: {
    alignItems: 'center',
  },
  centeredListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 15,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    marginBottom: 20,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 30,
    backgroundColor: '#BDBDBD',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 6,
    height: 6,
  },
  noDataView: {
    width: '90%',
    height: 200,
    backgroundColor: '#E0E0E0',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
  },
  noDataText: {
    alignSelf: 'center',
    fontSize: 15,
    color: '#777',
    marginTop: 10,
    fontFamily: 'Pretendard-Regular',
  },
  imageStyle: {
    width: '100%',
    height: 70,
    borderRadius: 10,
    resizeMode: 'contain',
    justifyContent: 'center',
  },
});

export default TodayRecomm;
