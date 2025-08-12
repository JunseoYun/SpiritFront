import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const StoreMapFoot = ({onPress}) => {
  return (
    <Pressable style={styles.buttonRoute} onPress={onPress}>
      <Ionicons name="footsteps" size={30} color="#16B1a1a1aBFF" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonRoute: {
    position: 'absolute',
    bottom: '20%',
    right: '7%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default StoreMapFoot;
