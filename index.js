/**
 * @format
 */
import 'react-native-gesture-handler'; // ✅ 가장 위에 있어야 함

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
