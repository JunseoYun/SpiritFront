import React from 'react';
import {Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createStackNavigator} from '@react-navigation/stack';

import OAuthLoginScreen from '../screens/OAuth/OAuthLoginScreen';
import RegisterScreen from '../screens/OAuth/RegisterScreen';
import AgreeScreen from '../screens/OAuth/AgreeScreen';
import TermsAgreeScreen from '../screens/OAuth/TermsAgreeScreen';
import PrivacyAgreeScreen from '../screens/OAuth/PrivacyAgreeScreen';
import LocationAgreeScreen from '../screens/OAuth/LocationAgreeScreen';

const Stack = createStackNavigator();

export default function OAuthStack() {
  return (
    <Stack.Navigator initialRouteName="OAuthLoginScreen">
      <Stack.Screen
        name="OAuthLoginScreen"
        options={{headerShown: false}}
        component={OAuthLoginScreen}
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
          title: '한잔할까 서비스 이용약관',
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
    </Stack.Navigator>
  );
}
