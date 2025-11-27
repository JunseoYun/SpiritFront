import React from 'react';

import {View, Text, StyleSheet} from 'react-native';
import ColorUtil from '../../../utils/ColorUtil';
import CustomText from '../../../utils/CustomText';
const Alcohol = ({storeDrinkDtos, translateAlcohol}) => {
  const drinkText =
    storeDrinkDtos && storeDrinkDtos.length > 0
      ? storeDrinkDtos
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
