import React from 'react';
import {View, Text, StyleSheet, Pressable, Dimensions} from 'react-native';

const alcoholTypes = [
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

const screenWidth = Dimensions.get('window').width;
const buttonWidth = (screenWidth - 32 - 36) / 4 - 10; // 4개 버튼 기준

const RptAlcoholPicker = ({selectedType, onTypeChange, isUpdate}) => {
  return (
    <View style={[styles.container, isUpdate && {marginTop: 0}]}>
      {!isUpdate && <Text style={styles.title}>주종*</Text>}
      <View
        style={[
          styles.grid,
          isUpdate && {marginHorizontal: 0, justifyContent: 'flex-start'},
        ]}>
        {alcoholTypes.map(alcohol => {
          const isSelected = selectedType === alcohol.value;
          return (
            <Pressable
              key={alcohol.value}
              style={[
                styles.item,
                isUpdate
                  ? styles.updateItem
                  : {width: buttonWidth, marginHorizontal: 5},
                isSelected ? styles.itemSelected : styles.itemUnselected,
              ]}
              onPress={() => onTypeChange(alcohol.value)}>
              <Text
                style={[
                  styles.label,
                  isSelected ? styles.labelSelected : styles.labelUnselected,
                ]}>
                {alcohol.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  title: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 12,
    marginLeft: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 18,
  },
  item: {
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  updateItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
  },
  itemSelected: {
    backgroundColor: '#E8F7FF',
    borderColor: '#16BBFF',
  },
  itemUnselected: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  label: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  labelSelected: {
    color: '#16BBFF',
    fontWeight: '600',
  },
  labelUnselected: {
    color: '#999',
  },
});

export default RptAlcoholPicker;
