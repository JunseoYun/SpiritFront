// src/hooks/useNotificationSetup.js
import {useEffect} from 'react';
import {Platform} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';

export const useNotificationSetup = () => {
  useEffect(() => {
    const requestUserPermission = async () => {
      const settings = await notifee.requestPermission();

      if (settings.authorizationStatus >= 1) {
        console.log('✅ 알림 권한 허용됨');
      } else {
        console.log('❌ 알림 권한 거부됨');
      }
    };

    requestUserPermission();
  }, []);

  useEffect(() => {
    const setupChannel = async () => {
      await notifee.createChannel({
        id: 'default',
        name: '기본 채널',
        importance: AndroidImportance.HIGH,
      });
    };

    if (Platform.OS === 'android') {
      setupChannel();
    }
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      const platform = Platform.OS;
      console.log(
        `🔥 [${platform.toUpperCase()}] 포그라운드 메시지 수신:`,
        remoteMessage,
      );

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || '알림',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_launcher',
        },
        ios: {
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
      });
    });

    return unsubscribe;
  }, []);
};
