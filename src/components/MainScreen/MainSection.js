// MainSection.js
import React from 'react';
import {View, StyleSheet, Text} from 'react-native';
import TodayRecomm from '../../components/MainScreen/TodayRecomm/TodayRecomm';
import CategoryGrid from '../../components/MainScreen/Category/CategoryGrid';
import StoreRegister from '../../components/MainScreen/StoreRegister';
import OpenStoreList from '../../components/MainScreen/CurrentOpenStore/OpenStoreList';
import NearStoreList from '../../components/MainScreen/NearStore/NearStoreList';
import ViewedStoreList from './ViewedStore/ViewedStoreList';

const MainSection = ({
  recommCategory,
  recommReason,
  recommStores,
  location,
  isRefreshing,
  navigation,
  loading,
  storeactiveIndex,
  handlestoreItemClick,
  setIsRefreshing,
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

      <StoreRegister
        storeactiveIndex={storeactiveIndex}
        handlestoreItemClick={handlestoreItemClick}
      />
      <ViewedStoreList
        location={location}
        navigation={navigation}
        refresh={isRefreshing}
        setRefresh={setIsRefreshing}
      />
      <View style={[styles.division, {marginTop: 10}]} />
      <OpenStoreList
        location={location}
        navigation={navigation}
        refresh={isRefreshing}
        setRefresh={setIsRefreshing}
      />
      <NearStoreList
        navigation={navigation}
        location={location}
        refresh={isRefreshing}
        setRefresh={setIsRefreshing}
      />
      <View style={[styles.division, {marginTop: 20}]} />
      {/* <View
        style={{
          marginLeft: 20,
          marginTop: 20,
          marginBottom: 10,
        }}>
        <Text
          style={{
            fontSize: 18,
            fontFamily: 'Pretendard-SemiBold',
            color: '#181a1a',
          }}>
          현재 인기 매장
        </Text>
      </View> */}
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
