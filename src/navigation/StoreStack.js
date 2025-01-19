import React from 'react';
import {Alert, Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createStackNavigator} from '@react-navigation/stack';

import StoreMainScreen from '../screens/StoreInfo/StoreMainScreen';
import MenuAddScreen from '../screens/StoreInfo/MenuAddScreen';
import UpdateMenuScreen from '../screens/StoreInfo/UpdateMenuScreen';
import UpdateStoreScreen from '../screens/StoreInfo/UpdateStoreScreen';
import StoreMapScreen from '../screens/StoreInfo/StoreMapScreen';
import AlcoholAddScreen from '../screens/StoreInfo/AlcoholAddScreen';
import useAlert from '../hooks/useAlert';

const Stack = createStackNavigator();

const {showAlert} = useAlert();

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
        options={({navigation}) => ({
          title: '메뉴 등록하기',
          headerLeft: () => (
            <Pressable
              onPress={() => {
                showAlert(
                  '작성한 내용이 저장되지 않았습니다',
                  `뒤로 가시겠습니까?`,
                  () => {
                    navigation.goBack();
                  },
                  null,
                );
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
        name="AlcoholAddScreen"
        component={AlcoholAddScreen}
        options={({navigation}) => ({
          title: '주류 등록하기',
          headerLeft: () => (
            <Pressable
              onPress={() => {
                showAlert(
                  '작성한 내용이 저장되지 않았습니다',
                  `뒤로 가시겠습니까?`,
                  () => {
                    navigation.goBack();
                  },
                  null,
                );
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
