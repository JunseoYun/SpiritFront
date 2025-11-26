import React from 'react';
import {Pressable, StyleSheet, Text} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../utils/CustomText';
const StoreMapCenter = ({onPress, style}) => (
  <Pressable style={[styles.button, style]} onPress={onPress}>
    <Ionicons
      name="storefront-outline"
      size={18}
      color="#F97316"
      style={styles.icon}
    />
    <CustomText style={styles.label}>매장 위치</CustomText>
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

export default StoreMapCenter;
