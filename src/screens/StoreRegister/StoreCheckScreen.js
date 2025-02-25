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
import ProgressBar from '../../components/StoreAuthority/ProgressBar';
import useCustomAlert from '../../hooks/useCustomAlert';
const StoreCheckScreen = ({navigation}) => {
  const route = useRoute();
  const {storeId, storeName, storeAddress, storeAddressDetail, storeContact} =
    route.params;

  const [storeData, setStoreData] = useState({
    storeId,
    storeName,
    storeNumber: storeContact,
    userName: '',
    userContact: '',
  });

  const {showAlert, AlertComponent} = useCustomAlert();

  const handleNext = () => {
    // 필수 storeData 확인 (예: storeName, storeNumber) 및 주소가 입력되었는지 확인
    if (
      !storeData.storeName ||
      !storeData.storeNumber ||
      !storeData.userName ||
      !storeData.userContact
    ) {
      showAlert({
        title: '정보 미입력',
        message: '모든 정보를 입력해 주세요.',
      });
      return;
    }

    navigation.navigate('StoreAuthorityScreen', {
      storeData,
      storeAddress,
      storeAddressDetail,
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleNext}>
          <Text style={styles.searchButton}>다음</Text>
        </Pressable>
      ),
    });
  }, [navigation, storeData]);

  return (
    <SafeAreaView style={styles.storetopview}>
      {/* 진행 바: 50% 진행 */}
      <ProgressBar progress={0} />

      <StoreAuthorityData storeData={storeData} setStoreData={setStoreData} />

      <Text style={styles.title}>신청 정보를 확인해주세요.</Text>

      <Pressable style={styles.savebutton} onPress={handleNext}>
        <Text style={styles.savebuttontext}>다음</Text>
      </Pressable>

      <AlertComponent />
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
