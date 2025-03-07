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

import Ionicons from 'react-native-vector-icons/Ionicons';
const MapSearchBar = ({refresh, setRefresh}) => {
  return (
    <Pressable style={styles.buttonTop} onPress={() => setRefresh(true)}>
      <View style={styles.searchBar}>
        <Ionicons
          style={styles.searchIcon}
          name="reload-outline"
          size={20}
          color={'#228AFA'}
        />
        <Text style={styles.buttonTextTop}>현 위치로 재검색</Text>
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
  },
  searchIcon: {
    marginRight: width * 0.01,
    marginLeft: width * 0.025,
  },
  buttonTextTop: {
    color: '#228AFA',
    fontSize: 16,
    borderRadius: 100,
    width: '100%',
    textAlign: 'left',
    fontWeight: '400',
  },
});

export default MapSearchBar;
