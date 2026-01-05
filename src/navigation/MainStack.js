import React from 'react';
import {Pressable, Text} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import MainBtmbar from './MainBtmbar';
import SetLocationScreen from '../screens/SetLocation/SetLocationScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import ChatbotScreen from '../screens/Chatbot/ChatbotScreen';

import LocationSearchScreen from '../screens/SetLocation/LocationSearchScreen';

import StoreSearchScreen from '../screens/StoreRegister/StoreSearchScreen';
import StoreAuthorityScreen from '../screens/StoreRegister/StoreAuthorityScreen';
import StoreAddressSearch from '../screens/StoreRegister/StoreAddressSearch';
import StoreAddTimeSetScreen from '../screens/StoreRegister/StoreAddTimeSetScreen';
import CategoryListTabbar from './CategoryListTabbar';
import StoreStack from './StoreStack';
import MyStack from './MyStack';
import OAuthStack from './OAuthStack';
import StoreAddMapScreen from '../screens/StoreRegister/StoreAddMapScreen';
import StoreAddPhotoScreen from '../screens/StoreRegister/StoreAddList/StoreAddPhotoScreen';
import StoreOwnershipScreen from '../screens/StoreRegister/StoreOwnershipScreen';
import StoreSuggestionScreen from '../screens/StoreRegister/StoreSuggestion/StoreSuggestionScreen';
import StoreSuggestionDetailScreen from '../screens/StoreRegister/StoreSuggestion/StoreSuggestionDetailScreen';
import StoreAddInfoScreen from '../screens/StoreRegister/StoreAddList/StoreAddInfoScreen';
import LocataionMapScreen from '../screens/SetLocation/LocataionMapScreen';
import OpenStoreScreen from '../screens/TotalScreen/OpenStoreScreen';
import NearStoreScreen from '../screens/TotalScreen/NearStoreScreen';
import ViewedStoreScreen from '../screens/TotalScreen/ViewedStoreScreen';
import SearchScreen from '../screens/Search/SearchScreen';
import NotificationScreen from '../screens/Notification/NotificationScreen';
import NotificationSetScreen from '../screens/Notification/NotificationSetScreen';
import OrderDetailScreen from '../screens/BottomTab/Order/OrderDetailScreen';
import {normalizeFont} from '../hooks/normalizeFont';
import CustomText from '../utils/CustomText';
import PostDetailScreen from '../screens/PostScreen/PostDetailScreen';
import PostPhotoSelectScreen from '../screens/PostScreen/PostPhotoSelectScreen';
import PostStoreInputScreen from '../screens/PostScreen/PostStoreInputScreen';
import PostWriteScreen from '../screens/PostScreen/PostWriteScreen';
import MyPostDetailScreen from '../screens/BottomTab/My/MyPostDetailScreen';
import MyPostEditScreen from '../screens/BottomTab/My/MyPostEditScreen';
import LikeSavedPostDetailScreen from '../screens/BottomTab/LikeSavedPostDetailScreen';

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
        name="ChatbotScreen"
        component={ChatbotScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PostDetailScreen"
        component={PostDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PostPhotoSelectScreen"
        component={PostPhotoSelectScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="PostStoreInputScreen"
        component={PostStoreInputScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MyPostDetailScreen"
        component={MyPostDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="MyPostEditScreen"
        component={MyPostEditScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="LikeSavedPostDetailScreen"
        component={LikeSavedPostDetailScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="PostWriteScreen"
        component={PostWriteScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SearchScreen"
        component={SearchScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SetLocationScreen"
        component={SetLocationScreen}
        options={({navigation}) => ({
          title: '내 위치 변경',
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
            fontFamily: 'Pretendard-SemiBold',
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
        name="StoreOwnershipScreen"
        component={StoreOwnershipScreen}
        options={({navigation, route}) => ({
          title: `매장 등록`,
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
          },
        })}
      />

      <Stack.Screen
        name="StoreSuggestionScreen"
        component={StoreSuggestionScreen}
        options={({navigation, route}) => ({
          title: `매장 제보`,
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
        name="StoreSuggestionDetailScreen"
        component={StoreSuggestionDetailScreen}
        options={({navigation, route}) => ({
          title: `${route.params?.storename} 매장 제보`,
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
          headerTitleAlign: 'center',
          headerTitle: () => (
            <CustomText
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: 18,
                color: '#333',
              }}
              // 확실하게 폰트 스케일 차단
            >
              {route.params?.index === 0
                ? '매장 제보 조회'
                : '사장님 인증 조회'}
            </CustomText>
          ),
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
          headerTitleAlign: 'center',
          headerTitle: () => (
            <CustomText
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: 18,
                color: '#333',
              }}>
              사장님 인증 신청
            </CustomText>
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
        name="MyStack"
        component={MyStack}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="OpenStoreScreen"
        component={OpenStoreScreen}
        options={({navigation}) => ({
          title: '영업 중인 술집',
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
        name="NearStoreScreen"
        component={NearStoreScreen}
        options={({navigation}) => ({
          title: '가까운 술집',
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
        name="ViewedStoreScreen"
        component={ViewedStoreScreen}
        options={({navigation}) => ({
          title: '최근 본 매장',
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
        name="NotificationScreen"
        component={NotificationScreen}
        options={({navigation}) => ({
          title: '알림',
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
          headerRight: () => (
            <Pressable
              onPress={() => navigation.navigate('NotificationSetScreen')}
              hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
              <AntDesign
                name="setting"
                size={23}
                color="#333"
                style={{paddingRight: 14}}
              />
            </Pressable>
          ),
        })}
      />

      <Stack.Screen
        name="NotificationSetScreen"
        component={NotificationSetScreen}
        options={({navigation}) => ({
          title: '알림 설정',
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
        name="OrderDetailScreen"
        component={OrderDetailScreen}
        options={({navigation}) => ({
          title: '주문 상세',
          headerTitleAlign: 'center',
          headerTitleStyle: {fontFamily: 'Pretendard-Bold', fontSize: 18},
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
