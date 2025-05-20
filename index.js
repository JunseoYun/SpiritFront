/**
 * @format
 */
import 'react-native-gesture-handler'; // ✅ 가장 위에 있어야 함

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // 여기에 알림 로직 추가 가능 (예: 로컬 알림 표시 등)
});
AppRegistry.registerComponent(appName, () => App);
