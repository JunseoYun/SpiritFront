import React, {useState, useLayoutEffect} from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import {useRoute} from '@react-navigation/native';
import StoreAuthorityData from '../../components/StoreAuthority/StoreAuthorityData';
import StoreAddress from '../../components/StoreAddScreen/StoreAddress';
import ProgressBar from '../../components/StoreAuthority/ProgressBar';
const StoreCheckScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, storeName, storeAddress, storeAddressDetail, storeContact} =
    route.params;

  const [storeData, setStoreData] = useState({
    storeId,
    storeName,
    storeNumber: storeContact,
  });
  const [storeAddressData, setStoreAddressData] = useState({
    storeAddress,
    storeAddressDetail,
  });

  const handleAddressSelect = ({address, coords}) => {
    setStoreAddressData(prevData => ({
      ...prevData,
      storeAddress: address,
    }));
  };

  const handleNext = () => {
    navigation.navigate('StoreAuthorityScreen', {storeData});
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleNext}>
          <Text style={styles.searchButton}>다음</Text>
        </Pressable>
      ),
    });
  }, [navigation]);

  return (
    <SafeAreaView style={styles.storetopview}>
      {/* 진행 바: 50% 진행 */}
      <ProgressBar progress={0} />

      <StoreAuthorityData storeData={storeData} setStoreData={setStoreData} />
      <StoreAddress
        address={storeAddressData.storeAddress}
        detailedAddress={storeAddressData.storeAddressDetail}
        setDetailedAddress={value =>
          setStoreAddressData(prevData => ({
            ...prevData,
            storeAddressDetail: value,
          }))
        }
        navigation={navigation}
        onAddressSelect={handleAddressSelect}
        index={1}
      />
      <Text style={styles.title}>신청하려는 매장의 정보를 확인해주세요.</Text>

      <Pressable style={styles.savebutton} onPress={handleNext}>
        <Text style={styles.savebuttontext}>다음</Text>
      </Pressable>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  storetopview: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  title: {
    marginTop: 30,
    marginHorizontal: 18,
    color: '#999',
    fontWeight: '500',
    fontSize: 16,
  },
  searchButton: {
    marginRight: 18,
    fontSize: 19,
    fontWeight: '600',
    color: '#16BBFF',
  },
  savebutton: {
    marginTop: 150,
    alignSelf: 'center',
    alignItems: 'center',
    width: '90%',
    marginVertical: 7,
    backgroundColor: '#16BBFF',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 30,
  },
  savebuttontext: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

export default StoreCheckScreen;
