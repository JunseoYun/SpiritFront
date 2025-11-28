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

const MainHeader = ({address}) => {
  return <View style={styles.container}></View>;
};

const styles = StyleSheet.create({
  container: {
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
