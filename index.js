import 'react-native-gesture-handler'; // ✅ 항상 맨 위

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';

setBackgroundMessageHandler(getMessaging(), async remoteMessage => {
  console.log('📩 백그라운드 메시지 수신:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);
