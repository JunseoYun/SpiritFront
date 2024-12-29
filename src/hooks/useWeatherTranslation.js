import {useCallback} from 'react';

// 날씨 상태를 한글로 매핑하는 객체
const weatherTextTranslation = {
  Sunny: '화창함',
  Clear: '맑음',
  'Partly cloudy': '구름 조금',
  Cloudy: '구름 많음',
  Overcast: '흐림',
  Mist: '엷은 안개',
  'Patchy rain possible': '가끔 비',
  'Patchy snow possible': '가끔 눈',
  'Patchy sleet possible': '가끔 진눈깨비',
  'Patchy freezing drizzle possible': '가끔 얼어붙는 이슬비',
  'Thundery outbreaks possible': '천둥 예상',
  'Blowing snow': '날리는 눈발',
  Blizzard: '심한 눈보라',
  Fog: '짙은 안개',
  'Freezing fog': '얼어붙는 안개',
  'Patchy light drizzle': '가벼운 이슬비',
  'Light drizzle': '약한 이슬비',
  'Freezing drizzle': '얼어붙는 이슬비',
  'Heavy freezing drizzle': '강한 얼어붙는 이슬비',
  'Patchy light rain': '가끔 가벼운 비',
  'Light rain': '약한 비',
  'Moderate rain at times': '때때로 중간 정도 비',
  'Moderate rain': '보통 비',
  'Heavy rain at times': '때때로 강한 비',
  'Heavy rain': '강한 비',
  'Light freezing rain': '약한 얼어붙는 비',
  'Moderate or heavy freezing rain': '강한 얼어붙는 비',
  'Light sleet': '약한 진눈깨비',
  'Moderate or heavy sleet': '강한 진눈깨비',
  'Patchy light snow': '가끔 가벼운 눈',
  'Light snow': '약한 눈',
  'Patchy moderate snow': '가끔 보통 눈',
  'Moderate snow': '보통 눈',
  'Patchy heavy snow': '가끔 강한 눈',
  'Heavy snow': '강한 눈',
  'Ice pellets': '얼음 우박',
  'Light rain shower': '가벼운 비 소나기',
  'Moderate or heavy rain shower': '강한 비 소나기',
  'Torrential rain shower': '폭우',
  'Light sleet showers': '약한 진눈깨비 소나기',
  'Moderate or heavy sleet showers': '강한 진눈깨비 소나기',
  'Light snow showers': '가벼운 눈 소나기',
  'Moderate or heavy snow showers': '강한 눈 소나기',
  'Light showers of ice pellets': '가벼운 얼음 우박 소나기',
  'Moderate or heavy showers of ice pellets': '강한 얼음 우박 소나기',
  'Patchy light rain with thunder': '가끔 가벼운 비와 천둥',
  'Moderate or heavy rain with thunder': '강한 비와 천둥',
  'Patchy light snow with thunder': '가끔 가벼운 눈과 천둥',
  'Moderate or heavy snow with thunder': '강한 눈과 천둥',
};

// 날씨 상태를 한글로 변환하는 커스텀 Hook
const useWeatherTranslation = () => {
  const translateWeather = useCallback(text => {
    return weatherTextTranslation[text] || '알 수 없는 날씨 상태';
  }, []);

  return {translateWeather};
};

export default useWeatherTranslation;
