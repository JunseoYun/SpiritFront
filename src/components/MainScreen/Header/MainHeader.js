import React, {useEffect, useRef} from 'react';
import {Animated, View, Text, StyleSheet, Easing, Platform} from 'react-native';

const MainHeader = () => {
  const mainText = '한잔할까';
  const subText1 = '오늘도 수고한 당신';

  const mainOpacity = useRef(new Animated.Value(0)).current;
  const mainScale = useRef(new Animated.Value(1.2)).current;
  const mainTranslate = useRef(new Animated.ValueXY({x: 0, y: 0})).current;

  const sub1Opacity = useRef(new Animated.Value(0)).current;
  const sub1TranslateY = useRef(new Animated.Value(20)).current;

  const bounceValues = useRef(
    mainText.split('').map(() => new Animated.Value(0)),
  ).current;

  const runBounceTwice = onComplete => {
    const createBounce = () =>
      bounceValues.map((anim, i) =>
        Animated.sequence([
          Animated.delay(i * 50),
          Animated.timing(anim, {
            toValue: -10,
            duration: 220,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 6,
            duration: 220,
            easing: Easing.in(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 200,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]),
      );

    // 첫 번째 바운스
    Animated.parallel(createBounce()).start(() => {
      // 잠깐 대기 후 두 번째 바운스
      setTimeout(() => {
        Animated.parallel(createBounce()).start(() => {
          if (typeof onComplete === 'function') {
            onComplete();
          }
        });
      }, 500); // 0.5초 대기 후 두 번째 바운스
    });
  };

  const runAnimation = () => {
    // Step 1: '한잔할까' 등장
    Animated.sequence([
      Animated.parallel([
        Animated.timing(mainOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(mainScale, {
          toValue: 1.2,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(1500),
    ]).start(() => {
      // Step 2: 축소 + 이동 + sub1 등장
      Animated.parallel([
        Animated.timing(mainScale, {
          toValue: 0.6,
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(mainTranslate, {
          toValue: {x: 65, y: 35},
          duration: 600,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(sub1Opacity, {
          toValue: 1,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.timing(sub1TranslateY, {
          toValue: 0,
          duration: 500,
          delay: 200,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ]).start(() => {
        // Step 3: bounce → sub1 사라짐 → 원위치 → 반복
        runBounceTwice(() => {
          Animated.sequence([
            Animated.delay(2500),
            Animated.timing(sub1Opacity, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.parallel([
              Animated.timing(mainTranslate, {
                toValue: {x: 0, y: 0},
                duration: 500,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
              }),
              Animated.timing(mainScale, {
                toValue: 1.2,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.inOut(Easing.ease),
              }),
            ]),
            Animated.delay(200),
          ]).start(() => {
            // Reset & repeat
            mainScale.setValue(1.2);
            mainTranslate.setValue({x: 0, y: 0});
            sub1TranslateY.setValue(20);
            runAnimation();
          });
        });
      });
    });
  };

  useEffect(() => {
    runAnimation();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          opacity: mainOpacity,
        }}>
        <Animated.View
          style={{
            flexDirection: 'row',
            transform: [
              {scale: mainScale},
              {translateX: mainTranslate.x},
              {translateY: mainTranslate.y},
            ],
          }}>
          {mainText.split('').map((char, i) => (
            <Animated.Text
              key={i}
              style={[
                styles.mainText,
                {
                  transform: [{translateY: bounceValues[i]}],
                },
              ]}>
              {char}
            </Animated.Text>
          ))}
        </Animated.View>
      </Animated.View>

      <Animated.Text
        style={[
          styles.subText,
          {
            opacity: sub1Opacity,
            transform: [{translateY: sub1TranslateY}],
          },
        ]}>
        {subText1}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainText: {
    fontSize: 30,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
    color: '#fff',
  },
  subText: {
    fontSize: 20,
    fontFamily: 'Pretendard-Semibold',
    color: '#fff',
    position: 'absolute',
    bottom: 16,
    textAlign: 'center',
  },
});

export default MainHeader;
