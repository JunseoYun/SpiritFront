import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const alcohols = [
  '소주',
  '맥주',
  '막걸리',
  '와인',
  '칵테일',
  '사케',
  '고량주',
  '위스키',
  '보드카',
  '진',
  '럼',
  '데킬라',
];

const RptAlcoholPicker = ({}) => {
  const [alcohol, setAlcohol] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.title}>대표주종*</Text>
      <View style={styles.alcoholRow}>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={alcohol}
            onValueChange={value => setAlcohol(value)}
            style={styles.picker}
            itemStyle={styles.pickerItem}>
            {alcohols.map(alcohol => (
              <Picker.Item key={alcohol} label={alcohol} value={alcohol} />
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
});

export default RptAlcoholPicker;
