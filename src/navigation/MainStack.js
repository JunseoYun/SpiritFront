import React from 'react';
import { Pressable } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import MainBtmbar from './MainBtmbar';
import SetLocationScreen from '../screens/SetLocation/SetLocationScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LocationSearchScreen from '../screens/SetLocation/LocationSearchScreen';

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainBtmbar"
        component={MainBtmbar}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SetLocationScreen"
        component={SetLocationScreen}
        options={({ navigation }) => ({
          title: '위치 설정',
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons
                name="arrow-back-outline"
                size={25}
                color="black"
                style={{ marginLeft: 13, paddingRight: 15 }}
              />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="LocationSearchScreen"
        component={LocationSearchScreen}
        options={{ title: '주소 검색' }}
      />

    </Stack.Navigator>
  );
}
