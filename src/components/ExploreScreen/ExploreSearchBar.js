import React from 'react';
import {Pressable, View, Text, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
import CustomText from '../../utils/CustomText';

const ExploreSearchBar = ({handleSearchPress}) => {
  return (
    <Pressable
      hitSlop={10}
      onPress={() => handleSearchPress()}
      style={styles.searchBar}>
      <View style={styles.searchContent}>
        <Feather name="search" size={18} color="#7E8081" />
        <CustomText maxScale={1.0} style={styles.searchText}>
          원하는 술집이나 메뉴를 검색하세요
        </CustomText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flex: 1,
    height: 38,
    backgroundColor: '#FFF',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#3cbbff',
    justifyContent: 'center',
  },
  searchContent: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  searchText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#7E8081',
    marginLeft: 10,
  },
});

export default ExploreSearchBar;
