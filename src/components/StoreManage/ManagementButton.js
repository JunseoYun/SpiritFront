import React from 'react';
import {Pressable, StyleSheet, View, Text, Share} from 'react-native';
const ManagementButton = ({onPress = null, title = null}) => {
  return (
    <Pressable style={styles.managementContainer} onPress={onPress}>
      <Text style={styles.managementText}>{title} 관리</Text>
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
