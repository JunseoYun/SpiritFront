import React, {useEffect, useState, useRef, useCallback} from 'react';
import {Linking, Platform, StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import MainStack from './src/navigation/MainStack';
import OAuthStack from './src/navigation/OAuthStack';
import {AuthProvider, useAuth} from './src/context/AuthContext';
import {CustomAlertProvider} from './src/context/CustomAlertContext';
import {Provider as PaperProvider} from 'react-native-paper';
import {ToastProvider} from './src/context/ToastContext';
import {StoreInviteProvider} from './src/context/StoreInviteContext';
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
import mobileAds from 'react-native-google-mobile-ads';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {
  initLocationIfNeeded,
  initLocationFromServer,
} from './src/storage/locationStorage';
import {AdConsentProvider} from './src/context/AdConsentContext';
import {MapSearchProvider} from './src/context/MapSearchContext';

if (!__DEV__) {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

const App = () => {
  useNotificationSetup();

  useEffect(() => {
    mobileAds()
      .initialize()
      .then(() => {});
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      SplashScreen.hide();
    }
  }, []);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <PaperProvider>
          <AuthProvider>
            <CustomAlertProvider>
              <ToastProvider>
                <NotificationProvider>
                  <DeepLinkProvider>
                    <StoreInviteProvider>
                      <AdConsentProvider>
                        <MapSearchProvider>
                          <AppNavigator />
                        </MapSearchProvider>
                      </AdConsentProvider>
                    </StoreInviteProvider>
                  </DeepLinkProvider>
                </NotificationProvider>
              </ToastProvider>
            </CustomAlertProvider>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const AppNavigator = () => {
  const {token} = useAuth();
  const {isVersionValid, isTestEnabled} = useVersionCheck();
  const {pendingNotification, setPendingNotification} = useNotification();
  const {pendingStoreId, setPendingStoreId, pendingPostId, setPendingPostId} =
    useDeepLink();

  const [loading, setLoading] = useState(true);
  const [navigationReady, setNavigationReady] = useState(false);
  const alreadyHandledRef = useRef(false);

  const handleDeepLink = useCallback(url => {
    if (!url) return;
    if (alreadyHandledRef.current) return;
    alreadyHandledRef.current = true;
    handleUrl({url});
    setTimeout(() => {
      alreadyHandledRef.current = false;
    }, 500);
  }, []);

  useNotificationClickHandler();
  useHandlePendingNotification(loading, pendingNotification, () =>
    setPendingNotification(null),
  );
  useEffect(() => {
    if (token) {
      setLoading(true);
      const init = async () => {
        await initLocationFromServer();
        setLoading(false);
      };
      init();
    }
  }, [token]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(t);
  }, []);

  const onNavigationReady = () => setNavigationReady(true);

  // 🚀 앱이 처음 시작될 때 딥링크 처리
  useEffect(() => {
    const fetchInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (!url) return;
      handleDeepLink(url);
    };
    if (navigationReady) fetchInitialUrl();
  }, [navigationReady, handleDeepLink]);

  // 🚀 앱 실행 중에 들어오는 링크 처리
  useEffect(() => {
    const listener = ({url}) => {
      handleDeepLink(url);
    };
    const sub = Linking.addEventListener('url', listener);

    return () => {
      sub.remove();
    };
  }, [handleDeepLink]);

  // 🚀 pendingStoreId 가 세팅되었을 때 실제 네비게이션 이동
  useEffect(() => {
    if (!navigationReady || !pendingStoreId || !token) return;
    const currentRoute = navigationRef.getCurrentRoute();
    if (
      currentRoute?.name === 'StoreMainScreen' &&
      currentRoute?.params?.storeId === pendingStoreId
    ) {
      setPendingStoreId(null);
      return;
    }
    setTimeout(() => {
      navigationRef.navigate('StoreStack', {
        screen: 'StoreMainScreen',
        params: {storeId: pendingStoreId},
      });
    }, 500);

    setPendingStoreId(null);
  }, [navigationReady, token, pendingStoreId]);

  useEffect(() => {
    if (!navigationReady || !pendingPostId || !token) return;
    const currentRoute = navigationRef.getCurrentRoute();
    if (
      currentRoute?.name === 'PostDetailScreen' &&
      String(currentRoute?.params?.postId) === String(pendingPostId)
    ) {
      setPendingPostId(null);
      return;
    }
    setTimeout(() => {
      navigationRef.navigate('PostDetailScreen', {postId: pendingPostId});
    }, 500);

    setPendingPostId(null);
  }, [navigationReady, token, pendingPostId]);

  if (loading || !isVersionValid) {
    return <MySplashScreen isVersionValid={isVersionValid} />;
  } else {
    iniBasictNotification(token);
  }

  return (
    <BottomSheetModalProvider>
      <NavigationContainer ref={navigationRef} onReady={onNavigationReady}>
        {Platform.OS === 'android' && (
          <StatusBar
            barStyle="dark-content" // 상태바 글자/아이콘 색
            backgroundColor={'#fff'}
          />
        )}
        {token ? <MainStack /> : <OAuthStack isTestEnabled={isTestEnabled} />}
      </NavigationContainer>
    </BottomSheetModalProvider>
  );
};

export default App;
