import {useCallback} from 'react';

// 카테고리 매핑 객체
const categoryMap = {
  IZAKAYA: '이자카야',
  KOREAN: '한식',
  WESTERN: '양식',
  CHINESE: '중식',
  GAMSEONG: '감성주점',
  JOGBO: '족발',
  STEW: '찜 · 찌개',
  GRILLED: '구이 · 탕',
  CHICKEN: '치킨',
  JEONMAK: '전 · 막걸리',
  DRIED: '마른 안주',
  SEAFOOD: '해산물',
  ROOM: '룸',
  GROUP: '단체',
  OUTDOOR: '야장',
  POCHA: '포차',
  HOF: '호프',
  WINE: '와인바',
  COCKTAIL: '칵테일바',
  PUBBAR: '펍바',
};

// 영어 카테고리명을 한글로 변환하는 훅
const useCategoryTranslation = () => {
  // 변환 함수
  const translateCategory = useCallback(englishCategory => {
    return categoryMap[englishCategory] || '알 수 없는 카테고리';
  }, []);

  return {translateCategory};
};

export default useCategoryTranslation;
