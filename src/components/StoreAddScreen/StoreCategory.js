import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import ColorUtil from '../../utils/ColorUtil';

const StoreCategory = ({selectedCategory, setSelectedCategory, error}) => {
  const {translateCategory} = useCategoryTranslation();

  const toggleCategory = category => {
    setSelectedCategory(prev => {
      if (prev.includes(category)) {
        return prev.filter(item => item !== category);
      } else if (prev.length < 3) {
        return [...prev, category];
      }
      return prev;
    });
  };

  return (
    <View style={styles.container}>
      {/* ✅ 상단 라벨 영역 */}
      <View style={styles.labelView}>
        <Text style={styles.label}>카테고리</Text>
        <Text style={[styles.countLabel]}>({selectedCategory.length}/3)</Text>
      </View>

      {/* ✅ 카테고리 칩 리스트 */}
      <View style={styles.categoryGrid}>
        {innerCategories.map(({text, value}) => {
          const isSelected = selectedCategory.includes(value);
          const disabled = !isSelected && selectedCategory.length >= 3;

          return (
            <Pressable
              key={value}
              style={[
                styles.categoryChip,
                isSelected && styles.categoryChipSelected,
                disabled && styles.categoryChipDisabled,
              ]}
              onPress={() => toggleCategory(value)}
              disabled={disabled}>
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.categoryTextSelected,
                  disabled && styles.categoryTextDisabled,
                ]}>
                {text}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ✅ 에러 문구 */}
      {error === 'StoreCategory' && selectedCategory.length === 0 && (
        <Text style={styles.errorMessage}>
          매장 카테고리를 하나 이상 선택해주세요.
        </Text>
      )}
    </View>
  );
};

const innerCategories = [
  {text: '이자카야', value: 'IZAKAYA'},
  {text: '한식', value: 'KOREAN'},
  {text: '양식', value: 'WESTERN'},
  {text: '중식', value: 'CHINESE'},
  {text: '감성주점', value: 'GAMSEONG'},
  {text: '구이/찜', value: 'GRILLED_STEW'},
  {text: '치킨/호프', value: 'CHICKEN_HOF'},
  {text: '회/해산물', value: 'RAW_SEAFOOD'},
  {text: '펍/바', value: 'PUB_BAR'},
  {text: '포차', value: 'POCHA'},
];

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    marginHorizontal: 18,
  },
  labelView: {
    flexDirection: 'row',
    alignItems: 'flex-end', // 밑줄 정렬
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 16,
    marginRight: 6,
  },
  countLabel: {
    fontFamily: 'Pretendard-Regular',
    color: '#999',
    fontSize: 14,
    paddingBottom: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryChip: {
    marginRight: 12,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: ColorUtil.border,
  },
  categoryChipSelected: {
    borderColor: '#3CBBFF',
    backgroundColor: 'rgba(60,187,255,0.08)',
  },
  categoryChipDisabled: {
    borderColor: '#E8E8E8',
  },
  categoryText: {
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
  },
  categoryTextDisabled: {
    color: '#C8C8C8',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    marginTop: 6,
  },
});

export default StoreCategory;
