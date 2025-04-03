import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import ActionButtons from './ActionButtons';
import {BottomSheetScrollView} from '@gorhom/bottom-sheet';

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

const UpdateStoreDrink = ({
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const ensureTwoOptions = () => {
    if (updatedValue.length < 3) {
      const additionalValue = {type: '', price: 0};
      setUpdatedValue([...updatedValue, additionalValue]);
    }
  };

  useEffect(() => {
    ensureTwoOptions();
  }, [updatedValue]);

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>대표 주종</Text>
      <BottomSheetScrollView
        contentContainerStyle={{paddingBottom: 120, flexGrow: 1}}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive">
        {updatedValue.map((drink, index) => {
          const itemPerRow = 3;
          const selectedTypes = updatedValue
            .filter((_, i) => i !== index)
            .map(d => d.type);

          const filteredAlcohols = alcoholTypes.filter(
            a => !selectedTypes.includes(a.value) || a.value === drink.type,
          );

          const remainder = filteredAlcohols.length % itemPerRow;
          const paddingCount = remainder === 0 ? 0 : itemPerRow - remainder;
          const paddedAlcohols = [
            ...filteredAlcohols,
            ...Array(paddingCount).fill(null),
          ];

          return (
            <View key={index} style={styles.alcoholRow}>
              {expandedIndex !== index ? (
                <TouchableOpacity
                  style={styles.collapsedInfo}
                  onPress={() => toggleExpand(index)}>
                  <Text style={styles.collapsedText}>
                    {drink.type
                      ? alcoholTypes.find(a => a.value === drink.type)?.label ||
                        '주종 선택'
                      : '주종 선택'}
                  </Text>
                  <Text style={styles.collapsedText}>
                    {drink.price ? `${drink.price} 원` : '가격 입력'}
                  </Text>
                </TouchableOpacity>
              ) : (
                <>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.sectionTitle}>주종 선택</Text>
                    <View style={styles.alcoholList}>
                      {paddedAlcohols.map((alcohol, i) =>
                        alcohol ? (
                          <Pressable
                            key={alcohol.value}
                            style={[
                              styles.alcoholButton,
                              drink.type === alcohol.value &&
                                styles.selectedAlcohol,
                            ]}
                            onPress={() =>
                              setUpdatedValue(prev => {
                                const updatedDrinks = [...prev];
                                updatedDrinks[index] = {
                                  ...updatedDrinks[index],
                                  type: alcohol.value,
                                };
                                return updatedDrinks;
                              })
                            }>
                            <Text
                              style={[
                                styles.alcoholText,
                                drink.type === alcohol.value &&
                                  styles.selectedAlcoholText,
                              ]}>
                              {alcohol.label}
                            </Text>
                          </Pressable>
                        ) : (
                          <View
                            key={`dummy-${i}`}
                            style={styles.alcoholButton}
                          />
                        ),
                      )}
                    </View>
                  </View>

                  <View style={styles.priceContainer}>
                    <Text style={styles.sectionTitle}>가격 입력</Text>
                    <View style={styles.priceInputWrapper}>
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

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={() => toggleExpand(index)}>
                    <Text style={styles.saveButtonText}>완료</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          );
        })}
        <ActionButtons onCancel={onCancel} onSave={onSave} />
      </BottomSheetScrollView>
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
  },
  title: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  alcoholRow: {
    marginBottom: 30,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#181A1A',
    marginBottom: 10,
  },
  alcoholList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
  },
  alcoholButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 7,
    minWidth: '23%',
    alignItems: 'center',
    marginBottom: 12,
  },
  alcoholText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#767676',
  },
  selectedAlcohol: {
    backgroundColor: '#80D2F4',
  },
  selectedAlcoholText: {
    color: '#fff',
    fontFamily: 'Pretendard-SemiBold',
  },
  priceContainer: {
    marginTop: 20,
  },
  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: '#FFF',
    height: 50,
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  unit: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  collapsedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  collapsedText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#5CCEFF',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
