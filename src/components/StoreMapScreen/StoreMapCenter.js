import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
const StoreMapCenter = ({onPress, style}) => {
  return (
    <Pressable style={[styles.buttonBottom, style]} onPress={onPress}>
      <Ionicons name="storefront-outline" size={22} color="#1a1a1a" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonBottom: {
    position: 'absolute',
    bottom: 140,
    left: '7%',
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

export default StoreMapCenter;
