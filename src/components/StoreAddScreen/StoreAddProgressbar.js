import React, {useEffect, useRef} from 'react';
import {View, Animated, StyleSheet} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';

const StoreAddProgressbar = ({progress}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  // progress prop이 변경될 때마다 애니메이션 실행
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  // 또는 스크린이 포커스를 받을 때 업데이트
  useFocusEffect(
    React.useCallback(() => {
      Animated.timing(animatedValue, {
        toValue: progress,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }, [progress]),
  );

  const widthInterpolated = animatedValue.interpolate({
    inputRange: [0, 1, 2],
    outputRange: ['33%', '66%', '100%'],
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.fill, {width: widthInterpolated}]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 2,
    backgroundColor: '#eee',
    borderRadius: 4,
    marginHorizontal: 18,
    marginTop: 10,
  },
  fill: {
    height: '100%',
    backgroundColor: '#16BBFF',
    borderRadius: 4,
  },
});

export default StoreAddProgressbar;
