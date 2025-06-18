import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';

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
  {label: '하이볼', value: 'HIGHBALL'},
  {label: '데킬라', value: 'TEQUILA'},
];

const StoreAlcohol = ({alcohol, setAlcohol, error, index}) => {
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

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const hasValidAlcohol = alcohol.some(
    item => item.type.trim() && item.price > 0,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {index ? '대표주종* (최대 3종)' : '대표주종 (최대 3종)'}
      </Text>

      {[0, 1, 2].map((_, index) => {
        const itemPerRow = 3;
        const selectedTypes = alcohol
          .filter((_, i) => i !== index)
          .map(d => d?.type);

        const currentType = alcohol[index]?.type;
        const filteredAlcohols = alcohols.filter(
          a => !selectedTypes.includes(a.value) || a.value === currentType,
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
              <>
                <View style={styles.sectionView}>
                  <View style={styles.pickerContainer}>
                    <Text style={styles.sectionTitle}>주종 선택</Text>
                    <View style={styles.alcoholList}>
                      {paddedAlcohols.map((alcoholItem, i) =>
                        alcoholItem ? (
                          <Pressable
                            key={alcoholItem.value}
                            style={[
                              styles.alcoholButton,
                              alcoholItem.value === alcohol[index]?.type &&
                                styles.selectedAlcohol,
                            ]}
                            onPress={() => {
                              const current = alcohol[index]?.type;
                              const selected = alcoholItem.value;
                              handleAlcoholChange(
                                index,
                                'type',
                                current === selected ? '' : selected, // 동일하면 해제, 아니면 선택
                              );
                            }}>
                            <Text
                              style={[
                                styles.alcoholText,
                                alcoholItem.value === alcohol[index]?.type &&
                                  styles.selectedAlcoholText,
                              ]}>
                              {alcoholItem.label}
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
                        keyboardType="number-pad"
                        placeholder="0"
                        placeholderTextColor="#aaa"
                        value={alcohol[index]?.price?.toString() || ''}
                        onChangeText={value =>
                          handleAlcoholChange(
                            index,
                            'price',
                            parseInt(value) || 0,
                          )
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
                </View>
              </>
            )}
          </View>
        );
      })}
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
    backgroundColor: '#F7F8FA',
    padding: 20,
    borderRadius: 17,
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
    backgroundColor: '#F7F8FA',
    borderRadius: 16,
    padding: 14,
  },
  alcoholButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 7,
    minWidth: '25%',
    alignItems: 'center',
  },
  alcoholText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#999',
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
    color: '#181A1A',
    fontFamily: 'Pretendard-Medium',
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
    backgroundColor: '#F7F8FA',
    borderRadius: 17,
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
    backgroundColor: '#45C9FF',
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
});

export default StoreAlcohol;
