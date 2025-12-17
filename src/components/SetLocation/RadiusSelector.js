import React from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import CustomText from '../../utils/CustomText';

const RadiusSelector = ({options, selectedValue, onSelect}) => {
  return (
    <View style={styles.section}>
      <CustomText style={styles.label}>탐색 반경</CustomText>

      <View style={styles.optionsRow}>
        {options.map(option => {
          const selected = selectedValue === option.value;

          return (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={({pressed}) => [
                styles.option,
                selected && styles.optionSelected,
                pressed && styles.optionPressed,
              ]}>
              <CustomText
                style={[
                  styles.optionText,
                  selected && styles.optionTextSelected,
                ]}>
                {option.label}
              </CustomText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginHorizontal: 18,
    marginTop: 22,
  },

  label: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 10,
  },

  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  option: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 16, // pill 형태
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    marginRight: 8,
    marginBottom: 8,
  },

  optionSelected: {
    borderColor: '#111827',
    backgroundColor: '#F9FAFB',
  },

  optionPressed: {
    opacity: 0.85,
  },

  optionText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
  },

  optionTextSelected: {
    color: '#111827',
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default RadiusSelector;
