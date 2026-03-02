// useNotificationClickHandler.js
import {useEffect} from 'react';
import {
  getInitialNotification,
  getMessaging,
  onNotificationOpenedApp,
} from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {useNotification} from '../../context/NotificationContext';

export const useNotificationClickHandler = () => {
  const {setPendingNotification} = useNotification();

  useEffect(() => {
    const unsubscribeForeground = notifee.onForegroundEvent(
      ({type, detail}) => {
        if (type === EventType.PRESS) {
          const data = {
            ...detail.notification?.data,
            body: detail.notification?.body,
          };
          setPendingNotification(data);
        }
      },
    );

    const messagingInstance = getMessaging();
    const unsubscribeOpenedApp = onNotificationOpenedApp(
      messagingInstance,
      remoteMessage => {
        const data = {
          ...remoteMessage?.data,
          body: remoteMessage?.notification?.body,
        };
        setPendingNotification(data);
      },
    );

    getInitialNotification(messagingInstance).then(remoteMessage => {
      if (remoteMessage) {
        const data = {
          ...remoteMessage?.data,
          body: remoteMessage?.notification?.body,
        };
        setPendingNotification(data);
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeOpenedApp();
    };
  }, [setPendingNotification]);
};
