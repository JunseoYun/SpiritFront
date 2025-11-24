import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
const StoreMapLocation = ({onPress, style}) => (
  <Pressable style={[styles.button, style]} onPress={onPress}>
    <Feather name="crosshair" size={18} color="#0A7CC1" style={styles.icon} />
    <Text style={styles.label}>내 위치</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E3E8EF',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  label: {
    fontSize: 13,
    fontFamily: 'Pretendard-SemiBold',
    color: '#0F172A',
  },
  icon: {
    marginRight: 6,
  },
});

export default StoreMapLocation;
