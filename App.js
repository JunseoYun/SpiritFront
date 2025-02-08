import React, {useEffect, useState} from 'react';
import {Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import MainStack from './src/navigation/MainStack';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import OAuthStack from './src/navigation/OAuthStack';
import {CustomAlertProvider} from './src/context/CustomAlertContext';
import {Provider as PaperProvider} from 'react-native-paper';

import SplashScreen from 'react-native-splash-screen';
import MySplashScreen from './src/screens/MySplashScreen';
import './reanimatedConfig';

if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

const App = () => {
  useEffect(() => {
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        SplashScreen.hide();
      }, 500); // 0.5초 후에 숨김
    }
  }, []);
  return (
    <PaperProvider>
      <AuthProvider>
        <CustomAlertProvider>
          <AppNavigator />
        </CustomAlertProvider>
      </AuthProvider>
    </PaperProvider>
  );
};

const AppNavigator = () => {
  const {token} = useAuth(); // 인증 상태를 가져옴
  const [loading, setLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    // 2초 후 로딩 완료 (실제로는 API 호출 후 처리)
    setTimeout(() => {
      setLoading(false);
    }, 2500);
  }, []);

  // 로딩 중이면 스플래시 화면 표시
  if (loading) {
    return <MySplashScreen />;
  }
  return (
    <NavigationContainer>
      {token ? <MainStack /> : <OAuthStack />}
    </NavigationContainer>
  );
};

export default App;
