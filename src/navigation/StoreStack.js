import React from 'react';
import {Pressable, Text, Dimensions} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {createStackNavigator} from '@react-navigation/stack';
import Octicons from 'react-native-vector-icons/Octicons';

import StoreMainScreen from '../screens/StoreInfo/StoreMainScreen';
import StoreMapScreen from '../screens/StoreInfo/StoreMapScreen';
import StoreReviewScreen from '../screens/StoreInfo/StoreReviewScreen';
import StoreReportScreen from '../screens/StoreInfo/Report/StoreReportScreen';
import ReviewReportScreen from '../screens/StoreInfo/Report/ReviewReportScreen';
import StoreReportList from '../screens/StoreInfo/Report/StoreReportList';
import StoreTimeEditScreen from '../screens/StoreInfo/StoreTimeEditScreen';
import AlcoholEditScreen from '../screens/StoreInfo/Alcohol/AlcohoEditScreen';
import UpdateStoreDrink from '../components/UpdateBottomSheet/UpdateStoreDrink';
import MenuEditScreen from '../screens/StoreInfo/Menu/MenuEditScreen';
import ImageReorderScreen from '../components/StoreScreen/StoreImage/ImageReorderScreen';
import InfoImageEditScreen from '../screens/StoreInfo/InfoImageEditScreen';
import {getGlobalShowAlert} from '../context/CustomAlertContext';
import ImageViewerScreen from '../hooks/ImageViewerScreen';
import ManagerStoreInfoScreen from '../screens/BottomTab/My/ManagerStoreInfoScreen';
import StoreManagerScreen from '../screens/StoreManager/StoreManagerScreen';
import StoreOrderScreen from '../screens/StoreOrder/StoreOrderScreen';
import StorePaymentScreen from '../screens/StoreOrder/StorePaymentScreen';
import StoreUpdateScreen from '../screens/StoreInfo/StoreUpdateScreen';
import StoreManageScreen from '../screens/StoreInfo/StoreManage/StoreManageScreen';
const Stack = createStackNavigator();

