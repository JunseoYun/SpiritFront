import React from 'react';
import {Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createStackNavigator} from '@react-navigation/stack';
import Octicons from 'react-native-vector-icons/Octicons';

import StoreMainScreen from '../screens/StoreInfo/StoreMainScreen';
import MenuAddScreen from '../screens/StoreInfo/Menu/MenuAddScreen';
import StoreMapScreen from '../screens/StoreInfo/StoreMapScreen';
import StoreReviewScreen from '../screens/StoreInfo/StoreReviewScreen';
import AlcoholAddScreen from '../screens/StoreInfo/Alcohol/AlcoholAddScreen';
import MenuUpdateScreen from '../screens/StoreInfo/Menu/MenuUpdateScreen';
import AlcoholUpdateScreen from '../screens/StoreInfo/Alcohol/AlcoholUpdateScreen';
import StoreReportScreen from '../screens/StoreInfo/Report/StoreReportScreen';
import ReviewReportScreen from '../screens/StoreInfo/Report/ReviewReportScreen';
import {getGlobalShowAlert} from '../context/CustomAlertContext';
const Stack = createStackNavigator();

export default function StoreStack() {
  const showAlert = getGlobalShowAlert();
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
        options={({navigation}) => ({
          title: '메뉴 등록하기',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              onPress={() => {
                showAlert({
                  title: '작성한 내용이 저장되지 않았습니다',
                  message: '뒤로 가시겠습니까?',
                  onConfirm: () => {
                    navigation.goBack();
                  },
                  onCancel: null,
                  type: 'confirm',
                });
              }}>
              <Ionicons
                name="arrow-back-outline"
                size={25}
                color="#333"
                style={{marginLeft: 13, paddingRight: 15}}
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="MenuUpdateScreen"
        component={MenuUpdateScreen}
        options={{
          headerShown: false,
          resentation: 'modal',
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen
        name="AlcoholAddScreen"
        component={AlcoholAddScreen}
        options={({navigation}) => ({
          title: '주류 등록하기',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              onPress={() => {
                showAlert({
                  title: '작성한 내용이 저장되지 않았습니다',
                  message: '뒤로 가시겠습니까?',
                  onConfirm: () => {
                    navigation.goBack();
                  },
                  onCancel: null,
                  type: 'confirm',
                });
              }}>
              <Ionicons
                name="arrow-back-outline"
                size={25}
                color="#333"
                style={{marginLeft: 13, paddingRight: 15}}
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="AlcoholUpdateScreen"
        component={AlcoholUpdateScreen}
        options={{
          headerShown: false,
          resentation: 'modal',
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen
        name="StoreMapScreen"
        component={StoreMapScreen}
        options={({navigation, route}) => ({
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons
                name="arrow-back-outline"
                size={25}
                color="#333"
                style={{marginLeft: 13, paddingRight: 15}}
              />
            </Pressable>
          ),
          title: `${route.params?.storename || '매장'} 길찾기`,
          headerTitleAlign: 'center',
          presentation: 'modal',
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
        })}
      />

      <Stack.Screen
        name="StoreReviewScreen"
        component={StoreReviewScreen}
        options={({navigation, route}) => ({
          headerLeft: () => (
            <Pressable onPress={() => navigation.goBack()}>
              <Ionicons
                name="arrow-back-outline"
                size={25}
                color="#333"
                style={{marginLeft: 13, paddingRight: 15}}
              />
            </Pressable>
          ),
          title: `${route.params?.storename || '매장'} 리뷰`, // 매장 이름이 없으면 기본값 '매장' 사용
          headerTitleAlign: 'center',
          gestureDirection: 'vertical',
          animation: 'slide_from_right',
        })}
      />

      <Stack.Screen
        name="StoreReportScreen"
        component={StoreReportScreen}
        options={({navigation}) => ({
          title: '매장 신고하기',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              onPress={() => {
                navigation.goBack();
              }}>
              <Octicons
                name="x"
                size={25}
                color="#333"
                style={{marginLeft: 13, paddingRight: 15}}
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="ReviewReportScreen"
        component={ReviewReportScreen}
        options={({navigation}) => ({
          presentation: 'modal',
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
          title: '리뷰 신고하기',
          headerTitleAlign: 'center',
          headerLeft: () => (
            <Pressable
              onPress={() => {
                navigation.goBack();
              }}>
              <Octicons
                name="x"
                size={25}
                color="#333"
                style={{marginLeft: 13, paddingRight: 15}}
              />
            </Pressable>
          ),
        })}
      />
    </Stack.Navigator>
  );
}
