import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  Pressable,
  Alert,
  SafeAreaView,
  StyleSheet,
} from 'react-native';
import {StoreRegister} from '../../api/storeApi';
import StoreAddress from '../../components/StoreAddScreen/StoreAddress';
import StoreCategory from '../../components/StoreAddScreen/StoreCategory';
import StoreClosedDay from '../../components/StoreAddScreen/StoreClosedDay';
import StoreGroup from '../../components/StoreAddScreen/StoreGroup';
import StoreOperatingHours from '../../components/StoreAddScreen/StoreOperatingHours';
import StoreBreakingHours from '../../components/StoreAddScreen/StoreBreakingTime';
import StoreImage from '../../components/StoreAddScreen/StoreImage';
import StoreAlcohol from '../../components/StoreAddScreen/StoreAlcohol';
import StoreTV from '../../components/StoreAddScreen/StoreTV';
import StoreInfo from '../../components/StoreAddScreen/StoreInfo';
import StoreConfirmationModal from '../../components/StoreAddScreen/StoreConfirmationModal';
import useCustomAlert from '../../hooks/useCustomAlert';
const StoreAddScreen = ({navigation, route}) => {
  const [coords, setCoords] = useState({latitude: 0, longitude: 0});
  const [address, setAddress] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedscreenOption, setselectedscreenOption] = useState(null);
  const [closedDay, setClosedDay] = useState([]);
  const [alcohol, setAlcohol] = useState([{type: 'SOJU', price: 0}]);
  console.log(alcohol);

  const [imageUris, setImageUris] = useState([]); // 이미지 배열 상태

  const {showAlert, AlertComponent} = useCustomAlert();

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

  const [breakingHours, setBreakingHours] = useState({
    startHour: '',
    startMinute: '',
    endHour: '',
    endMinute: '',
  });

  const [isModalVisible, setIsModalVisible] = useState(false);

  const confirmSubmission = () => {
    // if (!storeData.storeName.trim()) {
    //   Alert.alert(
    //     '필수 정보',
    //     '매장 이름을 입력해주세요.',
    //     [{ text: '확인', style: 'cancel' }],
    //     { cancelable: true }
    //   );
    //   return;
    // }
    // if (!address.trim()) {
    //   Alert.alert(
    //     '필수 정보',
    //     '주소를 입력해주세요.',
    //     [{ text: '확인', style: 'cancel' }],
    //     { cancelable: true }
    //   );
    //   return;
    // }
    // if (!operatingHours.openHour || !operatingHours.closedHour) {
    //   Alert.alert(
    //     '필수 정보',
    //     '영업시간을 입력해주세요.',
    //     [{ text: '확인', style: 'cancel' }],
    //     { cancelable: true }
    //   );
    //   return;
    // }
    // if (!selectedCategory.length) {
    //   Alert.alert(
    //     '필수 정보',
    //     '카테고리를 선택해주세요.',
    //     [{ text: '확인', style: 'cancel' }],
    //     { cancelable: true }
    //   );
    //   return;
    // }
    // if (!alcohol.trim()) {
    //   Alert.alert(
    //     '필수 정보',
    //     '대표 주종을 선택해주세요.',
    //     [{ text: '확인', style: 'cancel' }],
    //     { cancelable: true }
    //   );
    //   return;
    // }
    setIsModalVisible(true); // 모든 값이 유효하면 모달 열기
  };

  const handleAddressSelect = ({address, coords}) => {
    setAddress(address);
    setCoords(coords);
  };

  const StoreAdd = async () => {
    setIsModalVisible(false); // 모달 닫기
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
        closedDays: closedDay,
      },
    };

    try {
      const response = await StoreRegister(data);
      if (response) {
        showAlert({
          title: '매장 등록이 완료되었습니다.',
          message: '다른 분들을 위해 \n매장 등록을 해주셔서 감사합니다.',
          onConfirm: () => {
            navigation.reset({
              index: 0, // 새로운 스택의 첫 화면으로 설정
              routes: [{name: 'MainBtmbar'}], // 이동할 스크린 이름
            });
          },
        });
      }
    } catch (error) {
      showAlert({
        title: '등록 실패',
        message: '로그인 상태를 확인해주세요.',
      });
    }
  };

  return (
    <>
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

          <StoreBreakingHours
            breakingHours={breakingHours}
            setBreakingHours={setBreakingHours}
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
          <Pressable style={styles.savebutton} onPress={confirmSubmission}>
            <Text style={styles.savebuttontext}>작성 완료</Text>
          </Pressable>
        </SafeAreaView>
      </ScrollView>

      <StoreConfirmationModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={StoreAdd}
        storeData={storeData}
        selectedCategory={selectedCategory}
        address={address}
        detailedAddress={detailedAddress}
        operatingHours={operatingHours}
        closedDay={closedDay}
        alcohol={alcohol}
        selectedOption={selectedOption}
        selectedscreenOption={selectedscreenOption}
      />
    </>
  );
};

const styles = StyleSheet.create({
  storetopview: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  savebutton: {
    alignSelf: 'center',
    alignItems: 'center',
    width: '90%',
    marginVertical: 7,
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 30,
  },
  savebuttontext: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    backgroundColor: '#16BBFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default StoreAddScreen;