export default function StoreStack() {
  const screenWidth = Dimensions.get('window').width;
  const showAlert = getGlobalShowAlert();

  return (
    <Stack.Navigator initialRouteName="StoreMainScreen">
      <Stack.Screen
        name="StoreMainScreen"
        component={StoreMainScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StoreOrderScreen"
        component={StoreOrderScreen}
        options={({navigation, route}) => {
          const storeName = route.params?.storeName;
          const title = storeName ? `${storeName} 주문` : '주문 진행하기';
          return {
            title,
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontFamily: 'Pretendard-SemiBold',
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
          };
        }}
      />
      <Stack.Screen
        name="StorePaymentScreen"
        component={StorePaymentScreen}
        options={({navigation, route}) => {
          const storeName = route.params?.storeName;
          const title = storeName ? `${storeName} 주문내역` : '주문내역';
          return {
            title,
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontFamily: 'Pretendard-SemiBold',
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
          };
        }}
      />
      <Stack.Screen
        name="ImageViewerScreen"
        component={ImageViewerScreen}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="StoreUpdateScreen"
        component={StoreUpdateScreen}
        options={({navigation}) => ({
          title: '매장 수정',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-SemiBold',
            fontSize: 18,
            color: '#333',
          },
        })}
      />
      <Stack.Screen
        name="StoreManageScreen"
        component={StoreManageScreen}
        options={{headerShown: false}}
      />

      <Stack.Screen
        name="StoreTimeEditScreen"
        component={StoreTimeEditScreen}
        options={({navigation}) => ({
          title: '영업 시간 수정',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-SemiBold',
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
            fontFamily: 'Pretendard-SemiBold',
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
        name="MenuEditScreen"
        component={MenuEditScreen}
        options={({navigation}) => ({
          title: '메뉴 관리',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-SemiBold',
            fontSize: 18,
            color: '#333',
          },
          headerShadowVisible: false,
          headerStyle: {
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
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
        name="AlcoholEditScreen"
        component={AlcoholEditScreen}
        options={({navigation}) => ({
          title: '주류 관리',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-SemiBold',
            fontSize: 18,
            color: '#333',
          },
          headerShadowVisible: false,
          headerStyle: {
            borderBottomWidth: 0,
            elevation: 0,
            shadowOpacity: 0,
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
        name="ImageReorderScreen"
        component={ImageReorderScreen}
        options={({navigation}) => ({
          title: '매장 이미지 순서 변경',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-SemiBold',
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
        options={({navigation, route}) => {
          const storename = route.params?.storename || '매장';
          const displayTitle = storename + ' 길찾기';

          return {
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
            headerTitle: () => (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard-SemiBold',
                  maxWidth: screenWidth * 0.7,
                  textAlign: 'center',
                }}>
                {displayTitle}
              </Text>
            ),
            headerTitleAlign: 'center',
            gestureDirection: 'vertical',
            animation: 'slide_from_bottom',
          };
        }}
      />
      <Stack.Screen
        name="StoreReviewScreen"
        component={StoreReviewScreen}
        options={({navigation, route}) => {
          const storename = route.params?.storename || '매장';
          const displayTitle = storename + ' 리뷰';

          return {
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
            headerTitle: () => (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard-SemiBold',
                  maxWidth: screenWidth * 0.7,
                  textAlign: 'center',
                }}>
                {displayTitle}
              </Text>
            ),
            headerTitleAlign: 'center',
            animation: 'slide_from_right',
            headerShadowVisible: false,
          };
        }}
      />
      <Stack.Screen
        name="StoreReportList"
        component={StoreReportList}
        options={({navigation, route}) => {
          const storename = route.params?.storeName || '매장';
          const displayTitle = storename + ' 신고·제보';

          return {
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
            headerTitle: () => (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard-SemiBold',
                  maxWidth: screenWidth * 0.7,
                  textAlign: 'center',
                }}>
                {displayTitle}
              </Text>
            ),
            headerTitleAlign: 'center',
            animation: 'slide_from_right',
            headerShadowVisible: false,
          };
        }}
      />
      <Stack.Screen
        name="StoreReportScreen"
        component={StoreReportScreen}
        options={({navigation}) => ({
          title: '매장 신고하기',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'Pretendard-SemiBold',
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
                size={24}
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
            fontFamily: 'Pretendard-SemiBold',
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
        name="InfoImageEditScreen"
        component={InfoImageEditScreen}
        options={({navigation, route}) => {
          return {
            title: '메뉴판 편집',
            headerTitleAlign: 'center',
            headerTitleStyle: {
              fontFamily: 'Pretendard-SemiBold',
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
          };
        }}
      />
      <Stack.Screen
        name="ManagerStoreInfoScreen"
        component={ManagerStoreInfoScreen}
        options={({navigation, route}) => {
          const storename = route.params?.storename || '매장';
          const displayTitle = storename + ' 통계';

          return {
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
            headerTitle: () => (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard-SemiBold',
                  maxWidth: screenWidth * 0.7,
                  textAlign: 'center',
                }}>
                {displayTitle}
              </Text>
            ),
            headerTitleAlign: 'center',
            animation: 'slide_from_right',
            headerShadowVisible: false,
          };
        }}
      />
      <Stack.Screen
        name="StoreManagerScreen"
        component={StoreManagerScreen}
        options={({navigation, route}) => {
          const storename = route.params?.storename || '매장';
          const displayTitle = storename + ' 운영진';

          return {
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
            headerTitle: () => (
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={{
                  fontSize: 18,
                  fontFamily: 'Pretendard-SemiBold',
                  maxWidth: screenWidth * 0.7,
                  textAlign: 'center',
                }}>
                {displayTitle}
              </Text>
            ),
            headerTitleAlign: 'center',
            animation: 'slide_from_right',
            headerShadowVisible: false,
          };
        }}
      />
    </Stack.Navigator>
  );
}
