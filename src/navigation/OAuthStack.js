import React from 'react';
import {Pressable, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createStackNavigator} from '@react-navigation/stack';
import OAuthLoginScreen from '../screens/OAuth/OAuthLoginScreen';
import RegisterScreen from '../screens/OAuth/RegisterScreen';
import AgreeScreen from '../screens/OAuth/AgreeScreen';
import TermsAgreeScreen from '../screens/OAuth/TermsAgreeScreen';
import PrivacyAgreeScreen from '../screens/OAuth/PrivacyAgreeScreen';
import LocationAgreeScreen from '../screens/OAuth/LocationAgreeScreen';
import IdentityScreen from '../screens/OAuth/IdentityScreen';
import Service from '../components/IdentityScreen/Policy/Service';
import CarrierUse from '../components/IdentityScreen/Policy/CarrierUse';
import PersonalInfo from '../components/IdentityScreen/Policy/PersonalInfo';
import UniqueNumber from '../components/IdentityScreen/Policy/UniqueNumber';
import ThirdPartyInfo from '../components/IdentityScreen/Policy/ThirdPartyInfo';

import MainBtmbar from './MainBtmbar';
import {normalizeFont} from '../hooks/normalizeFont';
import CustomText from '../utils/CustomText';
const Stack = createStackNavigator();

export default function OAuthStack({isTestEnabled}) {
  return (
    <Stack.Navigator initialRouteName="OAuthLoginScreen">
      <Stack.Screen name="OAuthLoginScreen" options={{headerShown: false}}>
        {props => <OAuthLoginScreen {...props} isTestEnabled={isTestEnabled} />}
      </Stack.Screen>

      <Stack.Screen
        name="MainBtmbar"
        component={MainBtmbar}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="IdentityScreen"
        component={IdentityScreen}
        options={({navigation}) => ({
          animation: 'default',
          headerShown: true, // 명시적으로 표시
          headerTransparent: true,
          title: '',
          headerStyle: {
            backgroundColor: 'transparent', // ✅ 배경 제거
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
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
        name="RegisterScreen"
        options={{headerShown: false}}
        component={RegisterScreen}
      />
      <Stack.Screen
        name="AgreeScreen"
        options={{headerShown: false}}
        component={AgreeScreen}
      />
      <Stack.Screen
        name="TermsAgreeScreen"
        component={TermsAgreeScreen}
        options={({navigation}) => ({
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
              한잔할까 서비스 이용약관
            </CustomText>
          ),
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
        name="PrivacyAgreeScreen"
        component={PrivacyAgreeScreen}
        options={({navigation}) => ({
          title: '개인정보 처리방침',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="LocationAgreeScreen"
        component={LocationAgreeScreen}
        options={({navigation}) => ({
          title: '위치정보 이용약관',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
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
        name="PersonalInfo"
        component={PersonalInfo}
        options={({navigation}) => ({
          headerTitleAlign: 'center',
          animation: 'slide_from_bottom',
          headerTitle: () => (
            <CustomText
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: 18,
                color: '#333',
              }}
              // 확실하게 폰트 스케일 차단
            >
              개인정보 수집/이용 동의
            </CustomText>
          ),
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
        name="UniqueNumber"
        component={UniqueNumber}
        options={({navigation}) => ({
          headerTitleAlign: 'center',
          animation: 'slide_from_bottom',
          headerTitle: () => (
            <CustomText
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: 18,
                color: '#333',
              }}
              // 확실하게 폰트 스케일 차단
            >
              고유식별번호 처리 동의
            </CustomText>
          ),
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
        name="CarrierUse"
        component={CarrierUse}
        options={({navigation}) => ({
          headerTitleAlign: 'center',
          animation: 'slide_from_bottom',
          headerTitle: () => (
            <CustomText
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: 18,
                color: '#333',
              }}
              // 확실하게 폰트 스케일 차단
            >
              통신사 이용약관 동의
            </CustomText>
          ),
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
        name="Service"
        component={Service}
        options={({navigation}) => ({
          headerTitleAlign: 'center',
          animation: 'slide_from_bottom',
          headerTitle: () => (
            <CustomText
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: 18,
                color: '#333',
              }}
              // 확실하게 폰트 스케일 차단
            >
              서비스 이용약관 동의
            </CustomText>
          ),
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
        name="ThirdPartyInfo"
        component={ThirdPartyInfo}
        options={({navigation}) => ({
          headerTitleAlign: 'center',
          animation: 'slide_from_bottom',
          headerTitle: () => (
            <CustomText
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: 18,
                color: '#333',
              }}
              // 확실하게 폰트 스케일 차단
            >
              개인정보 제3자 제공 동의
            </CustomText>
          ),
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
