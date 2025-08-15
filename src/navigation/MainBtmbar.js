import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MainScreen from '../screens/BottomTab/MainScreen';
import MapScreen from '../screens/BottomTab/MapScreen';
import LikeScreen from '../screens/BottomTab/LikeScreen';
import SearchStack from './SearchStack';
import MyStack from './MyStack';

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
        tabBarActiveTintColor: '#1a1a1a', // 선택된 탭의 텍스트/아이콘 색상 black
        tabBarInactiveTintColor: '#999', // 비활성 탭의 텍스트/아이콘 색상
        tabBarIcon: ({focused, color, size}) => {
          let iconName;

          if (route.name === 'MainScreen') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MapScreen') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'SearchStack') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'LikeScreen') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'MyStack') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'LoginStack') {
            iconName = 'person-outline';
          }

          return <Ionicons name={iconName} size={25} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Pretendard-Medium',
        },
      })}>
      <Tab.Screen
        name="SearchStack"
        component={SearchStack}
        options={{tabBarLabel: '검색', headerShown: false}}
      />
      <Tab.Screen
        name="MapScreen"
        component={MapScreen}
        options={{tabBarLabel: '지역', headerShown: false}}
      />
      <Tab.Screen
        name="MainScreen"
        component={MainScreen}
        options={{
          tabBarLabel: '홈',
          headerShown: false,
        }}
        listeners={({navigation, route}) => ({
          tabPress: e => {
            const isFocused = navigation.isFocused();

            if (isFocused && route.params?.scrollToTop) {
              route.params.scrollToTop();
            }
          },
        })}
      />
      <Tab.Screen
        name="LikeScreen"
        component={LikeScreen}
        options={{
          tabBarLabel: '찜',
          headerShown: true,
          headerTitleAlign: 'center',
          title: '찜',
          headerTitleStyle: {
            fontSize: 19, // 타이틀 크기 설정
            color: '#333', // 텍스트 색상 (선택 사항)
            fontFamily: 'Pretendard-Bold',
          },
        }}
      />

      <Tab.Screen
        name="MyStack"
        component={MyStack}
        options={{tabBarLabel: '마이', headerShown: false}}
      />
    </Tab.Navigator>
  );
};

export default MainBtmbar;
