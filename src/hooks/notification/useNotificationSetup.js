import {useEffect} from 'react';
import {Platform} from 'react-native';
import {getMessaging, onMessage} from '@react-native-firebase/messaging';
import notifee, {AndroidImportance} from '@notifee/react-native';

export const useNotificationSetup = () => {
  useEffect(() => {
    const requestUserPermission = async () => {
      const settings = await notifee.requestPermission();
      if (settings.authorizationStatus >= 1) {
      } else {
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
    const unsubscribe = onMessage(getMessaging(), async remoteMessage => {
      const platform = Platform.OS;

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || '알림',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId: 'default',
          importance: AndroidImportance.HIGH,
          smallIcon: 'ic_launcher',
          pressAction: {
            id: 'default',
            launchActivity: 'default',
          },
        },
        ios: {
          foregroundPresentationOptions: {
            alert: true,
            badge: true,
            sound: true,
          },
        },
        data: remoteMessage.data,
      });
    });

    return unsubscribe;
  }, []);
};
