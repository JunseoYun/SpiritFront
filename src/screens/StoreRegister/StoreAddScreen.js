import React, {useState, useLayoutEffect} from 'react';
import {
  ScrollView,
  Text,
  Pressable,
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
  const [selectedOption, setSelectedOption] = useState(false);
  const [selectedscreenOption, setselectedscreenOption] = useState(false);
  const [closedDay, setClosedDay] = useState([]);
  const [alcohol, setAlcohol] = useState([{type: '', price: 0}]);
  const [is24Hours, setIs24Hours] = useState(false);
  const [isNextStart, setIsNextStart] = useState(false);

  const [isNextBreak, setIsNextBreak] = useState(false);

  const [imageUris, setImageUris] = useState([]); // 이미지 배열 상태

  const {showAlert, AlertComponent} = useCustomAlert();

  const [storeData, setStoreData] = useState({
    storeName: '',
    storeNumber: '',
    storeContent: '',
  });

  const [operatingHours, setOperatingHours] = useState({
    Monday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Tuesday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Wednesday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Thursday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Friday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Saturday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    Sunday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
  });

  const [breakingHours, setBreakingHours] = useState({
    Monday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Tuesday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Wednesday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Thursday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Friday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Saturday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    Sunday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
  });
  const storeTimeHandle = () => {
    navigation.navigate('StoreAddTimeSetScreen', {
      operatingHours,
      breakingHours,
      setOperatingHours,
      setBreakingHours,
      closedDay,
      setClosedDay,
      is24Hours,
      setIs24Hours,
      isNextStart,
      setIsNextStart,
      isNextBreak,
      setIsNextBreak,
    });
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  const confirmSubmission = () => {
    if (!storeData.storeName.trim()) {
      showAlert({
        title: '필수 정보 미입력',
        message: '매장 이름을 입력해 주세요.',
      });
      return;
    }
    if (!address.trim()) {
      showAlert({
        title: '필수 정보 미입력',
        message: '매장 주소를 입력해 주세요.',
      });
      return;
    }
    if (!operatingHours.openHour || !operatingHours.closedHour) {
      showAlert({
        title: '필수 정보 미입력',
        message: '매장 영업 시간을 입력해 주세요.',
      });
      return;
    }
    if (!selectedCategory.length) {
      showAlert({
        title: '필수 정보 미입력',
        message: '매장 카테고리를 선택해 주세요.',
      });
      return;
    }
    if (alcohol[0].type === '') {
      showAlert({
        title: '필수 정보 미입력',
        message: '대표 주종을 선택해 주세요.',
      });
      return;
    }
    if (!imageUris.length) {
      showAlert({
        title: '필수 정보 미입력',
        message: '매장 이미지를 최소 1개 이상 \n업로드해 주세요.',
      });
      return;
    }

    setIsModalVisible(true); // 모든 값이 유효하면 모달 열기
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={confirmSubmission}>
          <Text style={styles.searchButton}>완료</Text>
        </Pressable>
      ),
    });
  }, [
    navigation,
    storeData,
    operatingHours,
    breakingHours,
    coords,
    address,
    detailedAddress,
    selectedCategory,
    selectedOption,
    selectedscreenOption,
    closedDay,
    alcohol,
    imageUris,
  ]);

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
        contact: storeData.storeNumber,
        closedDays: closedDay,
        hasScreen: selectedscreenOption,
        locationDto: {
          address: address,
          addressDetail: detailedAddress,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        name: storeData.storeName,
        businessHoursDto: {
          openTime: `${operatingHours.openHour}:${operatingHours.openMinute}`,
          closeTime: `${operatingHours.closedHour}:${operatingHours.closedMinute}`,
          breakStartTime:
            breakingHours.startHour && breakingHours.startMinute
              ? `${breakingHours.startHour}:${breakingHours.startMinute}`
              : '', // 값이 없으면 빈 문자열
          breakEndTime:
            breakingHours.endHour && breakingHours.endMinute
              ? `${breakingHours.endHour}:${breakingHours.endMinute}`
              : '', // 값이 없으면 빈 문자열
        },
        mainDrinkDtos: alcohol,
        isGroupAvailable: selectedOption,
        categories: selectedCategory.filter(category => category !== '-'),
        description: storeData.storeContent,
      },
    };

    try {
      const response = await StoreRegister(data);
      if (response) {
        showAlert({
          title: '매장 등록이 완료되었습니다.',
          message: '다른 분들을 위해 \n매장 등록을 해주셔서 감사합니다.',
          onConfirm: () => {
            navigation.replace('StoreStack', {
              screen: 'StoreMainScreen',
              params: {
                storeId: response.id,
              },
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
      <ScrollView style={styles.catainer}>
        <SafeAreaView style={styles.storetopview}>
          <StoreInfo storeData={storeData} setStoreData={setStoreData} />
          <StoreAddress
            address={address}
            detailedAddress={detailedAddress}
            setDetailedAddress={setDetailedAddress}
            navigation={navigation}
            onAddressSelect={handleAddressSelect} // 콜백 전달
          />

          <StoreCategory
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
          {/* <StoreOperatingHours
            operatingHours={operatingHours}
            setOperatingHours={setOperatingHours}
          />
          <StoreBreakingHours
            breakingHours={breakingHours}
            setBreakingHours={setBreakingHours}
          />
          <StoreClosedDay closedDay={closedDay} setClosedDay={setClosedDay} /> */}
          <Pressable onPress={storeTimeHandle}>
            <Text>영업 시간 설정</Text>
          </Pressable>

          <StoreGroup
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
          <StoreTV
            selectedscreenOption={selectedscreenOption}
            setselectedscreenOption={setselectedscreenOption}
          />

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
        breakingHours={breakingHours}
        closedDay={closedDay}
        alcohol={alcohol}
        selectedOption={selectedOption}
        selectedscreenOption={selectedscreenOption}
      />

      <AlertComponent />
    </>
  );
};

const styles = StyleSheet.create({
  catainer: {
    backgroundColor: 'white',
  },
  storetopview: {
    backgroundColor: 'white',
    width: '100%',
    height: '100%',
  },
  searchButton: {
    marginRight: 18,
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  savebutton: {
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
