import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// ✅ Notifee Background Handler 추가 필요
import notifee, {EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Firebase Background Handler
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('📩 Firebase 백그라운드 메시지 수신:', remoteMessage);
});

notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type === EventType.PRESS) {
    const data = detail.notification?.data;
    console.log('✅ [Notifee Background Click] 알림 클릭됨:', data);
    await AsyncStorage.setItem('PENDING_NOTIFICATION', JSON.stringify(data));
  }
});

AppRegistry.registerComponent(appName, () => App);
