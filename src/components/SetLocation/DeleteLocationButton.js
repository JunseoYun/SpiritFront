import React from 'react';
import {Pressable, StyleSheet} from 'react-native';
import CustomText from '../../utils/CustomText';

const DeleteLocationButton = ({onPress}) => {
  return (
    <Pressable onPress={onPress} style={styles.deleteButton}>
      <CustomText style={styles.deleteButtonText}>위치 설정 초기화</CustomText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  deleteButton: {
    marginTop: 28,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
});

export default DeleteLocationButton;
