// CategoryTranslator.js
import React from 'react';
import {View, Text, FlatList, StyleSheet, Pressable, Image} from 'react-native';

// 카테고리 영어 -> 한글 매핑 객체
const categoryMap = {
  IZAKAYA: '이자카야',
  KOREAN: '한식',
  WESTERN: '양식',
  CHINESE: '중식',
  GAMSEONG: '감성주점',
  JOGBO: '족발',
  STEW: '찜, 찌개',
  GRILLED: '구이, 탕',
  CHICKEN: '치킨',
  JEONMAK: '전, 막걸리',
  DRIED: '마른 안주',
  Seafood: '해산물',
  ROOM: '룸',
  GROUP: '단체',
  OUTDOOR: '야장',
  POCHA: '포차',
  HOF: '호프',
  WINE: '와인바',
  COCKTAIL: '칵테일바',
  PUBBAR: '펍바',
};

const MapCategory = ({categories, style}) => {
  const translatedCategories = categories.map(
    category => categoryMap[category] || category,
  );

  return (
    <>
      {translatedCategories.map((category, index) => (
        <Text key={index} style={style}>
          {category}
        </Text>
      ))}
    </>
  );
};

export default MapCategory;
