import React, {useState, useEffect, useRef} from 'react';
import {
  Text,
  View,
  Animated,
  StyleSheet,
  Dimensions,
  Pressable,
} from 'react-native';

const {width} = Dimensions.get('window');
import useSafeAndroidInsets from './useSafeAndroidInsets';
import CustomText from '../utils/CustomText';
const Toastmessage = ({
  message,
  isShowToast,
  onDismiss,
  position = 'bottom',
}) => {
  const {bottom} = useSafeAndroidInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isShowToast) {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }).start(() => {
          onDismiss();
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isShowToast]);

  if (!isShowToast) return null;

  const positionStyle = {
    bottom: position === 'bottom' ? 100 + bottom : undefined,
    top:
      position === 'top'
        ? 40
        : position === 'center'
        ? Dimensions.get('window').height / 2 - 40
        : undefined,
  };

  return (
    <Animated.View
      style={[styles.container, positionStyle, {opacity: fadeAnim}]}>
      <Pressable onPress={onDismiss}>
        <CustomText style={styles.toastText}>{message}</CustomText>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 1000000,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 10,
    alignSelf: 'center',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Pretendard-Regular',
    paddingHorizontal: 7,
  },
});

export default Toastmessage;
