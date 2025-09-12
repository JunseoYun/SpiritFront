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
import {useToast} from '../../context/ToastContext';

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

const StoreAlcohol = ({alcohol, setAlcohol, index, error}) => {
  const {showToast} = useToast();
  const [overText, setOverText] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState(null);

  const handleAlcoholChange = (index, key, value) => {
    setAlcohol(prev => {
      const updated = [...(prev || [])];
      if (!updated[index]) updated[index] = {type: '', price: 0};
      updated[index][key] = value;
      return updated;
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
      <Text style={styles.title}>
        {index ? '대표주종* (최대 3종)' : '대표주종 (최대 3종)'}
      </Text>
      {error === 'StoreDrink' && !hasValidAlcohol && (
        <Text style={styles.errorMessage}>
          대표 주종을 입력하고 가격을 설정해 주세요.
        </Text>
      )}
      <View style={styles.summaryWrap}>
        {alcohol.map((item, index) => {
          const label = alcohols.find(a => a.value === item?.type)?.label;
          const price = item?.price?.toLocaleString();
          const isFilled = item?.type && item?.price;

          return (
            <Pressable
              key={index}
              style={[styles.summaryItem, !isFilled && styles.summaryItemEmpty]}
              onPress={() => toggleExpand(index)}>
              <Text
                style={[
                  styles.summaryText,
                  !isFilled && styles.summaryTextEmpty,
                ]}>
                {isFilled ? `${label} ${price}원` : '주종 · 가격'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {alcohol.map((item, index) => {
        if (expandedIndex !== index) return null;

        const selectedTypes = alcohol
          .filter((_, i) => i !== index)
          .map(d => d?.type);

        const filtered = alcohols.filter(
          a => !selectedTypes.includes(a.value) || a.value === item?.type,
        );

        const remainder = filtered.length % 4;
        const paddingCount = remainder === 0 ? 0 : 4 - remainder;
        const padded = [...filtered, ...Array(paddingCount).fill(null)];

        return (
          <View key={index} style={styles.sectionView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => handleRemoveAlcohol(index)}>
              <Text style={styles.deleteText}>삭제</Text>
            </TouchableOpacity>

            <View style={styles.pickerContainer}>
              <Text style={styles.sectionTitle}>주종</Text>
              <View style={styles.grid}>
                {padded.map((alcoholItem, i) =>
                  alcoholItem ? (
                    <Pressable
                      key={alcoholItem.value}
                      style={[
                        styles.gridItem,
                        item.type === alcoholItem.value
                          ? styles.itemSelected
                          : styles.itemUnselected,
                      ]}
                      onPress={() =>
                        handleAlcoholChange(
                          index,
                          'type',
                          item.type === alcoholItem.value
                            ? ''
                            : alcoholItem.value,
                        )
                      }>
                      <Text
                        style={[
                          styles.gridLabel,
                          item.type === alcoholItem.value
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

              <View style={styles.priceContainer}>
                {item?.price > 0 && (
                  <Text style={styles.sectionTitle}>가격</Text>
                )}
                <TextInput
                  style={styles.priceInput}
                  value={item.price ? item.price.toString() : ''}
                  onChangeText={value => {
                    const cleaned = value.replace(/[^0-9]/g, '');
                    let num = cleaned === '' ? '' : parseInt(cleaned, 10);
                    if (typeof num === 'number' && !isNaN(num)) {
                      if (num > 100000000) {
                        num = 100000000;
                        setOverText(true);
                      } else {
                        setOverText(false);
                      }
                    }
                    handleAlcoholChange(index, 'price', num);
                  }}
                  placeholder="가격"
                  placeholderTextColor="#999"
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
                {overText && (
                  <Text style={styles.errorText}>
                    가격은 최대 1억원까지 입력 가능합니다
                  </Text>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => toggleExpand(index)}>
              <Text style={styles.saveButtonText}>완료</Text>
            </TouchableOpacity>
          </View>
        );
      })}

      {alcohol.length < 3 && (
        <TouchableOpacity
          onPress={() => {
            setAlcohol(prev => {
              const updated = [...(prev || []), {type: '', price: 0}];
              setTimeout(() => {
                setExpandedIndex(updated.length - 1);
              }, 0);
              return updated;
            });
          }}
          style={styles.addButton}>
          <Text style={styles.addButtonText}>+ 대표주종 추가</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {marginHorizontal: 20, marginTop: 40},
  title: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 20,
  },
  summaryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  summaryItem: {
    backgroundColor: '#E8F7FF',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  summaryItemEmpty: {backgroundColor: '#f0f0f0'},
  summaryText: {
    color: '#16BBFF',
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
  },
  summaryTextEmpty: {color: '#999'},
  alcoholRow: {marginBottom: 30},
  sectionView: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 7,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
    marginBottom: 20,
  },
  deleteText: {
    color: '#999',
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {marginBottom: 10, marginTop: 15},
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
    gap: 4,
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
  itemSelected: {backgroundColor: '#E8F7FF', borderColor: '#16BBFF'},
  itemUnselected: {backgroundColor: '#fff', borderColor: '#ccc'},
  gridLabel: {fontSize: 14, fontFamily: 'Pretendard-Medium'},
  labelSelected: {color: '#16BBFF', fontWeight: '600'},
  labelUnselected: {color: '#999'},
  priceContainer: {marginVertical: 20},
  priceInput: {
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 7,
    color: 'black',
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
  addButton: {
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#45C9FF',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    marginTop: -15,
    marginBottom: 15,
  },
  errorText: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
  },
});

export default StoreAlcohol;
