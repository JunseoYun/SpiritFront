import React from 'react';

import {NavigationContainer} from '@react-navigation/native';

import MainStack from './src/navigation/MainStack';
import KakaoSDK from '@react-native-seoul/kakao-login';

const App = () => {
  console.log(KakaoSDK);
  return (
    <NavigationContainer>
      <MainStack/>
    </NavigationContainer>
  );
};

export default App;