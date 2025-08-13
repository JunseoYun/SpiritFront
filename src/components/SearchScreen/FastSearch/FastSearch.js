import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import useCategoryTranslation from '../../../hooks/useCategoryTranslation';
import useTranslateAlcohol from '../../../hooks/useTranslateAlcohol';

const FastSearch = ({title, selectedFilters, handleBottomOpen}) => {
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
    <View style={[styles.container, !title && styles.fastcontainer]}>
      {title ? (
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subTitle}>
            원하는 조건으로 내 주변 술집을 빠르게 찾아보세요
          </Text>
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
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 25,
    marginLeft: 25,
  },
  fastcontainer: {
    marginVertical: 15,
  },
  titleContainer: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
  },
  subTitle: {
    fontSize: 15,
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginRight: 10,
    marginTop: 10,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionSelected: {
    backgroundColor: '#45C9FF',
  },
  optionText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  optionTextSelected: {
    color: '#fff',
    fontFamily: 'Pretendard-Bold',
  },
});

export default FastSearch;
