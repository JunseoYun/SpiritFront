import {useCallback} from 'react';

// 카테고리 매핑 객체
const categoryMap = {
  IZAKAYA: '이자카야',
  KOREAN: '한식',
  WESTERN: '양식',
  CHINESE: '중식',
  GAMSEONG: '감성주점',
  POCHA: '포장마차',
  GRILLED_STEW: '구이·찜',
  CHICKEN_HOF: '치킨·호프',
  RAW_SEAFOOD: '회·해산물',
  PUB_BAR: '펍·바',
};

// 영어 카테고리명을 한글로 변환하는 훅
const useCategoryTranslation = () => {
  // 변환 함수
  const translateCategory = useCallback(englishCategory => {
    return categoryMap[englishCategory] || '미지정';
  }, []);

  return {translateCategory};
};

export default useCategoryTranslation;
