import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

const alcoholTypes = [
  {label: '소주', value: 'SOJU'},
  {label: '맥주', value: 'BEER'},
  {label: '막걸리', value: 'MAKGEOLLI'},
  {label: '와인', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '사케', value: 'SAKE'},
  {label: '고량주', value: 'KAOLIANG'},
  {label: '위스키', value: 'WHISKEY'},
  {label: '보드카', value: 'VODKA'},
  {label: '진', value: 'GIN'},
  {label: '럼', value: 'RUM'},
  {label: '데킬라', value: 'TEQUILA'},
];

const RptAlcoholPicker = ({selectedType, onTypeChange}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>주종*</Text>
      <View style={styles.alcoholList}>
        {alcoholTypes.map(alcohol => (
          <Pressable
            key={alcohol.value}
            style={[
              styles.alcoholButton,
              selectedType === alcohol.value && styles.selectedAlcohol,
            ]}
            onPress={() => onTypeChange(alcohol.value)}>
            <Text
              style={[
                styles.alcoholText,
                selectedType === alcohol.value && styles.selectedAlcoholText,
              ]}>
              {alcohol.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
  },
  title: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  alcoholList: {
    flexDirection: 'row',
    flexWrap: 'wrap', // 버튼 여러 줄 정렬
    gap: 10,
  },
  alcoholButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
  },
  alcoholText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
  },
  selectedAlcohol: {
    backgroundColor: '#16BBFF',
  },
  selectedAlcoholText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default RptAlcoholPicker;
