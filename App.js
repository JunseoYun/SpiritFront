import React, {useEffect} from 'react';

import {NavigationContainer} from '@react-navigation/native';

import MainStack from './src/navigation/MainStack';


const App = () => {
  return (
    <NavigationContainer>
      <MainStack/>
    </NavigationContainer>
  );
};

export default App;