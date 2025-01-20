import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';

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

const RptAlcoholPicker = ({}) => {
  const [alcohol, setAlcohol] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>주종*</Text>
      <View style={styles.alcoholRow}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={alcohol}
            onValueChange={value => setAlcohol(value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}>
            {alcohols.map(alcohol => (
              <Picker.Item
                key={alcohol}
                label={alcohol.label}
                value={alcohol.value}
              />
            ))}
          </Picker>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  title: {
    fontWeight: '400',
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
    flex: 1,
    backgroundColor: '#F2F2F2',
    borderRadius: 5,
    paddingHorizontal: 10,
    justifyContent: 'center',
    height: 60,
    overflow: 'hidden', // iOS 겹침 방지
  },
  picker: {
    color: '#333', // 텍스트 색상
  },
  pickerItem: {
    color: '#333',
    fontSize: 18,
    fontWeight: '400',
  },
});

export default RptAlcoholPicker;
