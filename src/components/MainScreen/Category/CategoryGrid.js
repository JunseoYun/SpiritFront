import React from 'react';
import {View, Pressable, Image, Text, StyleSheet} from 'react-native';
import CustomText from '../../../utils/CustomText';
import FastImage from 'react-native-fast-image';

const CategoryGrid = ({onPress, style}) => {
  return (
    <>
      <View style={styles.contanier}>
        {categories
          .reduce((acc, {source, text}, index) => {
            const rowIndex = Math.floor(index / 5);
            if (!acc[rowIndex]) acc[rowIndex] = [];
            acc[rowIndex].push(
              <Pressable
                key={text}
                onPress={() => onPress(index)}
                style={styles.categoryItem}>
                <View style={styles.iconWrapper}>
                  <FastImage source={source} style={styles.icon} />
                </View>
                <CustomText style={styles.text}>{text}</CustomText>
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
    borderRadius: 17, // 완전한 원형

    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  text: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'Pretendard-Medium',
    marginHorizontal: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // 간격 고르게 분배
    marginVertical: 10,
  },
});

const categories = [
  {
    source: require('../../../assets/category/Izakaya2.png'),
    text: '이자카야',
  },
  {
    source: require('../../../assets/category/Koreafood2.png'),
    text: '한식',
  },
  {
    source: require('../../../assets/category/Westernfood2.png'),
    text: '양식',
  },
  {
    source: require('../../../assets/category/Chinesefood2.png'),
    text: '중식',
  },
  {
    source: require('../../../assets/category/Pocha2.png'),
    text: '포장마차',
  },
  {
    source: require('../../../assets/category/Emotional2.png'),
    text: '감성주점',
  },

  {
    source: require('../../../assets/category/Grilled2.png'),
    text: '구이·찜',
  },
  {
    source: require('../../../assets/category/Hope2.png'),
    text: '치킨·호프',
  },
  {
    source: require('../../../assets/category/Seafood2.png'),
    text: '회·해산물',
  },
  {
    source: require('../../../assets/category/Pupbar2.png'),
    text: '펍·바',
  },
];

export default CategoryGrid;
