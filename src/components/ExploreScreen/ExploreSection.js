// ExploreSection.js
import React, {useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import TodayRecomm from './TodayRecomm/TodayRecomm';
import CategoryGrid from './Category/CategoryGrid';
import StoreRegister from './StoreRegister';
import OpenStoreList from './CurrentOpenStore/OpenStoreList';
import NearStoreList from './NearStore/NearStoreList';
import ViewedStoreList from './ViewedStore/ViewedStoreList';
import MyBanner from '../Ads/MyBanner';
import CustomText from '../../utils/CustomText';

const ExploreSection = ({
  recommCategory,
  recommReason,
  recommStores,
  location,
  isRefreshing,
  navigation,
  loading,
  handlestoreItemClick,
  catagoryClick,
  onHeaderLayout = () => {},
}) => {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        // borderTopLeftRadius: 18,
        // borderTopRightRadius: 18,
        // paddingTop: 14,
        // shadowColor: '#000',
        // shadowOffset: {width: 0, height: -3}, // 👈 위쪽 방향
        // shadowOpacity: 0.15,
        // shadowRadius: 3,
        // elevation: 3,
      }}>
      {/* <TodayRecomm
        recommCategory={recommCategory}
        recommReason={recommReason}
        recommStores={recommStores}
        location={location}
        refresh={isRefreshing}
        navigation={navigation}
        loading={loading}
      /> */}
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
