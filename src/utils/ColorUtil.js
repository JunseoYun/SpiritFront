// utils/ColorUtil.js
// 앱 전체 공용 컬러 유틸

const ColorUtil = {
  // 메인 브랜드 컬러
  main: '#3CBBFF',
  mainChip: '#E9F5FB',
  // 비활성 (disabled) 상태 컬러

  chipText: '#B4B7BE',
  chipBackgroud: '#F5F5F5',
  mainDisable: '#A5D8FA',
  subText: '#6B7280',

  // 텍스트 컬러
  textPrimary: '#333333',
  textSecondary: '#777777',
  placeholderText: '#B4B7BE',
  placeholderBorder: '#DCDEE3',

  // 배경 컬러
  background: '#FFFFFF',
  backgroundGray: '#F8F9FA',

  // 경계선/보더
  border: '#E5E5E5',

  // 상태 컬러
  success: '#2ED573',
  warning: '#FFC107',
  error: '#FF4757',

  // 유틸 함수
  rgba(hex, alpha = 1) {
    // HEX → RGBA 변환
    const hexValue = hex.replace('#', '');
    const r = parseInt(hexValue.substring(0, 2), 16);
    const g = parseInt(hexValue.substring(2, 4), 16);
    const b = parseInt(hexValue.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },
};

export default ColorUtil;
