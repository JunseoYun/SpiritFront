import React, {useEffect, useState} from 'react';
import {Pressable, Text, StyleSheet} from 'react-native';
import {BackHandler} from 'react-native';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';

import MainScreen from '../screens/MainScreen';
import Ub from '../screens/Ub';

const Tab = createBottomTabNavigator();

const MainBtmbar = () => {
  return (
    <Tab.Navigator
      initialRouteName="MainScreen"
      screenOptions={({route}) => ({
        tabBarStyle: {
          display: 'flex',
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        },

        
        
      })}>
      <Tab.Screen
        name="MainScreen"
        component={MainScreen}
        options={{
          tabBarLabel: '홈',
          headerShown: false,
        }}
      />
    <Tab.Screen
        name="Ub"
        component={Ub}
        options={{
          tabBarLabel: '홈',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainBtmbar;
