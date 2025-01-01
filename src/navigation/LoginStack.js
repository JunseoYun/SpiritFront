import React from 'react';

import { createStackNavigator } from '@react-navigation/stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import LoginScreen from '../screens/User/Login/LoginScreen';
import FindPwdScreen from '../screens/User/FindPwd/FindPwdScreen';
import SignUpScreen from '../screens/User/SignUp/SignUpScreen';
import MainScreen from '../screens/BottomTab/MainScreen';

import { Pressable } from 'react-native';


const Stack = createStackNavigator();

export default function LoginStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF', // 헤더 배경색 (필요하면 수정)
          shadowColor: 'transparent', // iOS: 섀도우 없애기
          elevation: 0, // Android: 헤더 하단 선 없애기
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: '#333', // 헤더 제목 색상
        },
      }}
      initialRouteName="LoginScreen">
      <Stack.Screen
        name="LoginScreen"
        component={LoginScreen}
        options={({ navigation }) => ({
          title: '로그인',
          headerLeft: () => (
            <Pressable onPress={() => navigation.navigate(MainScreen)}>
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
        name="FindPwdScreen"
        component={FindPwdScreen}
        options={({ navigation }) => ({
          title: '비밀번호 찾기',
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
        name="SignUpScreen"
        component={SignUpScreen}
        options={({ navigation }) => ({
          title: '회원가입',
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
    </Stack.Navigator>
  );
}