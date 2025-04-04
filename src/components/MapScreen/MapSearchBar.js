// SearchButton.js
import React from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
} from 'react-native';

const {width} = Dimensions.get('window');

import EvilIcons from 'react-native-vector-icons/EvilIcons';
const MapSearchBar = ({onPress}) => {
  return (
    <View style={styles.buttonTop}>
      <Pressable style={styles.searchView} onPress={onPress}>
        <EvilIcons name="redo" size={25} color={'#16BBFF'} />
        <Text style={styles.buttonTextTop}>현 지도에서 재검색</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonTop: {
    position: 'absolute',
    alignSelf: 'center', // 부모 뷰를 기준으로 가로 중앙 정렬
    ...Platform.select({
      ios: {
        top: '9%',
      },
      android: {
        top: '5%',
      },
    }),
  },
  searchView: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingLeft: 5,
    paddingRight: 9,
    borderRadius: 20,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 10,
  },
  buttonTextTop: {
    color: '#16BBFF',
    fontSize: 15,
    fontWeight: '400',
  },
});

export default MapSearchBar;
