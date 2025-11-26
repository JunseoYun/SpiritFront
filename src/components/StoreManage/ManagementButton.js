import React from 'react';
import {Pressable, StyleSheet, View, Text, Share} from 'react-native';
import CustomText from '../../utils/CustomText';
const ManagementButton = ({onPress = null, title = null}) => {
  return (
    <Pressable style={styles.managementContainer} onPress={onPress}>
      <CustomText style={styles.managementText}>{title}</CustomText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  managementContainer: {
    backgroundColor: '#F1F2F3',
    padding: 12,
    marginHorizontal: 18,
    borderRadius: 9,
    alignItems: 'center',
  },
  managementText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },
});

export default ManagementButton;
