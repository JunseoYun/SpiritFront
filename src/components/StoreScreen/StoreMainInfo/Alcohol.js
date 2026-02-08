import React, {useMemo} from 'react';

import {View, Text, StyleSheet} from 'react-native';
import ColorUtil from '../../../utils/ColorUtil';
import CustomText from '../../../utils/CustomText';
import {ALCOHOL_TYPE_SEQUENCE} from '../../../hooks/useTranslateAlcohol';
const Alcohol = ({storeDrinkDtos, translateAlcohol}) => {
  const orderedDrinks = useMemo(() => {
    const drinks = Array.isArray(storeDrinkDtos) ? storeDrinkDtos : [];
    if (drinks.length === 0) return drinks;
    const orderMap = new Map(
      ALCOHOL_TYPE_SEQUENCE.map((type, idx) => [type, idx]),
    );
    return drinks
      .map((drink, idx) => ({
        drink,
        idx,
        order: orderMap.has(drink.type)
          ? orderMap.get(drink.type)
          : Number.MAX_SAFE_INTEGER,
      }))
      .sort((a, b) => {
        if (a.order === b.order) return a.idx - b.idx;
        return a.order - b.order;
      })
      .map(entry => entry.drink);
  }, [storeDrinkDtos]);

  const drinkText =
    orderedDrinks.length > 0
      ? orderedDrinks
          .map(drink => {
            const typeText = translateAlcohol(drink.type);
            // price가 존재하고 0 이상일 때만 가격 표시
            const priceText =
              drink.price && drink.price > 0
                ? ` ${drink.price.toLocaleString()}원`
                : '';
            return `${typeText}${priceText}`;
          })
          .join('   ')
      : null;

  return (
    <View style={styles.timeview}>
      <CustomText style={[styles.timetextnow, {color: ColorUtil.main}]}>
        {drinkText || '대표 주종 미설정'}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  timeview: {
    flexDirection: 'row',
    width: '100%',
    marginHorizontal: 18,
    alignItems: 'center',
    marginVertical: 7,
  },
  timetextnow: {
    fontSize: 15,
    width: '85%',
    fontFamily: 'Pretendard-SemiBold',
  },
  alcoholText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Bold',
  },
});

export default Alcohol;
