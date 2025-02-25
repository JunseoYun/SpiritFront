import React, {useState, useEffect} from 'react';
import {View, Text} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import CategoryTapScreen from '../screens/CategoryTap/CategoryTapScreen';
import {getLocation} from '../storage/locationStorage';

const categories = [
  {name: 'IZAKAYA', title: '이자카야', categoryname: 'IZAKAYA'},
  {name: 'KOREAN', title: '한식', categoryname: 'KOREAN'},
  {name: 'WESTERN', title: '양식', categoryname: 'WESTERN'},
  {name: 'CHINESE', title: '중식', categoryname: 'CHINESE'},
  {name: 'GAMSEONG', title: '감성주점', categoryname: 'GAMSEONG'},
  {name: 'GRILLED_STEW', title: '구이 찜', categoryname: 'GRILLED_STEW'},
  {name: 'CHICKEN_HOF', title: '치킨 호프', categoryname: 'CHICKEN_HOF'},
  {name: 'RAW_SEAFOOD', title: '회 해산물', categoryname: 'RAW_SEAFOOD'},
  {name: 'PUB_BAR', title: '펍 바', categoryname: 'PUB_BAR'},
  {name: 'POCHA', title: '포장마차', categoryname: 'POCHA'},
];

const Tab = createMaterialTopTabNavigator();

const CategoryListTabbar = ({route}) => {
  const [location, setLocation] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const currentLocation = await getLocation();
        setLocation(currentLocation);
      } catch (error) {
        console.error('초기 로드 오류:', error);
      }
    };
    fetchLocation();
  }, []);

  const {screen} = route.params || {}; // 전달받은 screen과 location

  if (!location) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text
          style={{
            fontFamily: 'Hakgyoansim Dunggeunmiso TTF B',
            fontSize: 20,
            color: '#333',
          }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName={screen}
      screenOptions={{
        lazy: true,
        lazyPreloadDistance: 0,
        tabBarScrollEnabled: true,
        tabBarItemStyle: {width: 100},
        swipeEnabled: true,
        unmountOnBlur: false,
        tabBarActiveTintColor: '#80D2F4', // 선택된 탭 글자 색상
        tabBarIndicatorStyle: {
          backgroundColor: '#80D2F4', // 선택된 탭 아래의 인디케이터 색상
        },
        tabBarInactiveTintColor: '#CFCFCF', // 선택되지 않은 탭 글자 색상
        tabBarLabelStyle: {
          fontWeight: 'bold', // 글씨 두껍게
          fontSize: 16, // 글씨 크기 조정
        },
      }}>
      {categories.map(({name, title, categoryname}) => (
        <Tab.Screen
          key={name}
          name={name}
          component={CategoryTapScreen}
          options={{title}}
          initialParams={{categoryname, location}} // categoryname 전달
        />
      ))}
    </Tab.Navigator>
  );
};

export default CategoryListTabbar;
