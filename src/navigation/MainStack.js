import React from 'react';
import { Pressable } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import MainBtmbar from './MainBtmbar';
import SetLocationScreen from '../screens/SetLocation/SetLocationScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LocationSearchScreen from '../screens/SetLocation/LocationSearchScreen';
import StoreAddScreen from '../screens/StoreRegister/StoreAddScreen';
import StoreAuthorityScreen from '../screens/StoreRegister/StoreAuthorityScreen';
import StoreAddressSearch from '../screens/StoreRegister/StoreAddressSearch';
const Stack = createStackNavigator();

export default function MainStack() {
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
      }}>
      <Stack.Screen
        name="MainBtmbar"
        component={MainBtmbar}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SetLocationScreen"
        component={SetLocationScreen}
        options={({ navigation, }) => ({
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
      <Stack.Screen
        name="StoreAddScreen"
        component={StoreAddScreen}
        options={({ navigation }) => ({
          title: '매장 등록하기',
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
        name="StoreAddressSearch"
        component={StoreAddressSearch}
        options={{ title: '매장 주소 검색' }}
      />
      <Stack.Screen
        name="StoreAuthorityScreen"
        component={StoreAuthorityScreen}
        options={({ navigation }) => ({
          title: '매장 권한 등록하기',
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
