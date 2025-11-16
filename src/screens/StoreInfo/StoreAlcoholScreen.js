import React, {useEffect, useState, useMemo} from 'react';
import {StyleSheet, Text, View, Platform, Pressable} from 'react-native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import AlcoholItem from '../../components/StoreAlcoholScreen/AlcoholItem';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';

const ORDER_SPACER_HEIGHT = 0;

const alcoholMapping = {
  SOJU: '소주',
  BEER: '맥주',
  MAKGEOLLI: '막걸리',
  TRADITIONAL: '전통주',
  HIGHBALL: '하이볼',
  WINE: '와인',
  COCKTAIL: '칵테일',
  SAKE: '사케',
  KAOLIANG: '고량주',
  WHISKEY: '위스키',
  VODKA: '보드카',
  TEQUILA: '데킬라',
};

export const AlcoholTypeRadioGroup = ({
  types,
  selectedType,
  onSelect,
  containerStyle,
  ...wrapperProps
}) => {
  if (!types?.length) {
    return null;
  }
  const {style: wrapperStyle, ...restProps} = wrapperProps;
  return (
    <View
      style={[styles.radioGroup, containerStyle, wrapperStyle]}
      {...restProps}>
      {['전체', ...types].map(type => (
        <Pressable
          key={type}
          style={styles.radioItem}
          hitSlop={10}
          onPress={() => onSelect?.(type)}>
          <View
            style={[
              styles.radioCircle,
              selectedType === type && styles.radioSelectedCircle,
            ]}>
            {selectedType === type && <View style={styles.radioInnerDot} />}
          </View>
          <Text
            style={[
              styles.radioLabel,
              selectedType === type && styles.radioLabelSelected,
            ]}>
            {type}
          </Text>
        </Pressable>
      ))}
    </View>
  );
};

