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
const MapSearchBar = ({setcenterrefresh}) => {
  return (
    <Pressable style={styles.buttonTop} onPress={() => setcenterrefresh()}>
      <View style={styles.searchBar}>
        <EvilIcons
          style={styles.searchIcon}
          name="redo"
          size={20}
          color={'#16BBFF'}
        />
        <Text style={styles.buttonTextTop}>현 지도에서 재검색</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonTop: {
    position: 'absolute',
    left: width * 0.3,
    backgroundColor: '#ffffff',
    padding: 7,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    borderRadius: 20,
    width: width * 0.4,
    shadowColor: '#333',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    ...Platform.select({
      ios: {
        top: '9%',
      },
      android: {
        top: '5%',
      },
    }),
  },
  searchBar: {
    width: '100%',
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    marginLeft: width * 0.01,
    marginRight: width * 0.02,
  },
  buttonTextTop: {
    color: '#16BBFF',
    fontSize: 14,
    borderRadius: 100,
    width: '100%',
    textAlign: 'left',
    fontWeight: '400',
  },
});

export default MapSearchBar;
