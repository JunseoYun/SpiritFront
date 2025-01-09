import React, {useState, useEffect} from 'react';
import { View, Text } from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import CategoryTapScreen from '../screens/CategoryTap/CategoryTapScreen';
import { getLocation } from '../storage/locationStorage';

const categories = [
  {name: 'Izakaya', title: '이자카야', categoryname: 'IZAKAYA'},
  {name: 'Koreafood', title: '한식주점', categoryname: 'KOREAN'},
  {name: 'Westernfood', title: '양식주점', categoryname: 'WESTERN'},
  {name: 'Chinesefood', title: '중화주점', categoryname: 'CHINESE'},
  {name: 'Emotional', title: '감성주점', categoryname: 'GAMSEONG'},
  {name: 'Jokbal', title: '족발 보쌈', categoryname: 'JOGBO'},
  {name: 'Steamedfood', title: '찜 찌개', categoryname: 'STEW'},
  {name: 'Grilled', title: '구이 탕', categoryname: 'GRILLED'},
  {name: 'Chicken', title: '치킨', categoryname: 'CHICKEN'},
  {name: 'Pancake', title: '전 막걸리', categoryname: 'JEONMAK'},
  {name: 'Dried', title: '마른안주', categoryname: 'DRIED'},
  {name: 'Seafood', title: '해산물', categoryname: 'SEAFOOD'},
  {name: 'Room', title: '룸', categoryname: 'ROOM'},
  {name: 'Group', title: '단체 행사', categoryname: 'GROUP'},
  {name: 'Yajang', title: '야장', categoryname: 'OUTDOOR'},
  {name: 'Pocha', title: '포차', categoryname: 'POCHA'},
  {name: 'Hope', title: '호프', categoryname: 'HOF'},
  {name: 'Winebar', title: '와인바', categoryname: 'WINE'},
  {name: 'Cocktail', title: '칵테일', categoryname: 'COCKTAIL'},
  {name: 'Pupbar', title: '펍 바', categoryname: 'PUBBAR'},
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
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName={screen}
      screenOptions={{
        tabBarScrollEnabled: true,
        tabBarItemStyle: {width: 100},
        swipeEnabled: true,
        tabBarActiveTintColor: '#80D2F4', // 선택된 탭 글자 색상
        tabBarIndicatorStyle: {
          backgroundColor: '#80D2F4', // 선택된 탭 아래의 인디케이터 색상
        },
        tabBarInactiveTintColor: '#CFCFCF', // 선택되지 않은 탭 글자 색상
        tabBarLabelStyle: {
          fontWeight: 'bold', // 글씨 두껍게
          fontSize: 16,       // 글씨 크기 조정
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
