import React from 'react';
import {Pressable} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import ConfigScreen from '../screens/BottomTab/My/ConfigScreen';
import Mynickchange from '../screens/BottomTab/My/Mynickchange';
import MyScreen from '../screens/BottomTab/My/MyScreen';
import WithdrawScreen from '../screens/BottomTab/My/WithdrawScreen';
import MyCardScreen from '../screens/BottomTab/My/MyCard/MyCardScreen';
import CardRegisterScreen from '../screens/BottomTab/My/MyCard/CardRegisterScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../utils/CustomText';
const Stack = createStackNavigator();

const renderHeaderTitle = label => (
  <CustomText
    style={{fontSize: 19, color: '#333', fontFamily: 'Pretendard-Bold'}}>
    {label}
  </CustomText>
);

const getScreenOptions = title => ({
  headerShown: true,
  title,
  headerTitle: () => renderHeaderTitle(title),

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
          headerTitleAlign: 'left',
          headerShadowVisible: false,
          title: '마이프로필',
          headerTitle: () => renderHeaderTitle('마이프로필'),
          headerTitleContainerStyle: {
            paddingLeft: 6,
          },
        })}
      />
      <Stack.Screen
        name="ConfigScreen"
        component={ConfigScreen}
        options={({navigation}) => ({
          headerShadowVisible: false,
          ...getScreenOptions('프로필 설정'),
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
          headerShadowVisible: false,
          ...getScreenOptions('닉네임 변경'),
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
        name="WithdrawScreen"
        component={WithdrawScreen}
        options={({navigation}) => ({
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',

          headerShadowVisible: false,
          title: '회원탈퇴',
          headerTitle: () => renderHeaderTitle('회원탈퇴'),
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
        name="MyCardScreen"
        component={MyCardScreen}
        options={({navigation}) => ({
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
          title: '내 카드 관리',
          headerTitle: () => renderHeaderTitle('내 카드 관리'),
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
        name="CardRegisterScreen"
        component={CardRegisterScreen}
        options={({navigation}) => ({
          title: '카드 등록',
          headerTitle: () => renderHeaderTitle('카드 등록'),
          headerTitleAlign: 'center',
          animation: 'slide_from_bottom',
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
