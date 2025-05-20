import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, Text, SafeAreaView, BackHandler} from 'react-native';

const NotificationSetScreen = ({navigation}) => {
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <Text>Notification Set Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  innerviewtext: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reservationtext: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingtext: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default NotificationSetScreen;
