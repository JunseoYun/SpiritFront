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
  onScrollTo, // 상위에서 scrollTo를 호출할 함수 (scrollToHandler)
  sectionPositions: parentSectionPositions, // 상위에서 관리하는 섹션 위치들
  imagelist = 0,
  scrollY,
  selectedType,
  setSelectedType,
  isClickedRef,
  filterHeight,
  mainSectionHeight,
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
      if (isClickedRef.current) return; // 클릭 강제 활성화 중이면 무시

      let current = null;
      let imgnull = 0;
      Object.keys(parentSectionPositions).forEach(type => {
        if (imagelist == 0) {
          if (
            value >=
            parentSectionPositions[type] + mainSectionHeight - offset + top
          ) {
            current = type;
          }
        }
        if (imagelist > 0) {
          if (
            value >=
            parentSectionPositions[type] + mainSectionHeight - offset
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
              selectedType === type && styles.tabButtonActive, // ✅ 선택된 버튼 스타일
            ]}
            onPress={() => {
              setSelectedType(type); // 클릭 즉시 활성화
              isClickedRef.current = true; // scrollY 이벤트 잠시 무시
              const y = parentSectionPositions[type];
              const offset = Platform.OS === 'ios' ? insets.top + 30 : top + 40;
              console.log(offset);
              if (onScrollTo && y !== undefined) {
                if (imagelist === 0) {
                  onScrollTo({
                    x: 0,
                    y: y + mainSectionHeight - offset + top,
                    animated: true,
                  });
                } else if (imagelist > 0) {
                  onScrollTo({
                    x: 0,
                    y: y + mainSectionHeight - offset,
                    animated: true,
                  });
                } else {
                }
              } else {
                console.warn('onScrollTo 또는 y 좌표가 올바르지 않습니다');
              }
            }}>
            <Text
              style={[
                styles.tabText,
                selectedType === type && styles.tabTextActive, // ✅ 선택된 텍스트 스타일
              ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    paddingTop: 10,
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
    backgroundColor: '#E8F7FF', // 선택 시 배경색
    borderColor: '#45C9FF',
  },
  tabTextActive: {
    color: '#45C9FF', // 선택 시 글자색
  },
});

export default Alcoholcategorytab;
