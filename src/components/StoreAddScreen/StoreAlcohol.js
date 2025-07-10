import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const alcohols = [
  {label: '소주', value: 'SOJU'},
  {label: '맥주', value: 'BEER'},
  {label: '막걸리', value: 'MAKGEOLLI'},
  {label: '전통주', value: 'TRADITIONAL'},
  {label: '하이볼', value: 'HIGHBALL'},
  {label: '와인', value: 'WINE'},
  {label: '칵테일', value: 'COCKTAIL'},
  {label: '사케', value: 'SAKE'},
  {label: '고량주', value: 'KAOLIANG'},
  {label: '위스키', value: 'WHISKEY'},
  {label: '보드카', value: 'VODKA'},
  {label: '데킬라', value: 'TEQUILA'},
];

const StoreAlcohol = ({alcohol, setAlcohol, error}) => {
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleAlcoholChange = (index, key, value) => {
    setAlcohol(prev => {
      const updatedAlcohol = [...(prev || [])];
      if (!updatedAlcohol[index]) {
        updatedAlcohol[index] = {type: '', price: 0};
      }
      updatedAlcohol[index][key] = value;
      return updatedAlcohol;
    });
  };

  const handleRemoveAlcohol = index => {
    setAlcohol(prev => prev.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const hasValidAlcohol = alcohol.some(
    item => item.type?.trim() && item.price > 0,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>대표주종* (최대 3종)</Text>

      {alcohol.map((_, index) => {
        const selectedTypes = alcohol
          .filter((_, i) => i !== index)
          .map(d => d?.type);

        const currentType = alcohol[index]?.type;
        const filteredAlcohols = alcohols.filter(
          a => !selectedTypes.includes(a.value) || a.value === currentType,
        );

        const remainder = filteredAlcohols.length % 4;
        const paddingCount = remainder === 0 ? 0 : 4 - remainder;
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
                  {alcohol[index]?.type
                    ? alcohols.find(a => a.value === alcohol[index]?.type)
                        ?.label || '선택'
                    : '주종 선택'}
                </Text>
                <Text style={styles.collapsedText}>
                  {alcohol[index]?.price
                    ? `${alcohol[index]?.price} 원`
                    : '가격 입력'}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.sectionView}>
                <TouchableOpacity
                  style={[styles.closeButton]}
                  onPress={() => handleRemoveAlcohol(index)}>
                  <Ionicons name="close" size={25} color="#999" />
                </TouchableOpacity>

                <View style={styles.pickerContainer}>
                  <View style={styles.priceContainer}>
                    <View>
                      {alcohol[index]?.price === 0 ||
                      alcohol[index]?.price === ''
                        ? ''
                        : alcohol[index]?.price.toString() && (
                            <Text style={styles.sectionTitle}>주류 가격 *</Text>
                          )}
                    </View>
                    <TextInput
                      style={[styles.priceInput]}
                      value={
                        alcohol[index]?.price === 0 ||
                        alcohol[index]?.price === ''
                          ? ''
                          : alcohol[index]?.price.toString()
                      }
                      onChangeText={value =>
                        handleAlcoholChange(
                          index,
                          'price',
                          value === '' ? '' : parseInt(value),
                        )
                      }
                      placeholder="주류 가격 *"
                      placeholderTextColor="#999"
                      keyboardType="number-pad"
                      returnKeyType="done"
                    />
                  </View>

                  <Text style={styles.sectionTitle}>주종 선택</Text>
                  <View style={styles.grid}>
                    {paddedAlcohols.map((alcoholItem, i) =>
                      alcoholItem ? (
                        <Pressable
                          key={alcoholItem.value}
                          style={[
                            styles.gridItem,
                            alcoholItem.value === alcohol[index]?.type
                              ? styles.itemSelected
                              : styles.itemUnselected,
                          ]}
                          onPress={() => {
                            const current = alcohol[index]?.type;
                            const selected = alcoholItem.value;
                            handleAlcoholChange(
                              index,
                              'type',
                              current === selected ? '' : selected,
                            );
                          }}>
                          <Text
                            style={[
                              styles.gridLabel,
                              alcoholItem.value === alcohol[index]?.type
                                ? styles.labelSelected
                                : styles.labelUnselected,
                            ]}>
                            {alcoholItem.label}
                          </Text>
                        </Pressable>
                      ) : (
                        <View
                          key={`dummy-${i}`}
                          style={[styles.gridItem, {opacity: 0}]}
                        />
                      ),
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={() => toggleExpand(index)}>
                  <Text style={styles.saveButtonText}>완료</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}

      {alcohol.length < 3 && (
        <TouchableOpacity
          onPress={() => {
            setAlcohol(prev => [...(prev || []), {type: '', price: 0}]);
          }}
          style={styles.addButton}>
          <Text style={styles.addButtonText}>+ 대표주종 추가</Text>
        </TouchableOpacity>
      )}

      {error === 'StoreDrink' && !hasValidAlcohol && (
        <Text style={styles.errorMessage}>
          대표 주종을 입력하고 가격을 설정해 주세요.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 40,
  },
  title: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 20,
  },
  alcoholRow: {
    marginBottom: 30,
  },
  sectionView: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 17,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  pickerContainer: {
    marginBottom: 10,
    marginTop: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#181A1A',
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 10,
    columnGap: 10,
    marginTop: 10,
  },
  gridItem: {
    width: '22.5%',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom: 10,
  },
  itemSelected: {
    backgroundColor: '#E8F7FF',
    borderColor: '#16BBFF',
  },
  itemUnselected: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  gridLabel: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  labelSelected: {
    color: '#16BBFF',
    fontWeight: '600',
  },
  labelUnselected: {
    color: '#999',
  },
  priceContainer: {
    marginBottom: 30,
    marginTop: 10,
  },
  priceInput: {
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 7,
    color: 'black',
  },
  collapsedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 17,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  collapsedText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
  },
  saveButton: {
    marginTop: 20,
    backgroundColor: '#16BBFF',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    marginTop: 5,
  },
  addButton: {
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#45C9FF',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default StoreAlcohol;
