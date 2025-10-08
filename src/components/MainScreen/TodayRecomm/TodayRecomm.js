// TodayRecomm.js
import React, {useState, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  PixelRatio,
  Platform,
} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import TodayRecommItem from './TodayRecommItem';
import FastImage from 'react-native-fast-image';
import TodayRecommItemSkeleton from './TodayRecommItemSkeleton';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const SPACING = width * 0.03;

const fontScale = PixelRatio.getFontScale();

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

  // FlatList 스크롤 인덱스 계산
  const handleScroll = ({nativeEvent}) => {
    const contentOffsetX = nativeEvent.contentOffset.x;
    const totalItems = recommStores.length;
    const index =
      Math.round(contentOffsetX / (ITEM_WIDTH + SPACING)) % totalItems;
    setCurrentIndex(index);
  };

  // 무한 루프 스크롤용
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

  if (loading || refresh) {
    return <TodayRecommItemSkeleton />;
  }

  return (
    <>
      <View style={styles.todayPhrasesView}>
        <Text
          allowFontScaling={false}
          style={[styles.todayReason, fontScale >= 1.5 && {fontSize: 20}]}>
          {recommReason}
        </Text>
      </View>

      {recommStores && ( // ready가 true일 때만 FlatList 렌더링
        <FlatList
          ref={listRef}
          key={recommStores.length}
          data={extendedStores}
          onContentSizeChange={() => {
            if (recommStores.length >= 3) {
              listRef.current.scrollToOffset({
                offset: (ITEM_WIDTH + SPACING) * recommStores.length - SPACING, // 원하는 offset
                animated: false,
              });
            }
          }}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          emoveClippedSubviews={Platform.OS === 'android'}
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
            <View style={[styles.slideItem]}>
              <TodayRecommItem
                store={item}
                category={koreanCategory}
                location={location}
                navigation={navigation}
              />
            </View>
          )}
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
  );
};

const styles = StyleSheet.create({
  todayPhrasesView: {marginLeft: 20, alignContent: 'center'},
  todayReason: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#888',
    paddingLeft: 4,
  },
  slideItem: {width: ITEM_WIDTH, marginHorizontal: SPACING / 2},
  scrollContainer: {alignItems: 'center'},
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
  activeDot: {backgroundColor: '#fff', width: 6, height: 6},
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
