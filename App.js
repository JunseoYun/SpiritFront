import React, {useEffect, useState} from 'react';
import {Linking, Platform, PermissionsAndroid} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import MainStack from './src/navigation/MainStack';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import OAuthStack from './src/navigation/OAuthStack';
import {CustomAlertProvider} from './src/context/CustomAlertContext';
import {Provider as PaperProvider} from 'react-native-paper';
import {ToastProvider} from './src/context/ToastContext';
import SplashScreen from 'react-native-splash-screen';
import MySplashScreen from './src/screens/MySplashScreen';
import {iniBasictNotification} from './src/hooks/notification/useNotificationPermission';
import {useNotificationSetup} from './src/hooks/notification/useNotificationSetup';
import {useNotificationClickHandler} from './src/hooks/notification/useNotificationClickHandler';
import {navigationRef} from './src/navigation/NavigationService';
import {NotificationProvider} from './src/context/NotificationContext';
import {useNotification} from './src/context/NotificationContext';
import useHandlePendingNotification from './src/hooks/notification/useHandlePendingNotification';
import './reanimatedConfig';
import {Versioncheck} from './src/api/versioncheckApi';

if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

const App = () => {
  useNotificationSetup();
  // useNotificationClickHandler();

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
          <ToastProvider>
            <NotificationProvider>
              <AppNavigator />
            </NotificationProvider>
          </ToastProvider>
        </CustomAlertProvider>
      </AuthProvider>
    </PaperProvider>
  );
};

const AppNavigator = () => {
  const {token} = useAuth(); // 인증 상태를 가져옴

  const [loading, setLoading] = useState(true); // 로딩 상태 추가
  const {pendingNotification, setPendingNotification} = useNotification();

  useNotificationClickHandler();
  useHandlePendingNotification(loading, pendingNotification, () =>
    setPendingNotification(null),
  );

  useEffect(async () => {
    const storeUrl =
      Platform.OS === 'android'
        ? 'https://play.google.com/store/apps/details?id=com.spiritfront'
        : 'https://apps.apple.com/kr/app/%ED%95%9C%EC%9E%94%ED%95%A0%EA%B9%8C/id6740095371';
    try {
      const response = await Versioncheck();
      if (
        response.data.isVersionMatched == false &&
        response.data.isUpdateRequired == true
      ) {
        Linking.openURL(storeUrl);
      }
    } catch (error) {}
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2500);
  }, []);

  // 로딩 중이면 스플래시 화면 표시
  if (loading) {
    return <MySplashScreen />;
  } else {
    iniBasictNotification(token);
  }

  return (
    <>
      <NavigationContainer ref={navigationRef}>
        {token ? <MainStack /> : <OAuthStack />}
      </NavigationContainer>
    </>
  );
};

export default App;
