import React from 'react';
import {Pressable} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import ConfigScreen from '../screens/BottomTab/My/ConfigScreen';
import Mynickchange from '../screens/BottomTab/My/Mynickchange';
import MyScreen from '../screens/BottomTab/My/MyScreen';
import ReviewEditScreen from '../screens/BottomTab/My/ReviewEditScreen';
import WithdrawScreen from '../screens/BottomTab/My/WithdrawScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
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
    </Stack.Navigator>
  );
}
