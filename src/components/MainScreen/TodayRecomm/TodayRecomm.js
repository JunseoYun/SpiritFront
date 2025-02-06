import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  Image,
} from 'react-native';
import useWeatherTranslation from '../../../hooks/useWeatherTranslation';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import TodayRecommItem from './TodayRecommItem';

const {width} = Dimensions.get('window');
const ITEM_WIDTH = width * 0.9;
const SPACING = 10;

const TodayRecomm = ({
  weather,
  recommCategory,
  recommReason,
  recommStores,
  location,
  navigation,
}) => {
  const {translateWeather} = useWeatherTranslation();
  const {translateCategory} = useCategoryTranslation();
  const koreanCategory = translateCategory(recommCategory);
  const [currentIndex, setCurrentIndex] = useState(0);
  const listRef = useRef(null);

  const extendedStores =
    Array.isArray(recommStores) && recommStores.length >= 3
      ? [...recommStores, ...recommStores, ...recommStores]
      : recommStores;

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
      {recommStores && (
        <FlatList
          ref={listRef}
          data={extendedStores}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            recommStores.length < 2
              ? [styles.scrollContainer, styles.smallListContainer]
              : styles.scrollContainer
          }
          snapToAlignment="center"
          snapToInterval={ITEM_WIDTH + SPACING}
          decelerationRate={0.8}
          initialScrollIndex={recommStores.length} // 처음 시작 시 중앙으로 이동
          onScroll={handleScroll} // 실시간으로 점 업데이트
          onMomentumScrollEnd={
            recommStores.length >= 3 ? handleScrollEnd : undefined
          } // 가게 3개 이상일 때만 무한 스크롤 적용
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
      )}
      {/* 페이지네이션 점 표시 */}
      {/* {recommStores && (
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
      )} */}
      {recommStores.length === 0 && (
        <View style={styles.noDataView}>
          <Image
            source={require('../../../assets/AppLogoNoback.png')}
            style={styles.imageStyle}
          />
          <Text style={styles.noDataText}>
            추천 카테고리에 등록된 주점이 없어요
          </Text>
        </View>
      )}
      {weather.condition ? (
        <View style={styles.topdayweather}>
          <View style={styles.weatherTemp}>
            <Image
              source={{uri: `https:${weather.icon}`}}
              style={styles.weatherIcon}
            />
            <Text style={styles.todayweathertext}>{weather.temp}°C</Text>
          </View>

          <Text style={styles.todayweathertext}>
            날씨: {translateWeather(weather.condition)}
          </Text>
          <Text style={styles.todayweathertext}>
            강수량: {weather.rain_probability}mm
          </Text>
        </View>
      ) : (
        <Text style={styles.notWeathertext}>날씨 정보 가져오는 중...</Text>
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
  smallListContainer: {marginLeft: 15},
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
    marginBottom: -5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 4,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#999',
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
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
  },
  imageStyle: {
    width: '100%',
    height: 70, // 추가
    borderRadius: 10,
    resizeMode: 'contain',
    justifyContent: 'center',
  },
  topdayweather: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '88%',
    alignSelf: 'center',
  },
  weatherTemp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 35,
    height: 35,
    marginTop: -5,
  },
  todayweathertext: {
    fontSize: 14,
    color: '#333',
    marginBottom: 7,
    fontWeight: '600',
  },
  notWeathertext: {
    alignSelf: 'center',
    fontSize: 14,
    color: '#333',
    marginBottom: 7,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
  },
});

export default TodayRecomm;
