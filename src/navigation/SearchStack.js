import React from 'react';

import {Pressable} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchScreen from '../screens/BottomTab/Search/SearchScreen';
import SearchResultScreen from '../screens/BottomTab/Search/SearchResultScreen';
import SearchFastScreen from '../screens/BottomTab/Search/SearchFastScreen';

const Stack = createStackNavigator();

export default function SearchStack() {
  return (
    <Stack.Navigator initialRouteName="SearchScreen">
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="SearchResultScreen"
        component={SearchResultScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="SearchFastScreen"
        component={SearchFastScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
