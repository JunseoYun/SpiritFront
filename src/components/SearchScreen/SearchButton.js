import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';

const SearchButton = ({onPress, title = '검색'}) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.button}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#16BBFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#16BBFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SearchButton;
