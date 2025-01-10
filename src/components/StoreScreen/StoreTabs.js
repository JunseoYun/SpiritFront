import React from 'react';
import {View, Text, ImageBackground, Pressable, StyleSheet} from 'react-native';

const StoreTabs = ({
  changePage,
  latitude,
  longitude,
  innerlatitude,
  innerlongitude,
  navigation,
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
      onPress={() =>
        navigation.navigate('StoreStack', {
          screen: 'StoreMapScreen',
          params: {
            storeLatitude: latitude,
            storeLongitude: longitude,
            innerlatitude,
            innerlongitude,
          },
        })
      }>
      <Text style={styles.StoreButtonText}>길찾기</Text>
    </Pressable>
  </View>
);

const styles = StyleSheet.create({
});

export default StoreTabs;
