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
  GRILLED_STEW: '오늘은 맛있는 고기가 땡기네요!',
  CHICKEN_HOF: '바삭한 치킨과 함께 즐거운 시간을!',
  RAW_SEAFOOD: '신선한 해산물로 특별한 날을 보내세요',
  PUB_BAR: '분위기 좋은 곳에서 좋은 시간을 보내세요',
  POCHA: '포차에서 소박하게 옛날 감성을 느껴요',
};

const useRecommendation = () => {
  // 통합된 추천 로직
  const recommendCategory = useCallback(() => {
    let category = '';
    let reason = '';

    const randomIndex = Math.floor(Math.random() * allCategories.length);
    category = allCategories[randomIndex];
    reason = categoryReasons[category];

    // 카테고리와 추천 이유 반환
    return {category, reason};
  }, []);

  return {recommendCategory};
};

export default useRecommendation;
