import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from '../../../utils/CustomText';

const FastSearchItem = ({label, isSelected, onPress}) => {
  return (
    <Pressable
      style={[
        styles.searchChoiceContainer,
        isSelected && styles.selectedContainer,
      ]}
      onPress={onPress}>
      <CustomText
        style={[styles.choiceText, isSelected && styles.choiceSelectedText]}>
        {label}
      </CustomText>
      <MaterialIcons
        name="keyboard-arrow-down"
        size={20}
        color={isSelected ? '#3CBBFF' : 'gray'}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  searchChoiceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  selectedContainer: {
    borderColor: '#3CBBFF',
    backgroundColor: '#E6F7FF',
  },
  choiceText: {
    fontSize: 14,
    color: '#767676',
    fontWeight: '500',
  },
  choiceSelectedText: {
    fontSize: 14,
    color: '#3CBBFF',
    fontWeight: 'bold',
  },
});

export default FastSearchItem;
