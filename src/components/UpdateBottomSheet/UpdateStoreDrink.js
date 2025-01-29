import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트

const UpdateStoreDrink = ({
  alcohols,
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
}) => {
  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>대표 주종</Text>
      {updatedValue.map((drink, index) => (
        <View key={index} style={styles.alcoholRow}>
          <View style={styles.pickerContainer}>
            <Picker
              itemStyle={styles.pickerItem}
              selectedValue={drink.type}
              onValueChange={value =>
                setUpdatedValue(prev => {
                  const updatedDrinks = [...prev];
                  updatedDrinks[index] = {
                    ...updatedDrinks[index],
                    type: value,
                  };
                  return updatedDrinks;
                })
              }
              style={styles.picker}>
              <Picker.Item label="선택" value="" />
              {alcohols.map(alcohol => (
                <Picker.Item
                  key={alcohol.value}
                  label={alcohol.label}
                  value={alcohol.value}
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
              value={drink.price?.toString() || ''}
              onChangeText={value =>
                setUpdatedValue(prev => {
                  const updatedDrinks = [...prev];
                  updatedDrinks[index] = {
                    ...updatedDrinks[index],
                    price: parseInt(value) || 0,
                  };
                  return updatedDrinks;
                })
              }
            />
            <Text style={styles.unit}>원</Text>
          </View>
        </View>
      ))}
      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreDrink;

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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
    textAlign: 'center',
  },
  pickerItem: {
    color: '#333',
    fontSize: 18,
    fontWeight: '400',
  },
  unit: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});
