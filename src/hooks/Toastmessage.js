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

const Toastmessage = ({message, isShowToast, onDismiss}) => {
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
          onDismiss(); // `isShowToast` 상태를 false로 변경하는 함수 호출
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isShowToast]);

  if (!isShowToast) return null;

  return (
    <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
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
    bottom: 40,
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
