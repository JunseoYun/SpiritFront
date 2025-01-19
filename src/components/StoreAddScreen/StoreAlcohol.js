import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';

// 한글 표시와 영어 값을 매핑한 객체 배열
const alcohols = [
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

const StoreAlcohol = ({alcohol, setAlcohol}) => {
  const handleAlcoholChange = (index, key, value) => {
    setAlcohol(prev => {
      // 특정 인덱스가 없으면 기본 객체 생성
      const updatedAlcohol = [...prev];
      if (!updatedAlcohol[index]) {
        updatedAlcohol[index] = {type: '', price: 0};
      }
      updatedAlcohol[index][key] = value;
      return updatedAlcohol;
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>대표주종*</Text>
      {[0, 1].map((_, index) => (
        <View key={index} style={styles.alcoholRow}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={alcohol[index]?.type || ''}
              onValueChange={value => handleAlcoholChange(index, 'type', value)}
              style={styles.picker}
              itemStyle={styles.pickerItem}>
              <Picker.Item label="선택" value="" />
              {alcohols.map(alcohol => (
                <Picker.Item
                  key={alcohol.value}
                  label={alcohol.label} // 한글 표시
                  value={alcohol.value} // 실제 저장될 영어 값
                />
              ))}
            </Picker>
          </View>
          <View style={styles.priceContainer}>
            <TextInput
              style={styles.priceInput}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#aaa"
              value={alcohol[index]?.price.toString() || ''}
              onChangeText={value =>
                handleAlcoholChange(index, 'price', parseInt(value) || 0)
              }
            />
            <Text style={styles.unit}>원</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 40,
  },
  title: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  alcoholRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  pickerContainer: {
    flex: 2,
    backgroundColor: '#F2F2F2',
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    height: 60,
    overflow: 'hidden',
  },
  picker: {
    color: '#333',
  },
  pickerItem: {
    color: '#333',
    fontSize: 18,
    fontWeight: '400',
  },
  priceContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  priceInput: {
    flex: 1,
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  unit: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default StoreAlcohol;
