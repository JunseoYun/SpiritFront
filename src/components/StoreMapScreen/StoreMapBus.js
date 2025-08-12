import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

const StoreMapBus = ({onPress}) => {
  return (
    <Pressable style={styles.buttonRoute} onPress={onPress}>
      <FontAwesome name="bus" size={30} color="#1a1a1a" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonRoute: {
    position: 'absolute',
    bottom: '30%',
    right: '7%',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});

export default StoreMapBus;
