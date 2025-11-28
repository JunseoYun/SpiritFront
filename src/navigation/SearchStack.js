import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SearchScreen from '../screens/BottomTab/Search/SearchScreen';

const Stack = createStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator initialRouteName="SearchScreen">
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
