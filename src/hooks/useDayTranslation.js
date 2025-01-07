import { useCallback } from 'react';

// 요일 매핑 객체
const dayMap = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
};

// 영어 요일명을 한글로 변환하는 훅
const useDayTranslation = () => {
  // 변환 함수
  const translateDay = useCallback(englishDay => {
    return dayMap[englishDay] || '알 수 없는 요일';
  }, []);

  return { translateDay };
};

export default useDayTranslation;
