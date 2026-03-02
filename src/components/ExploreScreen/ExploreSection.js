// ExploreSection.js
import React, {useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import TodayRecomm from './TodayRecomm/TodayRecomm';
import CategoryGrid from './Category/CategoryGrid';
import StoreRegister from './StoreRegister';
import OpenStoreList from './CurrentOpenStore/OpenStoreList';
import NearStoreList from './NearStore/NearStoreList';
import ViewedStoreList from './ViewedStore/ViewedStoreList';

import CustomText from '../../utils/CustomText';

const ExploreSection = ({
  location,
  isRefreshing,
  navigation,
  handlestoreItemClick,
  catagoryClick,
  onHeaderLayout = () => {},
}) => {
  return (
    <View
      style={{
        backgroundColor: '#fff',
      }}>
      <CategoryGrid onPress={catagoryClick} />

      <StoreRegister handlestoreItemClick={handlestoreItemClick} />

      <ViewedStoreList
        location={location}
        navigation={navigation}
        refresh={isRefreshing}
      />

      <OpenStoreList
        location={location}
        navigation={navigation}
        refresh={isRefreshing}
      />
      <NearStoreList
        navigation={navigation}
        location={location}
        refresh={isRefreshing}
      />
      <View style={[styles.division, {marginTop: 20}]} />
      <View
        style={{
          backgroundColor: '#fff',
          paddingLeft: 20,
          paddingTop: 20,
          paddingBottom: 10,
        }}
        onLayout={e => {
          const {height} = e.nativeEvent.layout;
          onHeaderLayout(height);
        }}>
        <CustomText
          style={{
            fontSize: 18,
            fontFamily: 'Pretendard-SemiBold',
            color: '#181a1a',
            marginBottom: 10,
          }}>
          현재 인기 매장
        </CustomText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  division: {
    width: '100%',
    height: 10,
    backgroundColor: '#F5F5F5',
    marginTop: 5,
  },
});

export default React.memo(ExploreSection);
