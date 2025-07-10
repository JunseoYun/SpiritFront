import React, {useEffect, useState, useMemo, useRef} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AlcoholItem from '../../components/StoreAlcoholScreen/AlcoholItem';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';
import Feather from 'react-native-vector-icons/Feather';

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

const StoreAlcoholScreen = ({
  navigation,
  storeId,
  alcohols = [],
  mainDrinks = [],
  onAlcoholDelete,
  isUpdatable,
  onAlcoholUpdateComplete,
  onScrollTo, // 상위에서 scrollTo를 호출할 함수 (scrollToHandler)
  sectionPositions: parentSectionPositions, // 상위에서 관리하는 섹션 위치들
  setSectionPositions: setParentSectionPositions, // 상위에서 섹션 위치 관리 함수
  imagelist = 0,
  ismenuimgModalVisible,
  setMenuingModalVisible,
}) => {
  const [alcoholsState, setAlcoholsState] = useState(alcohols);
  const {height: windowHeight} = Dimensions.get('window');

  const {translateAlcohol} = useTranslateAlcohol();
  const paddingTopValue = windowHeight * 0.7;

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
        <>
          <Pressable
            style={styles.addImageButton}
            onPress={() => setMenuingModalVisible(true)}>
            <Text style={styles.addImageText}> 가격표 이미지 편집</Text>
            <Feather name="chevron-right" size={23} color="#999" />
          </Pressable>
          <Pressable
            style={styles.reorderButton}
            onPress={() =>
              navigation.navigate('AlcoholEditScreen', {
                storeId,
                alcohols,
                onAlcoholUpdateComplete,
                onAlcoholDelete,
              })
            }>
            <Text style={styles.alcoholAddButtonText}>주류 편집</Text>
          </Pressable>
        </>
      )}

      {/* 카테고리 탭 */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabContainer}>
        {Object.keys(groupedAlcohols).map(type => (
          <TouchableOpacity
            key={type}
            style={styles.tabButton}
            onPress={() => {
              const y = parentSectionPositions[type];
              if (onScrollTo && y !== undefined) {
                if (imagelist === 0) {
                  onScrollTo({x: 0, y: y + paddingTopValue, animated: true});
                } else if (imagelist > 0) {
                  onScrollTo({
                    x: 0,
                    y: y + paddingTopValue + 150,
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

      {/* 주류 리스트 */}
      {/* 내부 ScrollView 제거하고 View로 감싸기 */}
      <View style={{flex: 1}}>
        {Object.keys(groupedAlcohols).map(type => (
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
    flex: 1,
    backgroundColor: '#fff',
  },
  reorderButton: {
    marginTop: 20,
    marginHorizontal: 18,
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
  tabContainer: {
    marginLeft: 18,
    marginTop: 30,
    marginBottom: 20,
    backgroundColor: '#fff',
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
});

export default StoreAlcoholScreen;
