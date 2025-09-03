import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import FontAwesome from 'react-native-vector-icons/FontAwesome';

const StoreMapBus = ({onPress}) => {
  return (
    <Pressable style={styles.buttonRoute} onPress={onPress}>
      <FontAwesome name="bus" size={22} color="#1a1a1a" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonRoute: {
    position: 'absolute',
    bottom: '20%',
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

export default StoreMapBus;
