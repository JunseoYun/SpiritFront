import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import Feather from 'react-native-vector-icons/Feather';
const StoreMapNavi = ({onPress, style}) => {
  return (
    <Pressable style={[styles.button, style]} onPress={onPress}>
      <Feather
        name="navigation"
        size={18}
        color="#2563EB"
        style={styles.icon}
      />
      <Text style={styles.label}>길찾기</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 140,
    right: '7%',
    flexDirection: 'row',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
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

export default StoreMapNavi;
