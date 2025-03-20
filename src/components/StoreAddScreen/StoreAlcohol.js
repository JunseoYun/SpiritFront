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
  {label: '럼', value: 'RUM'},
  {label: '데킬라', value: 'TEQUILA'},
];

const StoreAlcohol = ({alcohol, setAlcohol, error}) => {
  const [expandedIndex, setExpandedIndex] = useState(null); // 현재 확장된 항목 인덱스

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
    setExpandedIndex(expandedIndex === index ? null : index); // 현재 항목만 확장
  };

  const hasValidAlcohol = alcohol.some(
    item => item.type.trim() && item.price > 0,
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>대표주종* (최대 2종)</Text>
      {[0, 1].map((_, index) => (
        <View key={index} style={styles.alcoholRow}>
          {/* 간략 정보 또는 기본 보기 */}
          {expandedIndex !== index && (
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
          )}

          {/* 상세 입력 */}
          {expandedIndex === index && (
            <>
              <View style={styles.pickerContainer}>
                <Text style={styles.sectionTitle}>주종 선택</Text>
                <View style={styles.alcoholList}>
                  {alcohols.map(alcoholItem => (
                    <Pressable
                      key={alcoholItem.value}
                      style={[
                        styles.alcoholButton,
                        alcoholItem.value === alcohol[index]?.type &&
                          styles.selectedAlcohol,
                      ]}
                      onPress={() =>
                        handleAlcoholChange(index, 'type', alcoholItem.value)
                      }>
                      <Text
                        style={[
                          styles.alcoholText,
                          alcoholItem.value === alcohol[index]?.type &&
                            styles.selectedAlcoholText,
                        ]}>
                        {alcoholItem.label}
                      </Text>
                    </Pressable>
                  ))}
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
                    value={alcohol[index]?.price?.toString() || ''}
                    onChangeText={value =>
                      handleAlcoholChange(index, 'price', parseInt(value) || 0)
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
      ))}
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
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 20,
  },
  alcoholRow: {
    marginBottom: 30,
  },
  pickerContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  alcoholList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  alcoholButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F2F2F2',
    borderRadius: 8,
    minWidth: '30%',
    alignItems: 'center',
  },
  alcoholText: {
    color: '#333',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedAlcohol: {
    backgroundColor: '#16BBFF',
  },
  selectedAlcoholText: {
    color: '#fff',
    fontWeight: 'bold',
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
    backgroundColor: '#16BBFF',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 12,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 15,
    marginTop: 5,
  },
});

export default StoreAlcohol;
