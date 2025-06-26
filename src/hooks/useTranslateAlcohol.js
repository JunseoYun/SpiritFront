import {useCallback} from 'react';

// 영어와 한글의 매핑 데이터
const alcoholMapping = {
  SOJU: '소주',
  BEER: '맥주',
  MAKGEOLLI: '막걸리',
  TRADITIONAL: '전통주',
  HIGHBALL: '하이볼',
  WINE: '와인',
  COCKTAIL: '칵테일',
  SAKE: '사케',
  KAOLIANG: '고량주',
  WHISKEY: '위스키',
  VODKA: '보드카',
  TEQUILA: '데킬라',
};

// 커스텀 훅
const useTranslateAlcohol = () => {
  const translateAlcohol = useCallback(alcohol => {
    return alcoholMapping[alcohol] || '미지정';
  }, []);

  return {translateAlcohol};
};

export default useTranslateAlcohol;
