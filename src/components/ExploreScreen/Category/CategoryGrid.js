import React from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import CustomText from '../../../utils/CustomText';

const CategoryGrid = ({onPress, style}) => {
  return (
    <>
      <View style={styles.contanier}>
        {categories
          .reduce((acc, {emoji, text}, index) => {
            const rowIndex = Math.floor(index / 5);
            if (!acc[rowIndex]) acc[rowIndex] = [];
            acc[rowIndex].push(
              <Pressable
                key={text}
                onPress={() => onPress(index)}
                style={styles.categoryItem}>
                <View style={styles.iconWrapper}>
                  <CustomText maxScale={1} style={styles.icon}>
                    {emoji}
                  </CustomText>
                </View>
                <CustomText maxScale={1} style={styles.text}>
                  {text}
                </CustomText>
              </Pressable>,
            );
            return acc;
          }, [])
          .map((row, rowIndex) => (
            <View key={rowIndex} style={[styles.categoryRow, style]}>
              {row}
            </View>
          ))}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  contanier: {
    paddingHorizontal: 8,
  },
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: '#F4F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  text: {
    fontSize: 11.5,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Pretendard-SemiBold',
    marginHorizontal: 2,
    marginTop: 7,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // 간격 고르게 분배
    marginVertical: 10,
  },
});

const categories = [
  {
    emoji: '🏮',
    text: '이자카야',
  },
  {
    emoji: '🍲',
    text: '한식',
  },
  {
    emoji: '🍕',
    text: '양식',
  },
  {
    emoji: '🥟',
    text: '중식',
  },
  {
    emoji: '🍢',
    text: '포장마차',
  },
  {
    emoji: '🎵',
    text: '감성주점',
  },

  {
    emoji: '🥩',
    text: '구이·찜',
  },
  {
    emoji: '🍺',
    text: '치킨·호프',
  },
  {
    emoji: '🦞',
    text: '회·해산물',
  },
  {
    emoji: '🍸',
    text: '펍·바',
  },
];

export default CategoryGrid;
