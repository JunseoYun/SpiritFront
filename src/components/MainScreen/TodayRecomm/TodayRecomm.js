import React, {useState, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, FlatList, Dimensions} from 'react-native';
import useWeatherTranslation from '../../../hooks/useWeatherTranslation';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import TodayRecommItem from './TodayRecommItem';
import {Store_getby_category} from '../../../api/storeApi';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const SPACING = 10;

const TodayRecomm = ({
  weather,
  recommCategory,
  recommReason,
  location,
  refresh,
  navigation,
}) => {
  const {translateWeather} = useWeatherTranslation();
  const {translateCategory} = useCategoryTranslation();
  const koreanCategory = translateCategory(recommCategory);
  const [recommStores, setRecommStores] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef(null);

  const fetchStores = async () => {
    if (location) {
      try {
        const storesData = await Store_getby_category(
          0,
          location.latitude,
          location.longitude,
          'IZAKAYA',
        );
        console.log(storesData);
        setRecommStores(storesData.content);
      } catch (error) {}
    }
  };

  useEffect(() => {
    if (location) {
      fetchStores();
    }
  }, [location]);

  useEffect(() => {
    if (refresh && location) {
      fetchStores();
    }
  }, [refresh]);

  // 무한 스크롤을 위한 확장된 배열
  const extendedStores = [...recommStores, ...recommStores, ...recommStores];

  // 스크롤 위치를 즉시 업데이트하여 점이 따라오도록 개선
  const handleScroll = ({nativeEvent}) => {
    const contentOffsetX = nativeEvent.contentOffset.x;
    const totalItems = recommStores.length;
    const index =
      Math.round(contentOffsetX / (ITEM_WIDTH + SPACING)) % totalItems;
    setCurrentIndex(index);
  };

  // 스크롤이 멈출 때 위치 자동 보정 (양방향 무한 스크롤)
  const handleScrollEnd = ({nativeEvent}) => {
    const contentOffsetX = nativeEvent.contentOffset.x;
    const totalItems = recommStores.length;
    const index = Math.round(contentOffsetX / (ITEM_WIDTH + SPACING));

    if (index === 0) {
      // 왼쪽 끝에서 왼쪽으로 스크롤하면 마지막 아이템으로 이동
      listRef.current.scrollToOffset({
        offset: (ITEM_WIDTH + SPACING) * totalItems,
        animated: false,
      });
      setCurrentIndex(totalItems - 1);
    } else if (index >= totalItems * 2) {
      // 오른쪽 끝에서 오른쪽으로 스크롤하면 첫 번째 아이템으로 이동
      listRef.current.scrollToOffset({
        offset: (ITEM_WIDTH + SPACING) * totalItems,
        animated: false,
      });
      setCurrentIndex(0);
    }
  };

  return (
    <>
      <View style={styles.todayPhrasesView}>
        <Text style={styles.todayReason}>{recommReason}</Text>
      </View>

      <FlatList
        ref={listRef}
        data={extendedStores}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        snapToAlignment="center"
        snapToInterval={ITEM_WIDTH + SPACING}
        decelerationRate={0.8}
        initialScrollIndex={recommStores.length} // 처음 시작 시 중앙으로 이동
        onScroll={handleScroll} // 실시간으로 점 업데이트
        onMomentumScrollEnd={handleScrollEnd} // 무한 스크롤 동작 유지
        getItemLayout={(data, index) => ({
          length: ITEM_WIDTH + SPACING,
          offset: (ITEM_WIDTH + SPACING) * index,
          index,
        })}
        renderItem={({item, index}) => (
          <View key={index} style={styles.slideItem}>
            <TodayRecommItem
              store={item}
              category={koreanCategory}
              location={location}
              navigation={navigation}
            />
          </View>
        )}
      />

      {/* 페이지네이션 점 표시 */}
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
    </>
  );
};

const styles = StyleSheet.create({
  todayPhrasesView: {
    marginLeft: 20,
    alignContent: 'center',
  },
  todayReason: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
    marginTop: 5,
  },
  slideItem: {
    width: ITEM_WIDTH,
    marginHorizontal: SPACING / 2,
  },
  scrollContainer: {
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#999',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#fff',
    width: 6,
    height: 6,
  },
});

export default TodayRecomm;
