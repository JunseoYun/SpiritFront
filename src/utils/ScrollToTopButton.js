import React, {useEffect, useMemo, useRef} from 'react';
import {Animated, Platform, Pressable, StyleSheet} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

const ScrollToTopButton = ({
  visible,
  onPress,
  bottom = 4,
  right = 18,
  iconColor = '#FFF',
  iconSize = 24,
  hitSlop = {top: 12, bottom: 12, left: 12, right: 12},
  rippleColor = 'rgba(0,0,0,0.08)',
  style,
  buttonStyle,
  iconName = 'chevron-up',
  screen,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useMemo(
    () =>
      opacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0.95, 1],
        extrapolate: 'clamp',
      }),
    [opacity],
  );

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: visible ? 1 : 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
  }, [visible, opacity]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.container,
        {bottom, right, opacity, transform: [{scale}]},
        style,
      ]}>
      <Pressable
        onPress={onPress}
        hitSlop={hitSlop}
        style={[
          styles.button,
          buttonStyle,
          screen === 'StoreMainScreen' && {bottom: 0},
        ]}
        {...(Platform.OS === 'android'
          ? {android_ripple: {color: rippleColor, radius: 24}}
          : {})}>
        <Feather name={iconName} size={iconSize} color={iconColor} />
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 40,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.34)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ScrollToTopButton;
