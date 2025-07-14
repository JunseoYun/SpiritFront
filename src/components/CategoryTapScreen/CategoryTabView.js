import React, {useState} from 'react';
import {View, useWindowDimensions} from 'react-native';
import {TabView, SceneMap, TabBar} from 'react-native-tab-view';
import CategoryTapScreen from '../../screens/CategoryTap/CategoryTapScreen';
const categories = [
  {key: 'IZAKAYA', title: '이자카야'},
  {key: 'KOREAN', title: '한식'},
  {key: 'WESTERN', title: '양식'},
  {key: 'CHINESE', title: '중식'},
  {key: 'GAMSEONG', title: '감성주점'},
  {key: 'GRILLED_STEW', title: '구이 찜'},
  {key: 'CHICKEN_HOF', title: '치킨 호프'},
  {key: 'RAW_SEAFOOD', title: '회 해산물'},
  {key: 'PUB_BAR', title: '펍 바'},
  {key: 'POCHA', title: '포장마차'},
];

const CategoryTabView = ({location}) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  const routes = categories.map(c => ({key: c.key, title: c.title}));
  const renderScene = SceneMap(
    categories.reduce((acc, cur) => {
      acc[cur.key] = () => (
        <CategoryTapScreen categoryname={cur.key} location={location} />
      );
      return acc;
    }, {}),
  );

  return (
    <TabView
      navigationState={{index, routes}}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{width: layout.width}}
      renderTabBar={props => (
        <TabBar
          {...props}
          scrollEnabled
          indicatorStyle={{backgroundColor: '#45C9FF'}}
          style={{backgroundColor: 'white'}}
          activeColor="#45C9FF"
          inactiveColor="#c0c0c0"
          labelStyle={{fontFamily: 'Pretendard-Bold', fontSize: 14}}
        />
      )}
    />
  );
};

export default CategoryTabView;
