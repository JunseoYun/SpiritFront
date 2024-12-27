import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';

import MainScreen from '../screens/BottomTab/MainScreen';
import SearchScreen from '../screens/BottomTab/Search/SearchScreen';
import MapScreen from '../screens/BottomTab/MapScreen';
import LikeScreen from '../screens/BottomTab/LikeScreen';
import UserScreen from '../screens/BottomTab/User/UserScreen';

const Tab = createBottomTabNavigator();

const MainBtmbar = () => {
  return (
    <Tab.Navigator
      initialRouteName="MainScreen"
      screenOptions={({ route }) => ({
        tabBarStyle: {
          display: 'flex',
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        },
        tabBarActiveTintColor: '#16BBFF', // 선택된 탭의 텍스트/아이콘 색상
        tabBarInactiveTintColor: 'gray', // 비활성 탭의 텍스트/아이콘 색상
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'MainScreen') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MapScreen') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'SearchScreen') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'LikeScreen') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'UserScreen') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={25} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}
    >
      <Tab.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{ headerShown: false, tabBarLabel: '검색' }}
      />
      <Tab.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ tabBarLabel: '지역', headerShown: false }}
      />
      <Tab.Screen
        name="MainScreen"
        component={MainScreen}
        options={{
          tabBarLabel: '홈',
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="LikeScreen"
        component={LikeScreen}
        options={{ tabBarLabel: '찜', headerShown: false }}
      />
      <Tab.Screen
        name="UserScreen"
        component={UserScreen}
        options={{ tabBarLabel: '마이', headerShown: false }}
      />
    </Tab.Navigator>
  );
};

export default MainBtmbar;
