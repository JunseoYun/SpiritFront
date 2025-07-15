import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, Text, SafeAreaView, BackHandler} from 'react-native';
import {useRoute} from '@react-navigation/native';

const ManagerStoreInfoScreen = ({navigation}) => {
  const route = useRoute();

  const {storeId, storeName} = route.params;
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
      <Text>
        ManagerStoreInfo, {storeId}, {storeName}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default ManagerStoreInfoScreen;
