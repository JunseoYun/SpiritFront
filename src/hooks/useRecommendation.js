import {useCallback} from 'react';

// 키워드 기반 번역 객체
const weatherTextTranslation = {
  Sunny: '맑음',
  Clear: '맑음',
  'Partly cloudy': '구름 조금',
  Cloudy: '흐림',
  Overcast: '흐림',
  Mist: '엷은 안개',
  rain: '비',
  snow: '눈',
  thunder: '천둥',
  drizzle: '이슬비',
  freezing: '얼어붙는',
  sleet: '진눈깨비',
  fog: '안개',
  shower: '비',
  pellets: '우박',
};

// 모든 카테고리 리스트 (ROOM과 GROUP 제외)
const allCategories = [
  'IZAKAYA',
  'KOREAN',
  'WESTERN',
  'CHINESE',
  'GAMSEONG',
  'GRILLED_STEW',
  'CHICKEN_HOF',
  'RAW_SEAFOOD',
  'PUB_BAR',
  'POCHA',
];

// 카테고리 추천 이유 매핑
const categoryReasons = {
  IZAKAYA: '분위기 좋은 이자카야 어때요?',
  KOREAN: '따뜻한 한식이 몸과 마음을 녹여줄 거예요',
  WESTERN: '가볍게 양식으로 분위기를 즐겨보세요',
  CHINESE: '매콤하고 든든한 중식으로 하루를 마무리 해요',
  GAMSEONG: '감성주점에서 편안한 시간을 가져보세요',
  GRILLED_STEW: '족발과 함께 맛있는 저녁을 즐겨보세요',
  CHICKEN_HOF: '따뜻한 찌개와 함께 힘든 오늘을 이겨내요',
  RAW_SEAFOOD: '따끈한 구이 요리는 어떨까요?',
  PUB_BAR: '바삭한 치킨과 함께 즐거운 시간을!',
  POCHA: '비 오는 날엔 전과 막걸리가 최고죠!',
  // DRIED: '마른 안주를 먹으며 친구들과 가볍게 얘기를 나눠요',
  // SEAFOOD: '신선한 해산물로 특별한 날을 보내세요',
  // OUTDOOR: '날씨가 좋아 야외에서 즐기기 딱이에요!',
  // POCHA: '포차에서 소박하게 옛날 감성을 느껴요',
  // HOF: '짱구 아빠가 좋아하는 맥주에요.',
  // WINE: '분위기 있는 와인바에서 시간을 보내세요',
  // COCKTAIL: '모히또에서 몰디브 한 잔',
  // PUBBAR: '가볍게 펍바에서 좋은 시간을 보내세요',
};

const useRecommendation = () => {
  // 날씨 상태를 번역하는 함수
  const translateWeatherCondition = useCallback(condition => {
    for (const key in weatherTextTranslation) {
      if (condition.toLowerCase().includes(key)) {
        return weatherTextTranslation[key];
      }
    }
    return '알 수 없는 날씨';
  }, []);

  // 통합된 추천 로직
  const recommendCategory = useCallback(
    (weatherCondition, temp, rainProbability) => {
      // 날씨 상태 번역
      const translatedCondition = translateWeatherCondition(weatherCondition);

      let category = '';
      let reason = '';

      // 야장 추천 조건
      // if (
      //   (translatedCondition === '맑음' ||
      //     translatedCondition === '구름 조금' ||
      //     translatedCondition === '흐림') &&
      //   temp >= 18 &&
      //   temp <= 26 &&
      //   rainProbability === 0
      // ) {
      //   category = 'OUTDOOR';
      //   reason = categoryReasons['OUTDOOR'];
      // }
      // 비 오는 날 전·막걸리 추천
      if (rainProbability > 3) {
        category = 'KOREAN';
        reason = categoryReasons['비 오는 날엔 전과 막걸리가 최고죠!'];
      }
      // 그 외 조건: 야장 제외 랜덤 추천
      else {
        // const filteredCategories = allCategories.filter(
        //   cat => cat !== 'OUTDOOR',
        // );
        const randomIndex = Math.floor(Math.random() * allCategories.length);
        category = allCategories[randomIndex];
        reason = categoryReasons[category];
      }

      // 카테고리와 추천 이유 반환
      return {category, reason};
    },
    [translateWeatherCondition],
  );

  return {recommendCategory};
};

export default useRecommendation;
