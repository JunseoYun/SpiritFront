import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, View, Text, StyleSheet, Easing} from 'react-native';
import FastImage from 'react-native-fast-image';

const IMAGES = {
  han: require('../../../assets/AppLogo/han.png'),
  jan: require('../../../assets/AppLogo/jan.png'),
  hal: require('../../../assets/AppLogo/hal.png'),
  ga: require('../../../assets/AppLogo/ga.png'),
};

const mainLetters = ['han', 'jan', 'hal', 'ga'];

const MainHeader = () => {
  const subText1 = '오늘도 수고한 당신';

  const [ready, setReady] = useState(false);
  const loadedSet = useRef(new Set());

  // Animated values (recreated only once)
  const mainOpacity = useMemo(() => new Animated.Value(0), []);
  const mainScale = useMemo(() => new Animated.Value(1.2), []);
  const mainTranslate = useMemo(() => new Animated.ValueXY({x: 0, y: 0}), []);

  const sub1Opacity = useMemo(() => new Animated.Value(0), []);
  const sub1TranslateY = useMemo(() => new Animated.Value(20), []);

  const bounceValues = useMemo(
    () => mainLetters.map(() => new Animated.Value(0)),
    [],
  );

  const mountedRef = useRef(true);
  const timersRef = useRef([]);
  const runningAnimsRef = useRef([]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      runningAnimsRef.current.forEach(a => a.stop && a.stop());
      timersRef.current.forEach(t => clearTimeout(t));
      timersRef.current = [];
      runningAnimsRef.current = [];
    };
  }, []);

  const onImgLoaded = key => {
    if (!mountedRef.current) return;
    if (loadedSet.current.has(key)) return;
    loadedSet.current.add(key);
    if (loadedSet.current.size === mainLetters.length) {
      setReady(true);
    }
  };

  const makeLetterBounce = i =>
    Animated.sequence([
      Animated.timing(bounceValues[i], {
        toValue: -10,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(bounceValues[i], {
        toValue: 6,
        duration: 220,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(bounceValues[i], {
        toValue: 0,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]);

  const runBounceTwice = onComplete => {
    const stagger = Animated.stagger(
      70,
      mainLetters.map((_, i) => makeLetterBounce(i)),
    );
    const loop = Animated.loop(stagger, {iterations: 2});
    runningAnimsRef.current.push(loop);
    loop.start(({finished}) => {
      if (finished && mountedRef.current && typeof onComplete === 'function') {
        onComplete();
      }
    });
  };

  const runAnimation = () => {
    const step1 = Animated.parallel([
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
    ]);

    const step1Delay = Animated.delay(1500);

    const step2 = Animated.parallel([
      Animated.timing(mainScale, {
        toValue: 0.6,
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(mainTranslate, {
        toValue: {x: 65, y: 35},
        duration: 600,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
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
    ]);

    const seq = Animated.sequence([step1, step1Delay, step2]);
    runningAnimsRef.current.push(seq);

    seq.start(({finished}) => {
      if (!finished || !mountedRef.current) return;

      runBounceTwice(() => {
        const tail = Animated.sequence([
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
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
            Animated.timing(mainScale, {
              toValue: 1.2,
              duration: 500,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: true,
            }),
          ]),
          Animated.delay(200),
        ]);
        runningAnimsRef.current.push(tail);

        tail.start(({finished: fin2}) => {
          if (!fin2 || !mountedRef.current) return;
          mainScale.setValue(1.2);
          mainTranslate.setValue({x: 0, y: 0});
          sub1TranslateY.setValue(20);

          const id = setTimeout(() => {
            if (mountedRef.current) runAnimation();
          }, 50);
          timersRef.current.push(id);
        });
      });
    });
  };

  useEffect(() => {
    if (ready) runAnimation();
  }, [ready]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mainWrap, {opacity: mainOpacity}]}>
        <Animated.View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            transform: [
              {scale: mainScale},
              {translateX: mainTranslate.x},
              {translateY: mainTranslate.y},
            ],
          }}>
          {mainLetters.map((key, i) => (
            <Animated.View
              key={key}
              style={{
                transform: [{translateY: bounceValues[i]}],
                marginHorizontal: 0.5, // 사진 간격 살짝 좁힘
              }}>
              <FastImage
                source={IMAGES[key]}
                style={styles.glyph}
                resizeMode={FastImage.resizeMode.contain}
                onLoad={() => onImgLoaded(key)}
              />
            </Animated.View>
          ))}
        </Animated.View>
      </Animated.View>

      <Animated.Text
        style={[
          styles.subText,
          {opacity: sub1Opacity, transform: [{translateY: sub1TranslateY}]},
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
  mainWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  glyph: {
    width: 32,
    height: 32,
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
