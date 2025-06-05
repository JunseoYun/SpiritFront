// useNotificationClickHandler.js
import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import notifee, {EventType} from '@notifee/react-native';
import {useNotification} from '../../context/NotificationContext';

export const useNotificationClickHandler = () => {
  const {setPendingNotification} = useNotification();

  useEffect(() => {
    const unsubscribeForeground = notifee.onForegroundEvent(
      ({type, detail}) => {
        if (type === EventType.PRESS) {
          const data = detail.notification?.data;
          console.log('✅ Foreground 알림 클릭', data);
          setPendingNotification(data);
        }
      },
    );

    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(
      remoteMessage => {
        const data = remoteMessage?.data;
        console.log('✅ Background 알림 클릭', data);
        setPendingNotification(data);
      },
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const data = remoteMessage?.data;
          console.log('✅ Cold start 알림 클릭', data);
          setPendingNotification(data);
        }
      });

    return () => {
      unsubscribeForeground();
      unsubscribeOpenedApp();
    };
  }, [setPendingNotification]);
};
