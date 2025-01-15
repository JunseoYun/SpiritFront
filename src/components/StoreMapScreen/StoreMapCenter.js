// SearchButton.js
import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
const StoreMapCenter = ({onPress}) => {
  return (
    <Pressable style={styles.buttonBottom} onPress={onPress}>
      <Feather name="home" size={30} color="#16BBFF" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBottom: {
    position: 'absolute',
    bottom: '20%',
    left: '23%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(22, 187, 255, 0.2)',
  },
});

export default StoreMapCenter;
