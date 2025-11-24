import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
const StoreMapNavi = ({onPress, style}) => {
  return (
    <Pressable style={[styles.buttonRoute, style]} onPress={onPress}>
      <Feather name="navigation" size={22} color="#16B1a1a1aBFF" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonRoute: {
    position: 'absolute',
    bottom: 140,
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

export default StoreMapNavi;
