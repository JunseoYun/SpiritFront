import React from 'react';
import {Pressable} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';

import ConfigScreen from '../screens/BottomTab/My/ConfigScreen';
import Mynickchange from '../screens/BottomTab/My/Mynickchange';
import MyScreen from '../screens/BottomTab/My/MyScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();

// 재사용 가능한 옵션 컴포넌트
const getScreenOptions = title => ({
  headerShown: true,
  title: title,
  headerTitleStyle: {
    fontSize: 20, // 타이틀 크기 설정
    color: '#333', // 텍스트 색상
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
  },
});

export default function MyStack() {
  return (
    <Stack.Navigator initialRouteName="MyScreen">
      <Stack.Screen
        name="ConfigScreen"
        component={ConfigScreen}
        options={({navigation}) => ({
          ...getScreenOptions('프로필 수정'), // getScreenOptions 객체를 펼쳐 병합
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()}>
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
        name="Mynickchange"
        component={Mynickchange}
        options={({navigation}) => ({
          ...getScreenOptions('닉네임 변경'), // getScreenOptions 객체를 펼쳐 병합
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()}>
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
        name="MyScreen"
        component={MyScreen}
        options={getScreenOptions('마이프로필')}
      />
    </Stack.Navigator>
  );
}
