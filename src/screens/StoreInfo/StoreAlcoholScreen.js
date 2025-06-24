import React, {useEffect, useState, useMemo} from 'react';
import {SafeAreaView, StyleSheet, Text, View, Pressable} from 'react-native';
import AlcoholItem from '../../components/StoreAlcoholScreen/AlcoholItem';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';

const alcoholMapping = {
  SOJU: '소주',
  BEER: '맥주',
  MAKGEOLLI: '막걸리',
  HIGHBALL: '하이볼',
  WINE: '와인',
  COCKTAIL: '칵테일',
  SAKE: '사케',
  KAOLIANG: '고량주',
  WHISKEY: '위스키',
  VODKA: '보드카',
  GIN: '진',
  TEQUILA: '데킬라',
};

const StoreAlcoholScreen = ({
  navigation,
  storeId,
  alcohols = [],
  mainDrinks = [],
  onAlcoholDelete,
  isUpdatable,
  onAlcoholUpdateComplete,
}) => {
  const [alcoholsState, setAlcoholsState] = useState(alcohols);

  const {translateAlcohol} = useTranslateAlcohol();

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
    <SafeAreaView style={styles.container}>
      {isUpdatable && (
        <Pressable
          style={styles.reorderButton}
          onPress={() =>
            navigation.navigate('AlcoholEditScreen', {
              storeId,
              alcohols,
              onAlcoholUpdateComplete, // ✅ 메뉴 다시 불러오는 콜백 전달
              onAlcoholDelete,
            })
          }>
          <Text style={styles.alcoholAddButtonText}>주류 편집</Text>
        </Pressable>
      )}

      {Object.keys(groupedAlcohols).map(type => (
        <View key={type}>
          <Text style={styles.typeLabel}>{type}</Text>
          {groupedAlcohols[type].map(alcohol => (
            <AlcoholItem key={alcohol.id} alcohol={alcohol} storeId={storeId} />
          ))}
          <View style={styles.line} />
        </View>
      ))}
      {alcohols?.length === 0 && (
        <View style={styles.footer}>
          <Text style={styles.emptyText}>등록된 주류가 없어요</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  reorderButton: {
    marginTop: 30,
    marginBottom: 20,
    marginHorizontal: 18,
    marginTop: 20,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#E9F5FB',
  },
  alcoholAddButtonText: {
    color: '#45C9FF',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    padding: 16,
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
    fontFamily: 'Pretendard-Medium', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#c0c0c0',
  },
});

export default StoreAlcoholScreen;
