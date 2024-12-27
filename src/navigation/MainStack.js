import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import MainBtmbar from './MainBtmbar';
import Ub from '../screens/Ub';

const Stack = createStackNavigator();

export default function MainStack() {
    return (
      <Stack.Navigator>
        <Stack.Screen
          name="MainBtmbar"
          component={MainBtmbar}
          options={{headerShown: false}}
        />
        {/* <Stack.Screen
          name="Ub"
          component={Ub}
          options={{headerShown: false}}
        /> */}
      </Stack.Navigator>
    );
  }
  