import React, {useState, useEffect} from 'react';
import {Pressable} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import ConfigScreen from '../screens/BottomTab/My/ConfigScreen';
import Mynickchange from '../screens/BottomTab/My/Mynickchange';
import MyScreen from '../screens/BottomTab/My/MyScreen';
import ReviewEditScreen from '../screens/BottomTab/My/ReviewEditScreen';
import WithdrawScreen from '../screens/BottomTab/My/WithdrawScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import NotificationScreen from '../screens/BottomTab/My/Notification/NotificationScreen';
import NotificationSetScreen from '../screens/BottomTab/My/Notification/NotificationSetScreen';
import ManagerStoreInfoScreen from '../screens/BottomTab/My/ManagerStoreInfoScreen';
//AntDesign bells
const Stack = createStackNavigator();

// 재사용 가능한 옵션 컴포넌트
const getScreenOptions = title => ({
  headerShown: true,
  title: title,
  headerTitleStyle: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },

  headerTitleAlign: 'center',
});
export default function MyStack() {
  // const {token, unToken} = useAuth();

  return (
    <Stack.Navigator initialRouteName={'MyScreen'}>
      <Stack.Screen
        name="MyScreen"
        component={MyScreen}
        options={({navigation}) => ({
          headerShown: true,
          headerTitleAlign: 'center',
          title: '마이프로필',
          headerTitleStyle: {
            fontSize: 19,
            color: '#333',
            fontFamily: 'Pretendard-Bold',
          },
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('NotificationScreen')}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <AntDesign
                name="bells"
                size={22}
                color="#333"
                style={{paddingRight: 14}}
              />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="ConfigScreen"
        component={ConfigScreen}
        options={({navigation}) => ({
          ...getScreenOptions('프로필 수정'), // getScreenOptions 객체를 펼쳐 병합
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <Ionicons
                name="arrow-back-outline"
                size={23}
                color="#333"
                style={{paddingLeft: 12}}
              />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="Mynickchange"
        component={Mynickchange}
        options={({navigation}) => ({
          ...getScreenOptions('닉네임 변경'), // getScreenOptions 객체를 펼쳐 병합
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <Ionicons
                name="arrow-back-outline"
                size={23}
                color="#333"
                style={{paddingLeft: 12}}
              />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="ReviewEditScreen"
        component={ReviewEditScreen}
        options={({navigation}) => ({
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
          title: '리뷰 수정',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <Ionicons
                name="close"
                size={23}
                color="#333"
                style={{paddingLeft: 12}}
              />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="WithdrawScreen"
        component={WithdrawScreen}
        options={({navigation}) => ({
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
          title: '회원탈퇴',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <Ionicons
                name="close"
                size={23}
                color="#333"
                style={{paddingLeft: 12}}
              />
            </Pressable>
          ),
        })}
      />
      <Stack.Screen
        name="NotificationScreen"
        component={NotificationScreen}
        options={({navigation}) => ({
          ...getScreenOptions('알림'), // getScreenOptions 객체를 펼쳐 병합
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <Ionicons
                name="arrow-back-outline"
                size={23}
                color="#333"
                style={{paddingLeft: 12}}
              />
            </Pressable>
          ),
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('NotificationSetScreen')}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <AntDesign
                name="setting"
                size={23}
                color="#333"
                style={{paddingRight: 14}}
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="NotificationSetScreen"
        component={NotificationSetScreen}
        options={({navigation}) => ({
          ...getScreenOptions('알림 설정'), // getScreenOptions 객체를 펼쳐 병합
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <Ionicons
                name="arrow-back-outline"
                size={23}
                color="#333"
                style={{paddingLeft: 12}}
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="ManagerStoreInfoScreen"
        component={ManagerStoreInfoScreen}
        options={({navigation}) => ({
          ...getScreenOptions('매장 통계'), // getScreenOptions 객체를 펼쳐 병합
          headerLeft: () => (
            <Pressable
              onPress={() => navigation.goBack()}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <Ionicons
                name="arrow-back-outline"
                size={23}
                color="#333"
                style={{paddingLeft: 12}}
              />
            </Pressable>
          ),
        })}
      />
    </Stack.Navigator>
  );
}
