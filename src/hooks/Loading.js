import React, {useEffect, useRef, useState} from 'react';
import {View, Animated, StyleSheet} from 'react-native';

const Loading = ({loading}) => {
  const numberOfDots = 4;
  const dotRefs = useRef([]);
  const intervalRef = useRef(null);
  const [currentDot, setCurrentDot] = useState(0);

  // ⏳ 점 보이기 딜레이용
  const [showDots, setShowDots] = useState(false);
  const delayTimer = useRef(null);

  // 점 색상
  const dotColors = ['#80D2F4', '#8DC2DA', '#A9CBD9', '#ABE3FA'];

  useEffect(() => {
    if (dotRefs.current.length === 0) {
      for (let i = 0; i < numberOfDots; i++) {
        dotRefs.current.push(new Animated.Value(0));
      }
    }
  }, []);

  useEffect(() => {
    if (loading) {
      // ⏳ 점을 0.5초 후에만 보이게
      delayTimer.current = setTimeout(() => setShowDots(true), 500);

      intervalRef.current = setInterval(() => {
        setCurrentDot(prev => (prev + 1) % numberOfDots);
      }, 300);
    } else {
      setShowDots(false);
      if (delayTimer.current) clearTimeout(delayTimer.current);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (delayTimer.current) clearTimeout(delayTimer.current);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [loading]);

  useEffect(() => {
    dotRefs.current.forEach((dot, index) => {
      Animated.timing(dot, {
        toValue: index === currentDot ? -10 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [currentDot]);

  if (!loading) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        {/* ⏳ showDots가 true일 때만 렌더 */}
        {showDots &&
          dotRefs.current.map((dot, idx) => (
            <Animated.Text
              key={idx}
              allowFontScaling={false}
              style={[
                styles.dot,
                {transform: [{translateY: dot}], color: dotColors[idx]},
              ]}>
              ●
            </Animated.Text>
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    fontSize: 10,
    marginHorizontal: 4,
  },
});

export default Loading;
