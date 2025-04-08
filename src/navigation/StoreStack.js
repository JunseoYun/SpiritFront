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
import StoreTimeEditScreen from '../screens/StoreInfo/StoreTimeEditScreen';
import UpdateStoreDrink from '../components/UpdateBottomSheet/UpdateStoreDrink';
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
        name="StoreTimeEditScreen"
        component={StoreTimeEditScreen}
        options={({navigation}) => ({
          title: '영업 시간 수정',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#333',
          },
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
        name="UpdateStoreDrink"
        component={UpdateStoreDrink}
        options={({navigation}) => ({
          title: '대표 주류 수정',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#333',
          },
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
        name="MenuAddScreen"
        component={MenuAddScreen}
        options={({navigation}) => ({
          title: '메뉴 등록하기',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#333',
          },
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
                size={23}
                color="#333"
                style={{paddingLeft: 12}}
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="MenuUpdateScreen"
        component={MenuUpdateScreen}
        options={({navigation}) => ({
          title: '메뉴 수정하기',
          headerTitleAlign: 'center',
          gestureDirection: 'vertical',
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#333',
          },
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
                size={23}
                color="#333"
                style={{paddingLeft: 12}}
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="AlcoholAddScreen"
        component={AlcoholAddScreen}
        options={({navigation}) => ({
          title: '주류 등록하기',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#333',
          },
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
                size={23}
                color="#333"
                style={{paddingLeft: 12}}
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="AlcoholUpdateScreen"
        component={AlcoholUpdateScreen}
        options={({navigation}) => ({
          title: '주류 수정하기',
          headerTitleAlign: 'center',
          gestureDirection: 'vertical',
          presentation: 'modal',
          animation: 'slide_from_bottom',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#333',
          },
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
                size={23}
                color="#333"
                style={{paddingLeft: 12}}
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="StoreMapScreen"
        component={StoreMapScreen}
        options={({navigation, route}) => ({
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
          title: `${route.params?.storename || '매장'} 리뷰`, // 매장 이름이 없으면 기본값 '매장' 사용
          headerTitleAlign: 'center',
          animation: 'slide_from_right',
          headerShadowVisible: false,
        })}
      />

      <Stack.Screen
        name="StoreReportScreen"
        component={StoreReportScreen}
        options={({navigation}) => ({
          title: '매장 신고하기',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#333',
          },
          headerLeft: () => (
            <Pressable
              onPress={() => {
                navigation.goBack();
              }}
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
        name="ReviewReportScreen"
        component={ReviewReportScreen}
        options={({navigation}) => ({
          gestureDirection: 'vertical',
          animation: 'slide_from_bottom',
          title: '리뷰 신고하기',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#333',
          },
          headerLeft: () => (
            <Pressable
              onPress={() => {
                navigation.goBack();
              }}
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
