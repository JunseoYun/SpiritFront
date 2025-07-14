import React, {useState, useEffect, useMemo} from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  View,
} from 'react-native';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';

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
  tabY,
}) => {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const listener = scrollY.addListener(({value}) => {
      if (value >= tabY) {
        setIsSticky(true);
      } else if (value < tabY) {
        setIsSticky(false);
      }
    });
    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY, tabY]);

  const [alcoholsState, setAlcoholsState] = useState(alcohols);
  const {height: windowHeight} = Dimensions.get('window');

  const {translateAlcohol} = useTranslateAlcohol();
  const paddingTopValue = windowHeight;

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

  return (
    <View
      style={[
        styles.tabContainer,
        isSticky
          ? imagelist > 0
            ? styles.stickyActive
            : styles.nonimgstickyActive
          : null, // sticky 상태일 때 스타일 적용
      ]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {Object.keys(groupedAlcohols).map(type => (
          <TouchableOpacity
            key={type}
            style={styles.tabButton}
            onPress={() => {
              const y = parentSectionPositions[type];
              if (onScrollTo && y !== undefined) {
                if (imagelist === 0) {
                  onScrollTo({
                    x: 0,
                    y: y + paddingTopValue - 180,
                    animated: true,
                  });
                } else if (imagelist > 0) {
                  onScrollTo({
                    x: 0,
                    y: y + paddingTopValue,
                    animated: true,
                  });
                } else {
                }
              } else {
                console.warn('onScrollTo 또는 y 좌표가 올바르지 않습니다');
              }
            }}>
            <Text style={styles.tabText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tabContainer: {
    marginLeft: 10,
    paddingTop: 10,
    backgroundColor: '#fff',
    paddingBottom: 5,
  },
  stickyActive: {
    marginTop: 40,
  },
  nonimgstickyActive: {
    marginTop: 10,
  },
  tabButton: {
    marginRight: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#eee',
    margin: 4,
  },
  tabText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#555',
  },
});

export default Alcoholcategorytab;
