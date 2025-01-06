import React from 'react';
import {View, Text} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import styles from './StoreStyle';

const StoreCategory = ({selectedCategory, setSelectedCategory}) => {
  // 값 변경 핸들러
  const handleValueChange = (itemValue, index) => {
    setSelectedCategory(prev => {
      const updatedValues = [...prev];
      updatedValues[index] = itemValue;
      return updatedValues;
    });
  };

  return (
    <View>
      <View style={styles.storeinputview}>
        <Text style={styles.storetext}>카테고리 선택(필수)</Text>
      </View>
      <View style={styles.storeinputview}>
        {Array.from({length: 3}).map((_, index) => (
          <View style={styles.Pickerview} key={index}>
            <Picker
              selectedValue={selectedCategory[index]}
              onValueChange={itemValue => handleValueChange(itemValue, index)}
              mode="dropdown">
              {categories.map((item, itemIndex) => (
                <Picker.Item
                  key={itemIndex}
                  label={item.label}
                  value={item.value}
                  style={styles.Pickeritems}
                />
              ))}
            </Picker>
          </View>
        ))}
      </View>
    </View>
  );
};

const categories = [
  {label: '-', value: null},
  {label: '이자카야', value: 'IZAKAYA'},
  {label: '한식주점', value: 'KOREAN'},
  {label: '양식주점', value: 'WESTERN'},
  {label: '중화주점', value: 'CHINESE'},
  {label: '감성주점', value: 'GAMSEONG'},
  {label: '족발 보쌈', value: 'JOGBO'},
  {label: '찜 찌개', value: 'STEW'},
  {label: '구이 탕', value: 'GRILLED'},
  {label: '치킨', value: 'CHICKEN'},
  {label: '전 막걸리', value: 'JEONMAK'},
  {label: '마른안주', value: 'DRIED'},
  {label: '해산물', value: 'SEAFOOD'},
  {label: '룸', value: 'ROOM'},
  {label: '단체 행사', value: 'GROUP'},
  {label: '야장', value: 'OUTDOOR'},
  {label: '포차', value: 'POCHA'},
  {label: '호프', value: 'HOF'},
  {label: '와인바', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '펍 바', value: 'PUBBAR'},
];

export default StoreCategory;
