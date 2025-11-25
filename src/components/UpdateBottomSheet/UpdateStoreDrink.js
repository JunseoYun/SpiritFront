import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import {UpdateStore} from '../../api/storeApi';
import {useToast} from '../../context/ToastContext';
import Loading from '../../hooks/Loading';
import CustomText from '../common/CustomText';

const ALCOHOL_TYPES = [
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

const normalizeDrinks = drinks => {
  if (!Array.isArray(drinks)) {
    return [];
  }

  if (drinks.length === 0) {
    return [];
  }

  if (typeof drinks[0] === 'string') {
    return drinks;
  }

  return drinks.map(drink => drink?.type).filter(Boolean);
};

const MAX_SELECTION = 3;

const UpdateStoreDrink = ({navigation, route}) => {
  const {storeId, mainDrinkDtos, mainDrinkTypes} = route.params;
  const {showToast} = useToast();
  const [loading, setLoading] = useState(false);

  const initialSelection = useMemo(() => {
    if (Array.isArray(mainDrinkTypes)) {
      return normalizeDrinks(mainDrinkTypes);
    }
    if (Array.isArray(mainDrinkDtos)) {
      return normalizeDrinks(mainDrinkDtos);
    }
    return [];
  }, [mainDrinkDtos, mainDrinkTypes]);

  const [selectedAlcohols, setSelectedAlcohols] = useState(initialSelection);

  useEffect(() => {
    setSelectedAlcohols(initialSelection);
  }, [initialSelection]);

  const toggleAlcohol = value => {
    setSelectedAlcohols(prev => {
      if (prev.includes(value)) {
        return prev.filter(item => item !== value);
      }
      if (prev.length >= MAX_SELECTION) {
        return prev;
      }
      return [...prev, value];
    });
  };

  const handleComplete = useCallback(async () => {
    if (selectedAlcohols.length === 0) {
      showToast('대표 주종을 하나 이상 선택해주세요.', 'center');
      return;
    }

    try {
      setLoading(true);
      await UpdateStore(storeId, {mainDrinkTypes: selectedAlcohols});
      navigation.goBack();
    } catch (error) {
      showToast('잠시 후 다시 시도해 주세요.', 'center');
    } finally {
      setLoading(false);
    }
  }, [selectedAlcohols, showToast, storeId, navigation]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={handleComplete}
          disabled={loading || selectedAlcohols.length === 0}>
          <CustomText
            style={[
              styles.headerButton,
              (loading || selectedAlcohols.length === 0) &&
                styles.headerButtonDisabled,
            ]}>
            완료
          </CustomText>
        </Pressable>
      ),
    });
  }, [navigation, handleComplete, loading, selectedAlcohols.length]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}>
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <CustomText style={styles.title}>대표 주종 선택</CustomText>
          <CustomText style={styles.subtitle}>
            최대 3개까지 선택할 수 있습니다.
          </CustomText>

          <View style={styles.alcoholGrid}>
            {ALCOHOL_TYPES.map(({label, value}) => {
              const isSelected = selectedAlcohols.includes(value);
              const disabled =
                !isSelected && selectedAlcohols.length >= MAX_SELECTION;

              return (
                <Pressable
                  key={value}
                  style={[
                    styles.alcoholChip,
                    isSelected && styles.alcoholChipSelected,
                    disabled && styles.alcoholChipDisabled,
                  ]}
                  disabled={disabled}
                  onPress={() => toggleAlcohol(value)}>
                  <CustomText
                    style={[
                      styles.alcoholLabel,
                      isSelected && styles.alcoholLabelSelected,
                      disabled && styles.alcoholLabelDisabled,
                    ]}>
                    {label}
                  </CustomText>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
        <Loading loading={loading} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  contentContainer: {
    paddingHorizontal: 18,
    paddingTop: 24,
    paddingBottom: 32,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    color: '#111',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#666',
  },
  alcoholGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
  },
  alcoholChip: {
    marginRight: 12,
    marginBottom: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D5D8DC',
    backgroundColor: '#FFF',
  },
  alcoholChipSelected: {
    borderColor: '#3CBBFF',
    backgroundColor: 'rgba(60,187,255,0.12)',
  },
  alcoholChipDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F7F8FA',
  },
  alcoholLabel: {
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: '#444',
  },
  alcoholLabelSelected: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#1789E0',
  },
  alcoholLabelDisabled: {
    color: '#B7BDC4',
  },
  headerButton: {
    marginRight: 18,
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF',
  },
  headerButtonDisabled: {
    color: '#A7CFF1',
  },
});

export default UpdateStoreDrink;
