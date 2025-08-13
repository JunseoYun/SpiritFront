import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';

const SkeletonBox = ({style}) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [opacity]);

  return <Animated.View style={[styles.skeleton, style, {opacity}]} />;
};

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#eee',
    borderRadius: 4,
  },
});

export default SkeletonBox;
