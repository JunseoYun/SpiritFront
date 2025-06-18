import React, {useEffect, useState, useMemo} from 'react';
import {SafeAreaView, StyleSheet, Text, View} from 'react-native';
import AlcoholHeader from '../../components/StoreAlcoholScreen/AlcoholHeader';
import AlcoholItem from '../../components/StoreAlcoholScreen/AlcoholItem';
import {StoreDrinkdelete} from '../../api/drinkApi';
import useCustomAlert from '../../hooks/useCustomAlert';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import {Portal} from 'react-native-paper';

const alcoholMapping = {
  SOJU: '소주',
  BEER: '맥주',
  MAKGEOLLI: '막걸리',
  WINE: '와인',
  COCKTAIL: '칵테일',
  SAKE: '사케',
  KAOLIANG: '고량주',
  WHISKEY: '위스키',
  VODKA: '보드카',
  GIN: '진',
  HIGHBALL: '하이볼',
  TEQUILA: '데킬라',
};

const StoreAlcoholScreen = ({
  navigation,
  storeId,
  alcohols = [],
  mainDrinks = [],
  scrollViewRef,
  onAlcoholDelete,
  isUpdatable,
}) => {
  const [openItemId, setOpenItemId] = useState(null);
  const [alcoholsState, setAlcoholsState] = useState(alcohols);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {translateAlcohol} = useTranslateAlcohol();
  // ✅ `mainDrinks` 타입을 먼저 보여주도록 정렬 수정

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

  const handleOpenItem = id => {
    setOpenItemId(id);
  };

  const handleCloseAll = () => {
    setOpenItemId(null);
  };

  const handleDeleteAlcohol = (id, name) => {
    handleCloseAll();
    showAlert({
      title: `${name} 삭제`,
      message: `주류를 삭제하시겠습니까?`,
      onConfirm: async () => {
        try {
          await StoreDrinkdelete(id);
          onAlcoholDelete(id);
        } catch (error) {}
      },
      onCancel: null,
      type: 'delete',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {isUpdatable === true && (
        <AlcoholHeader storeId={storeId} navigation={navigation} />
      )}

      {Object.keys(groupedAlcohols).map(type => (
        <View key={type}>
          <Text style={styles.typeLabel}>{type}</Text>
          {groupedAlcohols[type].map(alcohol => (
            <AlcoholItem
              key={alcohol.id}
              alcohol={alcohol}
              storeId={storeId}
              navigation={navigation}
              isOpen={openItemId === alcohol.id}
              onOpen={() => handleOpenItem(alcohol.id)}
              onClose={handleCloseAll}
              onDelete={() => handleDeleteAlcohol(alcohol.id, alcohol.name)}
              scrollViewRef={scrollViewRef}
              isUpdatable={isUpdatable}
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
      <Portal>
        <AlertComponent />
      </Portal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  typeLabel: {
    fontSize: 20,
    color: '#999',
    marginLeft: 18,
    fontWeight: 'bold',
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
