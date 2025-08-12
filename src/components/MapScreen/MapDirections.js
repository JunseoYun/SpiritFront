import React from 'react';
import {Pressable, StyleSheet} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';

const MapDirections = ({onPress}) => {
  return (
    <Pressable style={styles.buttonRoute} onPress={onPress}>
      <Ionicons name="location-outline" size={30} color="#1a1a1a" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  buttonRoute: {
    width: 50,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
  },
});

export default MapDirections;
