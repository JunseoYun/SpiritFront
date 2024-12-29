import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import useWeatherTranslation from '../../../hooks/useWeatherTranslation';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation ';
import TodayRecommItem from './TodayRecommItem';

const {width} = Dimensions.get('window'); // 화면 너비 가져오기

const TodayRecomm = ({
  address,
  weather,
  recommStores,
  recommCategory,
  recommReason,
}) => {
  const {translateWeather} = useWeatherTranslation();
  const {translateCategory} = useCategoryTranslation();

  const koreanCategory = translateCategory(recommCategory);

  return (
    <>
      {/* 실시간 위치 */}
      <View style={styles.todayPhrasesView}>
        <Text style={styles.todayPhrases}>오늘은 {address} </Text>
        <Text style={styles.todayReason}>{recommReason} </Text>
      </View>

      <View>
        {recommStores && recommStores.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContainer}>
            {recommStores.map(store => (
              <View key={store.storeId} style={styles.slideItem}>
                <TodayRecommItem store={store} category={koreanCategory} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noDataText}>
            추천 데이터가 없습니다.{recommCategory}
          </Text>
        )}
      </View>

      {/* 날씨 정보 */}
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
    marginLeft: 25,
    alignContent: 'center',
  },
  todayPhrases: {
    fontSize: 15,
    fontWeight: 'bold',
    color: 'black',
  },
  todayReason: {
    fontSize: 13,
    fontWeight: 'bold',
    color: 'gray',
    marginTop: 3,
  },
  scrollContainer: {
    paddingHorizontal: 15, // 좌우 여백 추가
  },
  slideItem: {
    width: width * 0.9, // 각 슬라이드의 너비를 화면 너비의 75%로 설정
    marginRight: 10, // 각 항목 사이의 간격
  },
  noDataText: {
    alignSelf: 'center',
    fontSize: 12,
    color: 'gray',
    marginTop: 10,
  },
  topdayweather: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 25,
  },
  weatherTemp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  weatherIcon: {
    width: 30,
    height: 30,
    marginTop: -5,
  },
  todayweathertext: {
    fontSize: 12,
    color: 'black',
    marginBottom: 7,
    fontWeight: '400',
  },
  notWeathertext: {
    alignSelf: 'center',
    fontSize: 12,
    color: 'black',
    marginBottom: 7,
  },
});

export default TodayRecomm;
