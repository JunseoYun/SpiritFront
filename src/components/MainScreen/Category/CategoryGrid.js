import React from 'react';
import {View, Pressable, Image, Text, StyleSheet} from 'react-native';

const CategoryGrid = ({onPress, style}) => {
  return (
    <>
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
                <Image source={source} style={styles.icon} />
              </View>
              <Text style={styles.text}>{text}</Text>
            </Pressable>,
          );
          return acc;
        }, [])
        .map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.categoryRow, style]}>
            {row}
          </View>
        ))}
    </>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    alignItems: 'center',
    marginHorizontal: 8,
  },
  iconWrapper: {
    width: 50,
    height: 50,
    borderRadius: 25, // 완전한 원형
    backgroundColor: '#f5f5f5', // 부드러운 배경색
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3, // Android 그림자
  },
  icon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
  },
  text: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // 간격 고르게 분배
    marginVertical: 15,
  },
});

const categories = [
  {
    source: require('../../../assets/free-icon-barbecue-4039250.png'),
    text: '이자카야',
  },
  {
    source: require('../../../assets/free-icon-soju-5789309.png'),
    text: '한식주점',
  },
  {
    source: require('../../../assets/free-icon-pizza-3595458.png'),
    text: '양식주점',
  },
  {
    source: require('../../../assets/free-icon-dumplings-6560368.png'),
    text: '중화주점',
  },
  {
    source: require('../../../assets/bar-counter_3822705.png'),
    text: '감성주점',
  },
  {
    source: require('../../../assets/free-icon-jokbal-8740559.png'),
    text: '족발 보쌈',
  },
  {
    source: require('../../../assets/free-icon-soup-12404665.png'),
    text: '찜 찌개',
  },
  {
    source: require('../../../assets/free-icon-barbecue-4039250.png'),
    text: '구이 탕',
  },
  {
    source: require('../../../assets/free-icon-roast-chicken-2137000.png'),
    text: '치킨',
  },
  {
    source: require('../../../assets/free-icon-zoom-5460595.png'),
    text: '전체보기',
  },
];

export default CategoryGrid;
