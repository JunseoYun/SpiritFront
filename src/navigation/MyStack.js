import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import ConfigPage from '../screens/BottomTab/My/ConfigPage';
import Mynickchange from '../screens/BottomTab/My/Mynickchange';
import Logout from '../screens/BottomTab/My/Logout';

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
    <Stack.Navigator initialRouteName="ConfigPage">
      <Stack.Screen
        name="ConfigPage"
        component={ConfigPage}
        options={getScreenOptions('프로필 수정')}
      />
      <Stack.Screen
        name="Mynickchange"
        component={Mynickchange}
        options={getScreenOptions('닉네임 변경')}
      />
      <Stack.Screen
        name="Logout"
        component={Logout}
        options={{title: '임시 로그아웃'}}
      />
    </Stack.Navigator>
  );
}
