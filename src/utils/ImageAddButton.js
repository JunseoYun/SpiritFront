import React from 'react';
import {View, Text, Pressable, StyleSheet, Dimensions} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CustomText from './CustomText';

const {width} = Dimensions.get('window');

const ImageAddButton = ({
  currentCount = 0,
  maxCount = 2,
  onPress,
  disabled = false,
}) => {
  return (
    <Pressable
      style={[styles.container, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}>
      <MaterialIcons name="photo-camera" size={32} color="#7B8089" />
      <CustomText style={styles.countText}>
        {currentCount}/{maxCount}
      </CustomText>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100, // 정사각형 비율 (약 80~90px)
    aspectRatio: 1,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#CBCDD2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  disabled: {
    opacity: 0.4,
  },
  countText: {
    marginTop: 6,
    fontSize: 15,
    color: '#7B8089',
    fontFamily: 'Pretendard-Medium',
  },
});

export default ImageAddButton;
