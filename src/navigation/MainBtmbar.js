import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Text, PixelRatio} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Octicons from 'react-native-vector-icons/Octicons';
import MainScreen from '../screens/BottomTab/MainScreen';
import MapScreen from '../screens/BottomTab/MapScreen';
import LikeScreen from '../screens/BottomTab/LikeScreen';
import OrderScreen from '../screens/BottomTab/Order/OrderScreen';
import SearchStack from './SearchStack';
import MyStack from './MyStack';

const Tab = createBottomTabNavigator();

const MainBtmbar = () => {
  // 탭 라벨을 커스텀 Text로 반환
  const renderLabel = (label, color) => (
    <Text
      style={{color, fontFamily: 'Pretendard-Medium', fontSize: 12}}
      allowFontScaling={false}>
      {label}
    </Text>
  );

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
        tabBarActiveTintColor: '#1a1a1a',
        tabBarInactiveTintColor: '#999',
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          if (route.name === 'MainScreen')
            iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'MapScreen')
            iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'SearchStack')
            iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'OrderScreen') {
            iconName = focused ? 'reader' : 'reader-outline';
          } else if (route.name === 'MyStack')
            iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={25} color={color} />;
        },
      })}>
      <Tab.Screen
        name="SearchStack"
        component={SearchStack}
        options={{
          tabBarLabel: ({color}) => renderLabel('검색', color),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="MapScreen"
        component={MapScreen}
        options={{
          tabBarLabel: ({color}) => renderLabel('주변', color),
          headerShown: false,
          tabBarStyle: {display: 'none'},
        }}
      />
      <Tab.Screen
        name="MainScreen"
        component={MainScreen}
        options={{
          tabBarLabel: ({color}) => renderLabel('홈', color),
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
        name="OrderScreen"
        component={OrderScreen}
        options={{
          tabBarLabel: ({color}) => renderLabel('주문', color),
          headerShown: true,
          headerTitleAlign: 'center',
          title: '나의 주문',
          headerTitleStyle: {
            fontSize: 19,
            color: '#333',
            fontFamily: 'Pretendard-Bold',
          },
        }}
      />
      <Tab.Screen
        name="MyStack"
        component={MyStack}
        options={{
          tabBarLabel: ({color}) => renderLabel('마이', color),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainBtmbar;
