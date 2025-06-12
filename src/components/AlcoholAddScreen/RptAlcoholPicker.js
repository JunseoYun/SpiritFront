import React from 'react';
import {View, Text, StyleSheet, Pressable, Dimensions} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

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
  {label: '하이볼', value: 'HIGHBALL'},
  {label: '데킬라', value: 'TEQUILA'},
];

const screenWidth = Dimensions.get('window').width;
const buttonWidth = (screenWidth - 40 - 10 * 3) / 4; // 양 옆 20px 마진 + 3개 간격

const RptAlcoholPicker = ({selectedType, onTypeChange}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>주종*</Text>
      <View style={styles.grid}>
        {alcoholTypes.map(alcohol => {
          const isSelected = selectedType === alcohol.value;
          return (
            <Pressable
              key={alcohol.value}
              style={[
                styles.item,
                {width: buttonWidth},
                isSelected && styles.itemSelected,
              ]}
              onPress={() => onTypeChange(alcohol.value)}>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
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
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 25,
  },
  title: {
    fontWeight: '600',
    color: '#666',
    fontSize: 16,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  item: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  itemSelected: {
    backgroundColor: '#16BBFF',
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  labelSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
});

export default RptAlcoholPicker;
