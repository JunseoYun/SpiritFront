import React, { useState, useEffect } from 'react';
import { ScrollView, Text, Pressable, View, Alert, SafeAreaView } from 'react-native';
import { getToken } from '../../storage/tokenStorage';
import { StoreRegister } from '../../api/storeApi';
import styles from '../../components/StoreAddScreen/StoreStyle';
import StoreAddress from '../../components/StoreAddScreen/StoreAddress';
import StoreCategory from '../../components/StoreAddScreen/StoreCategory';
import StoreClosedDay from '../../components/StoreAddScreen/StoreClosedDay';
import StoreGroup from '../../components/StoreAddScreen/StoreGroup';
import StoreOperatingHours from '../../components/StoreAddScreen/StoreOperatingHours';
import StoreImage from '../../components/StoreAddScreen/StoreImage';
import StoreAlcohol from '../../components/StoreAddScreen/StoreAlcohol';
import StoreTV from '../../components/StoreAddScreen/StoreTV';
import StoreInfo from '../../components/StoreAddScreen/StoreInfo';


const StoreAddScreen = ({ navigation}) => {
  const [coords, setCoords] = useState({latitude: 0, longitude: 0});
  const [address, setAddress] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedscreenOption, setselectedscreenOption] = useState(null);
  const [closedDay, setClosedDay] = useState('');
  const [alcohol, setAlcohol] = useState('');
  const [imageUris, setImageUris] = useState([]); // 이미지 배열 상태

  const [storeData, setStoreData] = useState({
    storeName: '',
    storeNumber: '',
    storeContent: '',
  });

  const [operatingHours, setOperatingHours] = useState({
    openHour: '',
    openMinute: '',
    closedHour: '',
    closedMinute: '',
  });
  
  const handleAddressSelect = ({address, coords}) => {
    setAddress(address);
    setCoords(coords);
  };

  const StoreAdd = async () => {
    const imageFiles = imageUris.map(uri => ({
      file: uri, // 이미지 URI를 파일로 전달
    }));
    var data = {
      files: imageUris,
      createStoreDto: {
        storeName: storeData.storeName,
        categories: selectedCategory.filter(category => category !== '-'),
        address: address,
        addressDetail: detailedAddress,
        storeNumber: storeData.storeNumber,
        storeContent: storeData.storeContent,
        openHour: `${operatingHours.openHour}:${operatingHours.openMinute}`,
        closeHour: `${operatingHours.closedHour}:${operatingHours.closedMinute}`,
        isGroupAvailable: selectedOption,
        hasScreen: selectedscreenOption,
        longitude: coords.longitude,
        latitude: coords.latitude,
      },
    };

    try {
      const response = await StoreRegister(data);
      if (response) {
        console.log(response);
        Alert.alert(
          '등록이 완료되었습니다.',
          '',
          [
            {text: '확인',
              style: 'destructive',
              onPress: () => {
                navigation.reset({
                  index: 0, // 새로운 스택의 첫 화면으로 설정
                  routes: [{ name: 'MainBtmbar' }], // 이동할 스크린 이름
                });
              },
            },
          ],
          { cancelable: false },
        );
      }
    } catch (error) {
      Alert.alert('등록 실패', '이메일 및 비밀번호를 확인해 주세요.' + error);
    }
  };


  return (
    <ScrollView>
      <SafeAreaView style={styles.storetopview}>
        <StoreInfo storeData={storeData} setStoreData={setStoreData} />
        <StoreAddress
          address={address}
          detailedAddress={detailedAddress}
          setDetailedAddress={setDetailedAddress}
          navigation={navigation}
          onAddressSelect={handleAddressSelect} // 콜백 전달
        />
        <StoreOperatingHours
          operatingHours={operatingHours}
          setOperatingHours={setOperatingHours}
        />
        <StoreCategory
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />


        <StoreGroup
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
        />
        <StoreTV
          selectedscreenOption={selectedscreenOption}
          setselectedscreenOption={setselectedscreenOption}
        />
        <StoreClosedDay closedDay={closedDay} setClosedDay={setClosedDay} />
        <StoreAlcohol alcohol={alcohol} setAlcohol={setAlcohol} />
        <StoreImage imageUris={imageUris} setImageUris={setImageUris} />
        <Pressable style={styles.savebutton} onPress={StoreAdd}>
          <Text style={styles.savebuttontext}>작성 완료</Text>
        </Pressable>
      </SafeAreaView>
    </ScrollView>


  );
};

export default StoreAddScreen;