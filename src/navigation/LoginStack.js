import React from 'react';

import {createStackNavigator} from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LoginScreen from '../screens/User/Login/LoginScreen';
import FindPwdScreen from '../screens/User/FindPwd/FindPwdScreen';
import SignUpScreen from '../screens/User/SignUp/SignUpScreen';
import MainScreen from '../screens/BottomTab/MainScreen';

import {Pressable} from 'react-native';


const Stack = createStackNavigator();

export default function LoginStack() {
  return (
    <Stack.Navigator initialRouteName="LoginScreen">
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={({navigation}) => ({
          title: '로그인',
          headerLeft: () => (
            <Pressable onPress={() => navigation.navigate(MainScreen)}>
              <Ionicons
                name="arrow-back-outline"
                size={25}
                color="black"
                style={{marginLeft: 13, paddingRight: 15}}
              />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="FindPwdScreen"
        component={FindPwdScreen}
        options={{
          title: '비밀번호 찾기',
        }}
      />
      <Stack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={{
          title: '회원가입',
        }}
      />
    </Stack.Navigator>
  );
}