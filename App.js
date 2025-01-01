import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './src/navigation/MainStack';
import OAuthTestScreen from './src/screens/User/Login/OAuthTestScreen';
import { AuthProvider, useAuth } from './src/context/AuthContext';

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
      {token ? <MainStack /> : <OAuthTestScreen />}
    </NavigationContainer>
  );
};

export default App;
