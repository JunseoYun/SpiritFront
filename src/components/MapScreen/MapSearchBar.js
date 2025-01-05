// SearchButton.js
import React from 'react';
import {Pressable, View, Text, StyleSheet} from 'react-native';

import EvilIcons from 'react-native-vector-icons/EvilIcons';
const MapSearchBar = ({onPress, buttonText}) => {
  return (
    <Pressable style={styles.buttonTop} onPress={onPress}>
      <View style={styles.searchBar}>
        <EvilIcons
          //   style={styles.searchIcon}
          name="search"
          size={27}
          color={'gray'}
        />
        <Text style={styles.buttonTextTop}>{buttonText}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonTop: {
    position: 'absolute',
    top: '9%',
    left: '5%',
    backgroundColor: '#ffffff',
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    width: '90%',
    height: 50,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#ccc',

    // 그라디언트 효과 (배경이 단일 색상이 아닌 경우)
    backgroundColor: '#fdfdfd',
  },
  searchBar: {
    width: '100%',
    flexDirection: 'row',
    alignSelf: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  buttonTextTop: {
    color: 'gray',
    fontSize: 16,
    borderRadius: 100,
    width: '100%',
    left: '3%',
    textAlign: 'left',
    marginLeft: 5,
  },
});

export default MapSearchBar;
