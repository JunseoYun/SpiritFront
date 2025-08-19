import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
const StoreMapLocation = ({onPress}) => {
  return (
    <Pressable style={styles.buttonBottom} onPress={onPress}>
      <Feather name="crosshair" size={22} color="#1a1a1a" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBottom: {
    position: 'absolute',
    bottom: '40%',
    right: '7%',
    width: 42,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
});

export default StoreMapLocation;
