import React, {useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import MainStack from './src/navigation/MainStack';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import OAuthStack from './src/navigation/OAuthStack';
import {CustomAlertProvider} from './src/context/CustomAlertContext';

const App = () => {
  return (
    <AuthProvider>
      <CustomAlertProvider>
        <AppNavigator />
      </CustomAlertProvider>
    </AuthProvider>
  );
};

const AppNavigator = () => {
  const {token} = useAuth(); // 인증 상태를 가져옴

  return (
    <NavigationContainer>
      {token ? <MainStack /> : <OAuthStack />}
    </NavigationContainer>
  );
};

export default App;
