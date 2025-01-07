import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

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

const StoreAlcohol = ({ alcohol, setAlcohol }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>대표주종*</Text>
      {[0, 1].map((_, index) => (
        <View key={index} style={styles.alcoholRow}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={alcohol}
              onValueChange={(value) => setAlcohol(value)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
            >
              {alcohols.map((alcohol) => (
                <Picker.Item
                  key={alcohol}
                  label={alcohol}
                  value={alcohol}
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
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 15,
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
    overflow: 'hidden', // iOS 겹침 방지
  },
  picker: {
    color: '#333', // 텍스트 색상
  },
  pickerItem: {
    color: '#333', // 텍스트 색상을 검은색으로 고정
    fontSize: 18, // 텍스트 크기
    fontWeight: '400', // 텍스트 두께
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
