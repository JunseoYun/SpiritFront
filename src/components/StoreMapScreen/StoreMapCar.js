import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const StoreMapCar = ({onPress}) => {
  return (
    <Pressable style={styles.buttonRoute} onPress={onPress}>
      <Ionicons name="car" size={30} color="#16BBFF" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonRoute: {
    position: 'absolute',
    bottom: '40%',
    right: '7%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(22, 187, 255, 0.2)',
  },
});

export default StoreMapCar;
