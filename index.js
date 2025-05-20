/**
 * @format
 */
import 'react-native-gesture-handler'; // ✅ 가장 위에 있어야 함

import {AppRegistry, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
messaging().setBackgroundMessageHandler(async msg => {});
AppRegistry.registerComponent(appName, () => App);
