import React from 'react';
import {View, Text, TextInput} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import styles from './StoreStyle';

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

const StoreAlcohol = ({alcohol, setAlcohol}) => {
  return (
    <View style={styles.storeinputalcoholview}>
      <View style={styles.storeinputview}>
        <Text style={styles.alcoholText}>대표주종 (필수)</Text>
        <Text style={styles.alcoholsubText}>가격은 숫자로 입력해주세요</Text>
      </View>
      <View style={styles.alcoholpickerview}>
        <View style={styles.alcoholPicker}>
          <Picker
            selectedValue={alcohol}
            onValueChange={value => setAlcohol(value)}>
            {alcohols.map(alcohol => (
              <Picker.Item
                key={alcohol}
                label={alcohol}
                value={alcohol}
                style={{fontSize: 14}}
              />
            ))}
          </Picker>
        </View>
        <Text style={styles.alcoholpricetext}>가격</Text>
        <View style={styles.alcoholpriceview}>
          <TextInput
            style={styles.alcoholprice}
            keyboardType="numeric"
            placeholder="0"
          />
          <Text style={styles.alcoholunit}>원</Text>
        </View>
      </View>
      <View style={styles.alcoholpickerview}>
        <View style={styles.alcoholPicker}>
          <Picker
            selectedValue={alcohol}
            onValueChange={value => setAlcohol(value)}>
            {alcohols.map(alcohol => (
              <Picker.Item
                key={alcohol}
                label={alcohol}
                value={alcohol}
                style={{fontSize: 14}}
              />
            ))}
          </Picker>
        </View>
        <Text style={styles.alcoholpricetext}>가격</Text>
        <View style={styles.alcoholpriceview}>
          <TextInput
            style={styles.alcoholprice}
            keyboardType="numeric"
            placeholder="0"
          />
          <Text style={styles.alcoholunit}>원</Text>
        </View>
      </View>
    </View>
  );
};

export default StoreAlcohol;
