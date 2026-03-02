import React, {useState, useEffect, useCallback} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {View, BackHandler, Text, PixelRatio} from 'react-native';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import CategoryTapScreen from '../screens/CategoryTap/CategoryTapScreen';
import {getLocation} from '../storage/locationStorage';
import Loading from '../hooks/Loading';
import {AlcoholFilterProvider} from '../context/AlcoholFilterContext';
import FilterBar from '../components/CategoryTapScreen/FilterBar';
import {MaterialTopTabBar} from '@react-navigation/material-top-tabs';
import CustomText from '../utils/CustomText';

const categories = [
  {name: 'IZAKAYA', title: '이자카야', categoryname: 'IZAKAYA'},
  {name: 'KOREAN', title: '한식', categoryname: 'KOREAN'},
  {name: 'WESTERN', title: '양식', categoryname: 'WESTERN'},
  {name: 'CHINESE', title: '중식', categoryname: 'CHINESE'},
  {name: 'POCHA', title: '포장마차', categoryname: 'POCHA'},
  {name: 'GAMSEONG', title: '감성주점', categoryname: 'GAMSEONG'},
  {name: 'GRILLED_STEW', title: '구이·찜', categoryname: 'GRILLED_STEW'},
  {name: 'CHICKEN_HOF', title: '치킨·호프', categoryname: 'CHICKEN_HOF'},
  {name: 'RAW_SEAFOOD', title: '회 해산물', categoryname: 'RAW_SEAFOOD'},
  {name: 'PUB_BAR', title: '펍·바', categoryname: 'PUB_BAR'},
];

const Tab = createMaterialTopTabNavigator();

// ✅ 커스텀 탭바 컴포넌트
const CustomTabBar = props => {
  return (
    <View>
      <MaterialTopTabBar {...props} />
      <FilterBar />
    </View>
  );
};

const CategoryListTabbar = ({route}) => {
  const [location, setLocation] = useState(null);
  const navigation = useNavigation();

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

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.goBack();
        return true;
      };
      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );
      return () => backHandler.remove();
    }, [navigation]),
  );

  const {screen} = route.params || {};

  if (!location) {
    return <Loading loading={true} />;
  }

  return (
    <AlcoholFilterProvider>
      <Tab.Navigator
        initialRouteName={screen}
        tabBar={props => <CustomTabBar {...props} />} // 👈 커스텀 탭바 적용
        screenOptions={{
          lazy: true,
          tabBarScrollEnabled: true,
          tabBarItemStyle: {width: 90},
          swipeEnabled: true,
          unmountOnBlur: false,
          tabBarActiveTintColor: '#3CBBFF',
          tabBarIndicatorStyle: {backgroundColor: '#3CBBFF'},
          tabBarInactiveTintColor: '#CFCFCF',
          tabBarLabelStyle: {
            fontFamily: 'Pretendard-Bold',
            fontSize: 16,
          },
          swipeDistanceThreshold: 150,
          swipeVelocityImpact: 0.7,
        }}>
        {categories.map(({name, title, categoryname}) => (
          <Tab.Screen
            key={name}
            name={name}
            component={CategoryTapScreen}
            options={{
              tabBarLabel: ({color}) => {
                const fontSize = 15;
                return (
                  <CustomText
                    maxScale={1.1}
                    style={{
                      color,
                      fontFamily: 'Pretendard-SemiBold',
                      fontSize,
                    }}>
                    {title}
                  </CustomText>
                );
              },
            }}
            initialParams={{categoryname, location}}
          />
        ))}
      </Tab.Navigator>
    </AlcoholFilterProvider>
  );
};

export default CategoryListTabbar;
