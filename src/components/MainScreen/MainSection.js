// MainSection.js
import React, {useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import TodayRecomm from '../../components/MainScreen/TodayRecomm/TodayRecomm';
import CategoryGrid from '../../components/MainScreen/Category/CategoryGrid';
import StoreRegister from '../../components/MainScreen/StoreRegister';
import OpenStoreList from '../../components/MainScreen/CurrentOpenStore/OpenStoreList';
import NearStoreList from '../../components/MainScreen/NearStore/NearStoreList';
import ViewedStoreList from './ViewedStore/ViewedStoreList';
import MyBanner from '../Ads/MyBanner';

const MainSection = ({
  recommCategory,
  recommReason,
  recommStores,
  location,
  isRefreshing,
  navigation,
  loading,
  handlestoreItemClick,
  catagoryClick,
}) => {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 24,
      }}>
      <TodayRecomm
        recommCategory={recommCategory}
        recommReason={recommReason}
        recommStores={recommStores}
        location={location}
        refresh={isRefreshing}
        navigation={navigation}
        loading={loading}
      />
      <CategoryGrid onPress={catagoryClick} />

      <StoreRegister handlestoreItemClick={handlestoreItemClick} />
      <ViewedStoreList
        location={location}
        navigation={navigation}
        refresh={isRefreshing}
      />

      <MyBanner index={'main'} />

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

export default React.memo(MainSection);
