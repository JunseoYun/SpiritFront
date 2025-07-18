import React, {useEffect, useState, useRef} from 'react';
import {Linking, Platform} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import MainStack from './src/navigation/MainStack';
import OAuthStack from './src/navigation/OAuthStack';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {CustomAlertProvider} from './src/context/CustomAlertContext';
import {Provider as PaperProvider} from 'react-native-paper';
import {ToastProvider, useToast} from './src/context/ToastContext';
import {
  NotificationProvider,
  useNotification,
} from './src/context/NotificationContext';
import SplashScreen from 'react-native-splash-screen';
import MySplashScreen from './src/screens/MySplashScreen';
import {iniBasictNotification} from './src/hooks/notification/useNotificationPermission';
import {useNotificationSetup} from './src/hooks/notification/useNotificationSetup';
import {useNotificationClickHandler} from './src/hooks/notification/useNotificationClickHandler';
import useHandlePendingNotification from './src/hooks/notification/useHandlePendingNotification';
import useVersionCheck from './src/hooks/useVersionCheck';
import {navigationRef} from './src/navigation/NavigationService';
import {handleUrl} from './src/hooks/applink/AppLinkHandler';
import {DeepLinkProvider, useDeepLink} from './src/context/DeepLinkContext';
import './reanimatedConfig';

if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

const App = () => {
  useNotificationSetup();

  useEffect(() => {
    if (Platform.OS === 'ios') {
      setTimeout(() => {
        SplashScreen.hide();
      }, 500);
    }
  }, []);

  return (
    <PaperProvider>
      <AuthProvider>
        <CustomAlertProvider>
          <ToastProvider>
            <NotificationProvider>
              <DeepLinkProvider>
                <AppNavigator />
              </DeepLinkProvider>
            </NotificationProvider>
          </ToastProvider>
        </CustomAlertProvider>
      </AuthProvider>
    </PaperProvider>
  );
};

const AppNavigator = () => {
  const {token} = useAuth(); // 여전히 컴포넌트 안에서는 사용
  const {showToast} = useToast();
  const {isVersionValid, isTestEnabled} = useVersionCheck();
  const {pendingNotification, setPendingNotification} = useNotification();
  const {pendingStoreId, setPendingStoreId} = useDeepLink();

  const [loading, setLoading] = useState(true);
  const [initialUrl, setInitialUrl] = useState(null);
  const [navigationReady, setNavigationReady] = useState(false);

  const alreadyHandledRef = useRef(false);

  useNotificationClickHandler();
  useHandlePendingNotification(loading, pendingNotification, () =>
    setPendingNotification(null),
  );

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 2500);
  }, []);

  const onNavigationReady = () => {
    setNavigationReady(true);
  };

  useEffect(() => {
    if (initialUrl && navigationReady && !alreadyHandledRef.current) {
      alreadyHandledRef.current = true;
      handleUrl({url: initialUrl});
      setInitialUrl(null);

      // 1초 뒤 다시 false로 초기화 (딥링크 재처리 가능하게)
      setTimeout(() => {
        alreadyHandledRef.current = false;
      }, 500);
    }
  }, [initialUrl, navigationReady]);

  // 2) 링크 이벤트 처리 (앱 실행 중)
  useEffect(() => {
    const handleLink = ({url}) => {
      if (alreadyHandledRef.current) return;
      alreadyHandledRef.current = true;
      handleUrl({url});

      setTimeout(() => {
        alreadyHandledRef.current = false;
      }, 500);
    };

    const getInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url) setInitialUrl(url);

      Linking.addEventListener('url', handleLink);
    };

    getInitialUrl();

    return () => {
      Linking.removeAllListeners('url');
    };
  }, [navigationReady]);

  useEffect(() => {
    if (!navigationReady) return; // ✅ NavigationContainer 준비 전엔 아무것도 하지 않음

    if (token && pendingStoreId) {
      navigationRef.reset({
        index: 1,
        routes: [
          {
            name: 'MainBtmbar',
            state: {
              routes: [{name: 'MainScreen'}], // 👈 반드시 초기 탭 명시
            },
          },
          {
            name: 'StoreStack',
            state: {
              routes: [
                {
                  name: 'StoreMainScreen',
                  params: {storeId: pendingStoreId},
                },
              ],
            },
          },
        ],
      });

      setPendingStoreId(null); // ✅ navigation 성공 후에만 초기화
    }
  }, [token, pendingStoreId, navigationReady]);

  if (loading || !isVersionValid) {
    return <MySplashScreen isVersionValid={isVersionValid} />;
  } else {
    iniBasictNotification(token);
  }

  return (
    <>
      <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
        {token ? <MainStack /> : <OAuthStack isTestEnabled={isTestEnabled} />}
      </NavigationContainer>
    </>
  );
};

export default App;
