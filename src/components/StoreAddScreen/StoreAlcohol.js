import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import ColorUtil from '../../utils/ColorUtil';
import CustomText from '../../utils/CustomText';

const alcohols = [
  {label: '소주', value: 'SOJU'},
  {label: '맥주', value: 'BEER'},
  {label: '막걸리', value: 'MAKGEOLLI'},
  {label: '전통주', value: 'TRADITIONAL'},
  {label: '하이볼', value: 'HIGHBALL'},
  {label: '와인', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '사케', value: 'SAKE'},
  {label: '고량주', value: 'KAOLIANG'},
  {label: '위스키', value: 'WHISKEY'},
  {label: '보드카', value: 'VODKA'},
  {label: '데킬라', value: 'TEQUILA'},
];

const StoreAlcohol = ({
  alcohol = [],
  setAlcohol,
  index,
  error,
  type = 'default',
}) => {
  const isRegistration = type === 'registration';
  const selectedAlcohols = Array.isArray(alcohol) ? alcohol : [];

  const toggleAlcohol = value => {
    setAlcohol(prev => {
      const current = Array.isArray(prev) ? prev : [];
      const isSelected = current.includes(value);

      if (isSelected) {
        return current.filter(item => item !== value);
      }

      if (current.length >= 3) {
        return current;
      }

      return [...current, value];
    });
  };

  return (
    <View
      style={[styles.container, isRegistration && styles.registrationSpacing]}>
      {!isRegistration && (
        <View style={styles.labelView}>
          <CustomText style={styles.label}>대표 주종</CustomText>
          <CustomText style={styles.countLabel}>
            ({selectedAlcohols.length}/3)
          </CustomText>
        </View>
      )}
      <View style={styles.categoryGrid}>
        {alcohols.map(({label, value}) => {
          const isSelected = selectedAlcohols.includes(value);
          const isDisabled = !isSelected && selectedAlcohols.length >= 3;

          return (
            <Pressable
              key={value}
              style={[
                styles.alcoholChip,
                isSelected && styles.alcoholChipSelected,
                isDisabled && styles.alcoholChipDisabled,
              ]}
              onPress={() => toggleAlcohol(value)}
              disabled={isDisabled}>
              <CustomText
                style={[
                  styles.alcoholText,
                  isSelected && styles.alcoholTextSelected,
                  isDisabled && styles.alcoholTextDisabled,
                ]}>
                {label}
              </CustomText>
            </Pressable>
          );
        })}
      </View>
      {error === 'StoreDrink' && selectedAlcohols.length === 0 && (
        <CustomText style={styles.errorMessage}>
          대표 주종을 하나 이상 선택해 주세요.
        </CustomText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    marginHorizontal: 20,
  },
  registrationSpacing: {
    marginTop: 0,
  },
  labelView: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 15,
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
  alcoholChip: {
    marginRight: 12,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: ColorUtil.border,
  },
  alcoholChipSelected: {
    borderColor: '#3CBBFF',
    backgroundColor: 'rgba(60,187,255,0.08)',
  },
  alcoholChipDisabled: {
    borderColor: '#E8E8E8',
  },
  alcoholText: {
    color: ColorUtil.subText,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
  },
  alcoholTextSelected: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
  },
  alcoholTextDisabled: {
    color: '#C8C8C8',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    marginTop: 6,
  },
});

export default StoreAlcohol;
