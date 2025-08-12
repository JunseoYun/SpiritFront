import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
const StoreMapLocation = ({onPress}) => {
  return (
    <Pressable style={styles.buttonBottom} onPress={onPress}>
      <Feather name="crosshair" size={30} color="#1a1a1a" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBottom: {
    position: 'absolute',
    bottom: '20%',
    left: '7%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default StoreMapLocation;
