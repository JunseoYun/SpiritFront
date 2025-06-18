import React from 'react';
import {Pressable} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import MainBtmbar from './MainBtmbar';
import SetLocationScreen from '../screens/SetLocation/SetLocationScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import LocationSearchScreen from '../screens/SetLocation/LocationSearchScreen';

import StoreSearchScreen from '../screens/StoreRegister/StoreSearchScreen';
import StoreCheckScreen from '../screens/StoreRegister/StoreCheckScreen';
import StoreAuthorityScreen from '../screens/StoreRegister/StoreAuthorityScreen';
import StoreAuthConfirm from '../screens/StoreRegister/StoreAuthConfirm';
import StoreAddressSearch from '../screens/StoreRegister/StoreAddressSearch';
import StoreAddTimeSetScreen from '../screens/StoreRegister/StoreAddTimeSetScreen';
import CategoryListTabbar from './CategoryListTabbar';
import StoreStack from './StoreStack';
import MyStack from './MyStack';
import OAuthStack from './OAuthStack';
import StoreAddMapScreen from '../screens/StoreRegister/StoreAddMapScreen';
import StoreAddCheckScreen from '../screens/StoreRegister/StoreAddList/StoreAddCheckScreen';
import StoreAddPhotoScreen from '../screens/StoreRegister/StoreAddList/StoreAddPhotoScreen';
import StoreAddInfoScreen from '../screens/StoreRegister/StoreAddList/StoreAddInfoScreen';
import LocataionMapScreen from '../screens/SetLocation/LocataionMapScreen';

const Stack = createStackNavigator();

export default function MainStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFF', // 헤더 배경색 (필요하면 수정)
          shadowColor: 'transparent', // iOS: 섀도우 없애기
          elevation: 0, // Android: 헤더 하단 선 없애기
        },
        headerTitleStyle: {
          fontFamily: 'Pretendard-Bold',
          fontSize: 18,
          color: '#333', // 헤더 제목 색상
        },
      }}>
      <Stack.Screen
        name="MainBtmbar"
        component={MainBtmbar}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="SetLocationScreen"
        component={SetLocationScreen}
        options={({navigation}) => ({
          title: '위치 설정',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="LocationSearchScreen"
        component={LocationSearchScreen}
        options={({navigation}) => ({
          title: '주소 검색',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="CategoryListTabbar"
        component={CategoryListTabbar}
        options={({navigation}) => ({
          title: '한잔할까',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          headerTitleStyle: {
            fontSize: 20, // 타이틀 크기 설정
            color: '#333', // 텍스트 색상 (선택 사항)
            fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
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
        name="StoreAddCheckScreen"
        component={StoreAddCheckScreen}
        options={({navigation}) => ({
          title: '매장 제보 1/3',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="StoreAddPhotoScreen"
        component={StoreAddPhotoScreen}
        options={({navigation, route}) => ({
          title: `${
            route.params?.index === 0 ? '매장 제보 1/2' : '매장 등록 1/2'
          }`,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="StoreAddInfoScreen"
        component={StoreAddInfoScreen}
        options={({navigation, route}) => ({
          title: `${
            route.params?.index === 0 ? '매장 제보 2/2' : '매장 등록 2/2'
          }`,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
          },
        })}
      />
      <Stack.Screen
        name="StoreAddressSearch"
        component={StoreAddressSearch}
        options={({navigation}) => ({
          title: '매장 주소 검색',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="StoreAddTimeSetScreen"
        component={StoreAddTimeSetScreen}
        options={({navigation}) => ({
          title: '영업 시간',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="StoreSearchScreen"
        component={StoreSearchScreen}
        options={({navigation, route}) => ({
          title: `${
            route.params?.index === 0 ? '매장 제보 조회' : '사장님 인증 조회'
          }`,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="StoreCheckScreen"
        component={StoreCheckScreen}
        options={({navigation}) => ({
          title: '사장님 인증 신청 1/3',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="StoreAuthorityScreen"
        component={StoreAuthorityScreen}
        options={({navigation}) => ({
          title: '사장님 인증 신청 2/3',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="StoreAuthConfirm"
        component={StoreAuthConfirm}
        options={({navigation}) => ({
          title: '사장님 인증 신청 3/3',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="StoreStack"
        component={StoreStack}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OAuthStack"
        component={OAuthStack}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="StoreAddMapScreen"
        component={StoreAddMapScreen}
        options={({navigation}) => ({
          title: '주소 설정',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="LocataionMapScreen"
        component={LocataionMapScreen}
        options={({navigation}) => ({
          title: '주소 설정',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="MyStack"
        component={MyStack}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
