import React, {useRef} from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MainScreen from '../screens/BottomTab/MainScreen';
import MapScreen from '../screens/BottomTab/MapScreen';
import LikeScreen from '../screens/BottomTab/LikeScreen';
import ExploreScreen from '../screens/BottomTab/ExploreScreen';
import MyStack from './MyStack';
import CustomText from '../utils/CustomText';
import {HomeEmptyIcon, HomeFullIcon} from '../assets/svg/HomeTabIcon';

const Tab = createBottomTabNavigator();
const INITIAL_TAB = 'ExploreScreen';

const MainBtmbar = ({route}) => {
  const initialLastFocused = route?.params?.lastFocusedTab || INITIAL_TAB;
  const initialTab = route?.params?.initialTab || INITIAL_TAB;
  const initialLastNonMap =
    route?.params?.lastNonMapTab ||
    (initialTab === 'MapScreen' ? INITIAL_TAB : initialTab);
  const lastFocusedTabRef = useRef(initialLastFocused);
  const lastNonMapTabRef = useRef(initialLastNonMap);

  const renderLabel = (label, color) => (
    <CustomText
      maxScale={1}
      style={{color, fontFamily: 'Pretendard-Medium', fontSize: 12}}>
      {label}
    </CustomText>
  );
  const renderHeaderTitle = label => (
    <CustomText
      style={{fontSize: 19, color: '#333', fontFamily: 'Pretendard-Bold'}}>
      {label}
    </CustomText>
  );

  return (
    <Tab.Navigator
      initialRouteName={initialTab}
      backBehavior="none"
      screenListeners={({route, navigation}) => ({
        focus: () => {
          const current = route.name;
          if (current === 'MapScreen') {
            const incomingPrevTab = route.params?.prevTab;
            if (!incomingPrevTab || incomingPrevTab === 'MapScreen') {
              navigation.setParams({prevTab: lastNonMapTabRef.current});
            }
          } else {
            lastNonMapTabRef.current = current;
          }
          lastFocusedTabRef.current = current;
        },
      })}
      screenOptions={({route}) => ({
        tabBarStyle: {
          display: 'flex',
          alignItems: 'center',
          alignContent: 'center',
          justifyContent: 'center',
        },
        tabBarActiveTintColor: '#333',
        tabBarInactiveTintColor: '#999',
        tabBarIcon: ({focused, color, size}) => {
          let iconName;
          if (route.name === 'MainScreen') {
            return focused ? (
              <HomeFullIcon size={30} color={color} />
            ) : (
              <HomeEmptyIcon size={30} color={color} />
            );
          } else if (route.name === 'MapScreen')
            iconName = focused ? 'map' : 'map-outline';
          else if (route.name === 'ExploreScreen')
            iconName = focused ? 'search' : 'search-outline';
          else if (route.name === 'LikeScreen') {
            iconName = focused ? 'bookmark' : 'bookmark-outline';
          } else if (route.name === 'MyStack')
            iconName = focused ? 'person' : 'person-outline';
          return <Ionicons name={iconName} size={25} color={color} />;
        },
      })}>
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
        name="MapScreen"
        component={MapScreen}
        options={{
          tabBarLabel: ({color}) => renderLabel('주변', color),
          headerShown: false,
          tabBarStyle: {display: 'none'},
        }}
      />
      <Tab.Screen
        name="ExploreScreen"
        component={ExploreScreen}
        options={{
          tabBarLabel: ({color, focused}) =>
            renderLabel('탐색', focused ? '#333' : color),
          headerShown: false,
        }}
        listeners={({navigation, route}) => ({
          tabPress: () => {
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
          tabBarLabel: ({color}) => renderLabel('저장', color),
          headerShown: true,
          headerTitleAlign: 'left',

          headerShadowVisible: false,
          headerTitle: () => renderHeaderTitle('저장'),
          headerTitleContainerStyle: {
            paddingLeft: 6,
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
