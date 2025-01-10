import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

import StoreMainScreen from '../screens/StoreInfo/StoreMain/StoreMainScreen';
import MenuAddScreen from '../screens/StoreInfo/MenuAdd/MenuAddScreen';
import CommonReviewScreen from '../screens/StoreInfo/CommonReview/CommonReviewScreen';
import ReceiptReviewScreen from '../screens/StoreInfo/ReceiptReview/ReceiptReviewScreen';
import UpdateMenuScreen from '../screens/StoreInfo/UpdateMenu/UpdateMenuScreen';
import UpdateStoreScreen from '../screens/StoreInfo/UpdateStore/UpdateStoreScreen';
import StoreMapScreen from '../screens/StoreInfo/StoreMap/StoreMapScreen';

const Stack = createStackNavigator();


export default function StoreStack() {
  return (
    <Stack.Navigator initialRouteName="StoreMainScreen">
      <Stack.Screen
        name="StoreMainScreen"
        component={StoreMainScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MenuAddScreen"
        component={MenuAddScreen}
        options={{title: '메뉴 등록하기'}}
      />
      <Stack.Screen
        name="CommonReviewScreen"
        component={CommonReviewScreen}
        options={{title: '일반 리뷰'}}
      />
      <Stack.Screen
        name="ReceiptReviewScreen"
        component={ReceiptReviewScreen}
        options={{title: '영수증 리뷰'}}
      />
      <Stack.Screen
        name="UpdateMenuScreen"
        component={UpdateMenuScreen}
        options={{title: '메뉴 수정하기'}}
      />
      <Stack.Screen
        name="UpdateStoreScreen"
        component={UpdateStoreScreen}
        options={{title: '매장 수정하기'}}
      />
      <Stack.Screen
        name="StoreMapScreen"
        component={StoreMapScreen}
        options={{headerShown: false}}
      />
    </Stack.Navigator>
  );
}
