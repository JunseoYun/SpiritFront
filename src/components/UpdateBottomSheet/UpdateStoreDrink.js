import React, {useState, useEffect, useLayoutEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
  SafeAreaView,
} from 'react-native';

import {UpdateStore} from '../../api/storeApi';
import {useToast} from '../../context/ToastContext';
import Loading from '../../hooks/Loading';

const alcoholTypes = [
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

const UpdateStoreDrink = ({navigation, route}) => {
  const {storeId, mainDrinkDtos} = route.params;
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [updatedValue, setUpdatedValue] = useState(mainDrinkDtos || []);
  const [selectnull, setSelectnull] = useState(false);
  const [loading, setLoading] = useState(false);
  const {showToast} = useToast();
  const [overText, setOverText] = useState(false);

  const ensureTwoOptions = () => {
    if (updatedValue.length < 3) {
      const additionalValue = {type: '', price: 0};
      setUpdatedValue([...updatedValue, additionalValue]);
    }
  };

  useEffect(() => {
    if (mainDrinkDtos) {
      setUpdatedValue(mainDrinkDtos);
    }
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleComplete}>
          <Text style={[styles.searchButton, selectnull && {color: '#999'}]}>
            완료
          </Text>
        </Pressable>
      ),
    });
  }, [handleComplete, updatedValue, selectnull]);

  useEffect(() => {
    const hasInvalidDrink = updatedValue.some(item => {
      const isEmpty = item.type === '' && (!item.price || item.price === 0);
      if (isEmpty) return false; // 완전 빈 항목은 무시

      const isMissingTypeOrPrice =
        item.type === '' ||
        item.price === undefined ||
        item.price === null ||
        item.price === 0 ||
        isNaN(item.price);

      return isMissingTypeOrPrice;
    });

    setSelectnull(hasInvalidDrink);
  }, [updatedValue]);

  const handleComplete = async () => {
    if (selectnull) {
      showToast('정보를 모두 입력해 주세요.', 'center');
      return;
    }

    const filteredDrinks = updatedValue.filter(
      item => item.type !== '' && item.price > 0,
    );

    try {
      setLoading(true);
      await UpdateStore(storeId, {mainDrinkDtos: filteredDrinks});
      navigation.goBack();
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    ensureTwoOptions();
  }, [updatedValue]);

  const toggleExpand = index => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0} // iOS의 경우 적절한 offset 설정
    >
      <SafeAreaView style={styles.bottomSheetContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{paddingTop: 10}}
          keyboardShouldPersistTaps="handled">
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
                        ? alcoholTypes.find(a => a.value === drink.type)
                            ?.label || '주종 선택'
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
                                  const current = updatedDrinks[index]?.type;
                                  const selected = alcohol.value;
                                  updatedDrinks[index] = {
                                    ...updatedDrinks[index],
                                    type: current === selected ? '' : selected,
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
                          keyboardType="number-pad"
                          placeholder="0"
                          placeholderTextColor="#aaa"
                          value={drink.price?.toString() || ''}
                          onChangeText={value => {
                            const cleaned = value.replace(/[^0-9]/g, '');
                            let num =
                              cleaned === '' ? 0 : parseInt(cleaned, 10);
                            if (!isNaN(num) && num > 100000000) {
                              num = 100000000;
                              setOverText(true);
                            } else {
                              setOverText(false);
                            }
                            setUpdatedValue(prev => {
                              const updatedDrinks = [...prev];
                              updatedDrinks[index] = {
                                ...updatedDrinks[index],
                                price: num,
                              };
                              return updatedDrinks;
                            });
                          }}
                        />
                        <Text style={styles.unit}>원</Text>
                      </View>
                      {overText && (
                        <Text style={styles.errorText}>
                          가격은 최대 1억원까지 입력 가능합니다
                        </Text>
                      )}
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
        </ScrollView>

        <Loading loading={loading} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default UpdateStoreDrink;

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  alcoholRow: {
    marginVertical: 15,
    marginHorizontal: 18,
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
  searchButton: {
    marginRight: 18,
    fontSize: 18,
    fontWeight: '500',
    color: '#16BBFF',
  },
  footer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(194, 194, 194, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
  errorText: {
    color: '#FF4816',
    fontSize: 14,
    marginTop: 5,
  },
});
