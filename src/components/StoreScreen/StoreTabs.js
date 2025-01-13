import React from 'react';
import {View, Text, ImageBackground, Pressable, StyleSheet} from 'react-native';

const StoreTabs = ({
  changePage
}) => (
  <View style={styles.Storeinnercategory}>
    <Pressable
      style={styles.StoreButton}
      onPress={() => changePage('StoreMenuScreen')}>
      <Text style={styles.StoreButtonText}>메뉴</Text>
    </Pressable>
    <Pressable
      style={styles.StoreButton}
      onPress={() => changePage('StoreReviewScreen')}>
      <Text style={styles.StoreButtonText}>리뷰</Text>
    </Pressable>
    <Pressable
      style={styles.StoreButton}
      onPress={() => changePage('StoreMapScreen')}>
      <Text style={styles.StoreButtonText}>길찾기</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
  Storeinnercategory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff'
  },
  StoreButton: {
    flex: 1,
    paddingHorizontal: 45,
    paddingTop: 10,
    paddingVertical: 10,
  },
  StoreButtonText: {
    fontSize: 15,
    color: 'black',
    fontWeight: '400',
  },
});

export default StoreTabs;
