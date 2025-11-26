import React from 'react';
import {Pressable, View, Text, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import CustomText from '../../utils/CustomText';

const MainSearchBar = ({handleSearchPress}) => {
  return (
    <Pressable
      hitSlop={15}
      onPress={() => handleSearchPress()}
      style={styles.searchBar}>
      <View style={styles.searchContent}>
        <CustomText style={styles.searchText}>
          술집이나 메뉴를 검색하세요
        </CustomText>
        <Feather name="search" size={18} color="#333" />
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    height: 42,
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginTop: 7,
    marginBottom: 16,
    justifyContent: 'center',
  },
  searchContent: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 15,
    color: '#7E8081',
  },
});

export default MainSearchBar;