const StoreAlcoholScreen = ({
  navigation,
  storeId,
  alcohols = [],
  mainDrinks = [],
  sectionPositions: parentSectionPositions, // 상위에서 관리하는 섹션 위치들
  setSectionPositions: setParentSectionPositions, // 상위에서 섹션 위치 관리 함수
  isUpdatable = false,
  isOrderEnabled,
  onAlcoholUpdateComplete = null,
  selectedType: controlledType,
  onTypeChange,
  hideTypeFilter = false,
  onAvailableTypesChange,
  typeFilterProps = {},
}) => {
  const [alcoholsState, setAlcoholsState] = useState(alcohols);
  const [uncontrolledType, setUncontrolledType] = useState('전체');
  const {bottom: androidBottom} = useSafeAndroidInsets();
  const {bottom: safeBottom} = useSafeAreaInsets();
  const bottomInset =
    Platform.OS === 'android' ? androidBottom + 30 : safeBottom;
  const {translateAlcohol} = useTranslateAlcohol();
  const containerPaddingBottom = isOrderEnabled
    ? ORDER_SPACER_HEIGHT + bottomInset
    : bottomInset;

  useEffect(() => {
    setAlcoholsState(alcohols);
  }, [alcohols]);

  const groupedAlcohols = useMemo(() => {
    const mainDrinkTypes = new Set(mainDrinks.map(drink => drink.type));
    const grouped = alcoholsState.reduce((acc, alcohol) => {
      const translatedType = translateAlcohol(alcohol.type);
      const isMainDrink = mainDrinkTypes.has(alcohol.type);
      if (!acc[translatedType]) {
        acc[translatedType] = {main: [], regular: []};
      }
      if (isMainDrink) {
        acc[translatedType].main.push(alcohol);
      } else {
        acc[translatedType].regular.push(alcohol);
      }
      return acc;
    }, {});
    return Object.keys(grouped)
      .sort((a, b) => {
        const isAMainDrink = mainDrinkTypes.has(
          Object.keys(alcoholMapping).find(key => alcoholMapping[key] === a),
        );
        const isBMainDrink = mainDrinkTypes.has(
          Object.keys(alcoholMapping).find(key => alcoholMapping[key] === b),
        );
        if (isAMainDrink && !isBMainDrink) return -1;
        if (!isAMainDrink && isBMainDrink) return 1;
        return (
          Object.values(alcoholMapping).indexOf(a) -
          Object.values(alcoholMapping).indexOf(b)
        );
      })
      .reduce((acc, key) => {
        const {main, regular} = grouped[key];
        acc[key] = [...main, ...regular];
        return acc;
      }, {});
  }, [alcoholsState, mainDrinks, translateAlcohol]);

  const availableTypes = useMemo(
    () => Object.keys(groupedAlcohols),
    [groupedAlcohols],
  );

  const isTypeControlled =
    typeof controlledType === 'string' && typeof onTypeChange === 'function';
  const currentType = isTypeControlled ? controlledType : uncontrolledType;

  const handleTypeSelect = type => {
    if (isTypeControlled) {
      onTypeChange(type);
    } else {
      setUncontrolledType(type);
    }
  };

  useEffect(() => {
    if (currentType !== '전체' && !availableTypes.includes(currentType)) {
      if (isTypeControlled) {
        onTypeChange?.('전체');
      } else {
        setUncontrolledType('전체');
      }
    }
  }, [availableTypes, currentType, isTypeControlled, onTypeChange]);

  useEffect(() => {
    onAvailableTypesChange?.(availableTypes);
  }, [availableTypes, onAvailableTypesChange]);

  const filteredTypes = currentType === '전체' ? availableTypes : [currentType];

  const handleAlcoholManagePress = () => {
    navigation.navigate('StoreStack', {
      screen: 'AlcoholEditScreen',
      params: {
        storeId,
        alcohols: alcoholsState,
      },
    });
    if (typeof onAlcoholUpdateComplete === 'function') {
      const unsubscribe = navigation.addListener('focus', async () => {
        await onAlcoholUpdateComplete();
        unsubscribe();
      });
    }
  };

  return (
    <SafeAreaView
      edges={['bottom']}
      style={[styles.container, {paddingBottom: containerPaddingBottom}]}>
      {/* 주류 리스트 */}
      {/* 내부 ScrollView 제거하고 View로 감싸기 */}
      {isUpdatable && (
        <>
          <Pressable
            style={styles.reorderButton}
            onPress={handleAlcoholManagePress}>
            <Text style={styles.alcoholAddButtonText}>주류 관리</Text>
          </Pressable>

          {availableTypes.length > 0 && !hideTypeFilter && (
            <AlcoholTypeRadioGroup
              types={availableTypes}
              selectedType={currentType}
              onSelect={handleTypeSelect}
              {...typeFilterProps}
            />
          )}
        </>
      )}
      <View style={{flex: 1}}>
        {filteredTypes.map(type => (
          <View
            key={type}
            onLayout={e => {
              const y = e.nativeEvent.layout.y;
              setParentSectionPositions(prev => ({
                ...prev,
                [type]: y,
              }));
            }}>
            <Text style={styles.typeLabel}>{type}</Text>
            {groupedAlcohols[type].map(alcohol => (
              <AlcoholItem
                key={alcohol.id}
                alcohol={alcohol}
                storeId={storeId}
                navigation={navigation}
              />
            ))}
            <View style={styles.line} />
          </View>
        ))}

        {alcohols?.length === 0 && (
          <View style={styles.footer}>
            <Text style={styles.emptyText}>등록된 주류가 없어요</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  reorderButton: {
    backgroundColor: '#F1F2F3',
    padding: 12,
    marginHorizontal: 18,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 32,
  },
  alcoholAddButtonText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },
  tabContainer: {
    paddingHorizontal: 18,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  tabButton: {
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
    marginBottom: 5,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
  typeLabel: {
    fontSize: 20,
    color: '#999',
    marginLeft: 18,
    fontFamily: 'Pretendard-SemiBold',
    marginTop: 10,
    marginBottom: 5,
  },
  line: {
    height: 7,
    backgroundColor: '#F2F2F2',
    marginBottom: 10,
  },
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
    color: '#c0c0c0',
  },
  addImageButton: {
    marginTop: 20,
    marginHorizontal: 18,
    paddingTop: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addImageText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '600',
  },
  radioGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
    marginBottom: 6,
  },
  radioCircle: {
    width: 15,
    height: 15,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  radioSelectedCircle: {
    borderColor: '#3CBBFF',
  },
  radioInnerDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#3CBBFF',
  },
  radioLabel: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  radioLabelSelected: {
    color: '#333',
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default StoreAlcoholScreen;
