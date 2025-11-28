import React, {useState, useEffect} from 'react';
import {Text, View, Pressable, StyleSheet} from 'react-native';
import CustomText from '../../utils/CustomText';

const GroupBySelector = ({groupBy, toggleGroupBy, setDropdownVisible}) => {
  return (
    <View style={styles.resultGroup}>
      {['gender', 'ageGroup'].map(gb => {
        const isSelected = groupBy.includes(gb);
        return (
          <Pressable
            key={gb}
            onPress={() => {
              toggleGroupBy(gb);
              if (setDropdownVisible) setDropdownVisible(false);
            }}
            style={[
              styles.resultGroupButton,
              isSelected && styles.chipSelected,
            ]}>
            <CustomText
              style={[styles.resultGroupText, isSelected && styles.selectText]}>
              {gb === 'gender' ? '성별' : '연령대'}
            </CustomText>
          </Pressable>
        );
      })}
    </View>
  );
};

export default GroupBySelector;

const styles = StyleSheet.create({
  resultGroup: {
    flexDirection: 'row',
  },
  resultGroupButton: {
    marginRight: 10,
  },
  resultGroupText: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  selectText: {
    color: '#121212',
    fontFamily: 'Pretendard-SemiBold',
    textDecorationLine: 'underline',
  },
});
