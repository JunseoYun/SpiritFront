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

const Toastmessage = ({
  message,
  isShowToast,
  onDismiss,
  position = 'bottom',
}) => {
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
    bottom: position === 'bottom' ? 40 : undefined,
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
        <Text style={styles.toastText}>{message}</Text>
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
    width: width * 0.7,
    borderRadius: 10,
    left: width * 0.15,
    backgroundColor: 'rgba(81, 80, 80, 0.7)',
    padding: 10,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '400',
  },
});

export default Toastmessage;
