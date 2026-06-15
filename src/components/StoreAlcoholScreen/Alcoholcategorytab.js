import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  View,
  Platform,
} from 'react-native';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import CustomText from '../../utils/CustomText';

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

const Alcoholcategorytab = ({
  alcohols = [],
  mainDrinks = [],
  onScrollTo,
  sectionPositions: parentSectionPositions,
  imagelist = 0,
  scrollY,
  selectedType,
  setSelectedType,
  isClickedRef,
  filterHeight,
  mainSectionHeight = 0,
}) => {
  const [alcoholsState, setAlcoholsState] = useState(alcohols);
  const {height: windowHeight} = Dimensions.get('window');
  const {translateAlcohol} = useTranslateAlcohol();
  const paddingTopValue = windowHeight;
  const insets = useSafeAreaInsets();
  const {top, bottom} = useSafeAndroidInsets();
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

  const selectedTypeRef = useRef(selectedType);

  useEffect(() => {
    selectedTypeRef.current = selectedType;
  }, [selectedType]);
  useEffect(() => {
    if (!scrollY || !parentSectionPositions) return;

    const listenerId = scrollY.addListener(({value}) => {
      if (isClickedRef.current) return;

      let current = null;
      let imgnull = 0;
      const offset = Platform.OS === 'ios' ? insets.top + 30 : top + 40;
      Object.keys(parentSectionPositions).forEach(type => {
        if (imagelist == 0) {
          if (
            value >=
            parentSectionPositions[type] + mainSectionHeight - offset + top + 2
          ) {
            current = type;
          }
        }
        if (imagelist > 0) {
          if (
            value >=
            parentSectionPositions[type] + mainSectionHeight - offset + 2
          ) {
            current = type;
          }
        }
      });

      if (current && current !== selectedType) {
        setSelectedType(current);
      }
    });
    return () => scrollY.removeListener(listenerId);
  }, [scrollY, parentSectionPositions, selectedType]);

  return (
    <View style={[styles.tabContainer]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 12,
          gap: 6,
          paddingVertical: 6,
        }}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {Object.keys(groupedAlcohols).map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.tabButton,
              selectedType === type && styles.tabButtonActive,
            ]}
            onPress={() => {
              setSelectedType(type);
              isClickedRef.current = true;
              const y = parentSectionPositions[type];
              const offset = Platform.OS === 'ios' ? insets.top + 30 : top + 40;
              if (onScrollTo && y !== undefined) {
                if (imagelist === 0) {
                  onScrollTo({
                    x: 0,
                    y: y + mainSectionHeight - offset + top + 2,
                    animated: true,
                  });
                } else if (imagelist > 0) {
                  onScrollTo({
                    x: 0,
                    y: y + mainSectionHeight - offset + 2,
                    animated: true,
                  });
                } else {
                }
              } else {
              }
            }}>
            <CustomText
              style={[
                styles.tabText,
                selectedType === type && styles.tabTextActive, // ???좏깮???띿뒪???ㅽ???
              ]}>
              {type}
            </CustomText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    paddingTop: 5,
    backgroundColor: '#fff',
    paddingBottom: 5,
  },
  stickyActive: {
    marginTop: 40,
  },
  nonimgstickyActive: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  tabButton: {
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
  tabButtonActive: {
    backgroundColor: '#E8F7FF',
    borderColor: '#3CBBFF',
  },
  tabTextActive: {
    color: '#3CBBFF',
  },
});

export default Alcoholcategorytab;
