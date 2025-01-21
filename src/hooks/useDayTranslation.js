import {useCallback} from 'react';

// 요일 매핑 객체
const dayMap = {
  MONDAY: '월',
  TUESDAY: '화',
  WEDNESDAY: '수',
  THURSDAY: '목',
  FRIDAY: '금',
  SATURDAY: '토',
  SUNDAY: '일',
};

// 영어 요일명을 한글로 변환하고 정렬된 문자열로 반환하는 훅
const useDayTranslation = () => {
  // 변환 및 정렬 함수
  const translateDays = useCallback(englishDays => {
    if (!Array.isArray(englishDays)) return '알 수 없는 요일';

    // 영어 요일을 한글로 변환
    const translatedDays = englishDays
      .map(day => dayMap[day] || '') // 변환, 매핑되지 않으면 빈 문자열
      .filter(day => day); // 빈 문자열 제거

    // "월화수목금토일" 순서에 따라 정렬
    const sortedDays = ['월', '화', '수', '목', '금', '토', '일'].filter(day =>
      translatedDays.includes(day),
    );

    // 공백으로 구분된 문자열 반환
    return sortedDays.join(' ');
  }, []);

  return {translateDays};
};

export default useDayTranslation;
