import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import StoreMainScreen from '../screens/StoreInfo/StoreMainScreen';
import MenuAddScreen from '../screens/StoreInfo/MenuAddScreen';
import UpdateMenuScreen from '../screens/StoreInfo/UpdateMenuScreen';
import UpdateStoreScreen from '../screens/StoreInfo/UpdateStoreScreen';
import StoreMapScreen from '../screens/StoreInfo/StoreMapScreen';

const Stack = createStackNavigator();


export default function StoreStack() {
  return (
    <Stack.Navigator initialRouteName="StoreMainScreen">
      <Stack.Screen
        name="StoreMainScreen"
        component={StoreMainScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MenuAddScreen"
        component={MenuAddScreen}
        options={{title: '메뉴 등록하기'}}
      />
      <Stack.Screen
        name="UpdateMenuScreen"
        component={UpdateMenuScreen}
        options={{title: '메뉴 수정하기'}}
      />
      <Stack.Screen
        name="UpdateStoreScreen"
        component={UpdateStoreScreen}
        options={{title: '매장 수정하기'}}
      />
      <Stack.Screen
        name="StoreMapScreen"
        component={StoreMapScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
