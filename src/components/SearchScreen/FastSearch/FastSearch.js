import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import FastSearchItem from './FastSearchItem';

const FastSearch = ({title, searchOptions}) => {
  return (
    <View
      style={[
        title === '' && styles.fastcontainer,
        title === '내 주변 빠른 검색' && styles.container, // 선택된 카테고리에 스타일 적용
      ]}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.fastContainer}>
        {searchOptions.map((option, index) => (
          <FastSearchItem
            key={index}
            label={option.label}
            isSelected={option.isSelected}
            onPress={option.onPress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 25,
    width: '90%',
    alignSelf: 'center',
  },
  fastcontainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    width: '90%',
    marginBottom: 5,
  },
  title: {
    color: '#16BBFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
  fastContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    alignSelf: 'center', // 중앙 정렬
  },
});

export default FastSearch;
