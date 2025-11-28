import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import SearchScreen from '../screens/BottomTab/Search/SearchScreen';

const Stack = createStackNavigator();

export default function SearchStack() {
  //frist commit - planned for deletion
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
