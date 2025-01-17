import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import OAuthLoginScreen from '../screens/OAuth/OAuthLoginScreen';
import RegisterScreen from '../screens/OAuth/RegisterScreen';
const Stack = createStackNavigator();

export default function OAuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // 헤더를 완전히 숨김
      }}
      initialRouteName="OAuthLoginScreen">
      <Stack.Screen name="OAuthLoginScreen" component={OAuthLoginScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    </Stack.Navigator>
  );
}
