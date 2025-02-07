import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';

const MySplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require('../assets/logoWhite.png')} style={styles.logo} />
      <Text style={styles.text}>TEAM SPIRIT</Text>
    </View>
  );
};

export default MySplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 200, // 원하는 크기로 설정
    height: 200,
    resizeMode: 'contain',
  },
  text: {
    position: 'absolute',
    bottom: 70,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'serif',

    color: '#333',
  },
});
