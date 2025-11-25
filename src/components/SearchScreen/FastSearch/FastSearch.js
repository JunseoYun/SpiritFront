import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';
import CustomText from '../../common/CustomText';

const FastSearch = ({title, selectedFilters, handleBottomOpen, isHeader}) => {
  const {translateCategory} = useCategoryTranslation();
  const {translateAlcohol} = useTranslateAlcohol();

  const filterEntries = Object.entries(selectedFilters || {});

  const getDisplayValue = (key, value) => {
    if (!value) return '';
    if (key === '카테고리') return translateCategory(value);
    if (key === '주종') return translateAlcohol(value);
    return value;
  };

  return (
    <View
      style={[styles.container, isHeader === false && styles.fastcontainer]}>
      {title ? (
        <View style={styles.titleContainer}>
          <CustomText style={styles.title}>{title}</CustomText>
          <CustomText style={styles.subTitle}>
            원하는 조건으로 내 주변 술집을 빠르게 찾아보세요
          </CustomText>
        </View>
      ) : null}

      <View style={styles.fastContainer}>
        {filterEntries.map(([key, value], index) => {
          const displayValue = getDisplayValue(key, value);
          const isSelected = displayValue !== '';
          const label = isSelected ? `${displayValue}` : key;

          return (
            <TouchableOpacity
              key={index}
              style={[styles.optionButton, isSelected && styles.optionSelected]}
              onPress={handleBottomOpen}>
              <CustomText
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}>
                {label}
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginLeft: 18,
    marginBottom: 20,
  },
  fastcontainer: {
    marginTop: 15,
    marginBottom: 15,
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    marginTop: 40,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  subTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#777',
    marginTop: 5,
  },
  fastContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  optionButton: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    marginRight: 10,

    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  optionSelected: {
    backgroundColor: '#E9F5FB',

    borderWidth: 1,
    borderColor: '#3CBBFF',
  },
  optionText: {
    color: '#121212',
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
  },
  optionTextSelected: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Bold',
  },
});

export default FastSearch;
