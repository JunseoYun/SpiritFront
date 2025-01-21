import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import ConfigScreen from '../screens/BottomTab/My/ConfigScreen';
import Mynickchange from '../screens/BottomTab/My/Mynickchange';
import MyScreen from '../screens/BottomTab/My/MyScreen';

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
        options={getScreenOptions('프로필 수정')}
      />
      <Stack.Screen
        name="Mynickchange"
        component={Mynickchange}
        options={getScreenOptions('닉네임 변경')}
      />
      <Stack.Screen
        name="MyScreen"
        component={MyScreen}
        options={{title: '임시 로그아웃'}}
      />
    </Stack.Navigator>
  );
}
