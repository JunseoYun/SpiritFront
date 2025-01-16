import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './src/navigation/MainStack';
import OAuthLoginScreen from './src/screens/User/Login/OAuthLoginScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import OAuthStack from './src/navigation/OAuthStack';

const App = () => {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
};

const AppNavigator = () => {
  const { token } = useAuth(); // 인증 상태를 가져옴

  return (
    <NavigationContainer>
      {token ? <MainStack /> : <OAuthStack />}
    </NavigationContainer>
  );
};

export default App;
