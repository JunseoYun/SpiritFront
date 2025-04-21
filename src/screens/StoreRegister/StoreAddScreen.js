import React, {useState, useLayoutEffect, useRef, useEffect} from 'react';
import {
  ScrollView,
  Text,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
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
import OperatingHoursPreview from '../../components/StoreAddScreen/OperatingHoursPreview';
import {useAuth} from '../../context/AuthContext';
import {useToast} from '../../context/ToastContext';

const StoreAddScreen = ({navigation, route}) => {
  const {token} = useAuth();
  const {showToast} = useToast();
  useFocusEffect(
    React.useCallback(() => {
      if (!token) {
        showToast('로그인 후 이용해주세요', 'center');
        navigation.goBack();
      }
    }, [token]),
  );
  const {location} = route.params;

  const scrollViewRef = useRef(null); // 스크롤뷰 참조
  const storeInfoRef = useRef(null);
  const storeAddressRef = useRef(null);
  const storeCategoryRef = useRef(null);
  const storeOperateRef = useRef(null);
  const storeDrinkRef = useRef(null);
  const storeImageRef = useRef(null);

  const [coords, setCoords] = useState({latitude: 0, longitude: 0});
  const [address, setAddress] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedOption, setSelectedOption] = useState(false);
  const [selectedscreenOption, setselectedscreenOption] = useState(false);
  const [closedDay, setClosedDay] = useState([]);
  const [alcohol, setAlcohol] = useState([{type: '', price: 0}]);
  const [is24Hours, setIs24Hours] = useState(false);
  const [imageUris, setImageUris] = useState([]); // 이미지 배열 상태
  const [isSameEveryTime, setIsSameEveryTime] = useState(true);
  const {showAlert, AlertComponent} = useCustomAlert();
  const [storeData, setStoreData] = useState({
    storeName: '',
    storeNumber: '',
    storeContent: '',
  });
  const [error, setError] = useState('');

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

  const [hasBreaking, setHasBreaking] = useState(false);
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
      isSameEveryTime,
      setIsSameEveryTime,
      hasBreaking,
      setHasBreaking,
    });
  };

  const [isModalVisible, setIsModalVisible] = useState(false);

  const scrollToError = ref => {
    if (ref?.current) {
      ref.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({y: y - 100, animated: true});
        },
        () => console.log('스크롤 이동 실패'),
      );
    }
  };

  const confirmSubmission = () => {
    if (!storeData.storeName.trim()) {
      setError('StoreName');
      scrollToError(storeInfoRef);
      return;
    }
    if (!address.trim()) {
      setError('StoreAddress');
      scrollToError(storeAddressRef);
      return;
    }
    if (!selectedCategory.length) {
      setError('StoreCategory');
      scrollToError(storeCategoryRef);
      return;
    }
    const hasEmptyOperatingHours = Object.entries(operatingHours).some(
      ([day, {openHour, openMinute, closedHour, closedMinute}]) => {
        const upperDay = day.toUpperCase();
        if (closedDay.includes(upperDay)) return false; // 휴무일이면 제외
        return !openHour || !openMinute || !closedHour || !closedMinute;
      },
    );

    if (hasEmptyOperatingHours) {
      setError('StoreOperate');
      scrollToError(storeOperateRef);
      return;
    }

    const hasValidAlcohol = alcohol.some(
      item => item.type.trim() && item.price > 0,
    );

    if (!hasValidAlcohol) {
      setError('StoreDrink');
      scrollToError(storeDrinkRef);
      return;
    }

    if (!imageUris.length) {
      setError('StoreImage');
      scrollToError(storeImageRef);
      return;
    }
    showAlert({
      title: '매장 등록',
      message: '매장을 등록하시겠습니까?',
      onConfirm: () => StoreAdd(),
      onCancel: null,
      type: 'confirm',
    });
    // setIsModalVisible(true); // 모든 값이 유효하면 모달 열기
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

  const adjustTime = time => {
    if (!time) return null; // 값이 없으면 그대로 반환

    const [hour, minute] = time.split(':').map(Number);
    const adjustedHour = hour >= 24 ? hour - 24 : hour; // 24 이상이면 -24 처리
    return `${adjustedHour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
  };

  const StoreAdd = async () => {
    setIsModalVisible(false); // 모달 닫기
    const imageFiles = imageUris.map(uri => ({
      file: uri, // 이미지 URI를 파일로 전달
    }));
    const operationInfoDtos = Object.keys(operatingHours).map(day => {
      const upperCaseDay = day.toUpperCase(); // 요일 변환 ("Monday" -> "MONDAY")
      const isClosed = closedDay.includes(upperCaseDay); // 휴무 여부 확인

      return {
        dayOfWeek: upperCaseDay,
        isClosed,
        openTime: isClosed
          ? ''
          : `${operatingHours[day].openHour}:${operatingHours[day].openMinute}`,
        closeTime: isClosed
          ? ''
          : adjustTime(
              `${operatingHours[day].closedHour}:${operatingHours[day].closedMinute}`,
            ),
        breakStartTime:
          isClosed ||
          !breakingHours[day].startHour ||
          !breakingHours[day].startMinute
            ? ''
            : `${breakingHours[day].startHour}:${breakingHours[day].startMinute}`,
        breakEndTime:
          isClosed ||
          !breakingHours[day].endHour ||
          !breakingHours[day].endMinute
            ? ''
            : adjustTime(
                `${breakingHours[day].endHour}:${breakingHours[day].endMinute}`,
              ),
      };
    });

    var data = {
      files: imageUris,
      createStoreDto: {
        contact: storeData.storeNumber,
        isAlwaysOpen: is24Hours,
        hasScreen: selectedscreenOption,
        ...(!is24Hours && {operationInfoDtos: operationInfoDtos}),
        locationDto: {
          address: address,
          addressDetail: detailedAddress,
          latitude: coords.latitude,
          longitude: coords.longitude,
        },
        name: storeData.storeName,
        mainDrinkDtos: alcohol.filter(drink => drink.type && drink.price > 0),
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
      console.log(error);
      showAlert({
        title: '등록 실패',
        message: '로그인 상태를 확인해주세요.',
      });
    }
  };

  return (
    <>
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}>
        <SafeAreaView style={styles.storetopview}>
          <View ref={storeInfoRef}>
            <StoreInfo
              storeData={storeData}
              setStoreData={setStoreData}
              error={error}
            />
          </View>

          <View ref={storeAddressRef}>
            <StoreAddress
              address={address}
              detailedAddress={detailedAddress}
              setDetailedAddress={setDetailedAddress}
              navigation={navigation}
              onAddressSelect={handleAddressSelect} // 콜백 전달
              error={error}
              location={location}
            />
          </View>
          <View ref={storeCategoryRef}>
            <StoreCategory
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              error={error}
            />
          </View>
          <View ref={storeOperateRef}>
            <OperatingHoursPreview
              storeTimeHandle={storeTimeHandle}
              is24Hours={is24Hours}
              operatingHours={operatingHours}
              breakingHours={breakingHours}
              closedDay={closedDay}
              error={error}
            />
          </View>

          <StoreGroup
            selectedOption={selectedOption}
            setSelectedOption={setSelectedOption}
          />
          <StoreTV
            selectedscreenOption={selectedscreenOption}
            setselectedscreenOption={setselectedscreenOption}
          />
          <View ref={storeDrinkRef}>
            <StoreAlcohol
              alcohol={alcohol}
              setAlcohol={setAlcohol}
              error={error}
            />
          </View>
          <View ref={storeImageRef}>
            <StoreImage
              imageUris={imageUris}
              setImageUris={setImageUris}
              error={error}
            />
          </View>

          <Pressable style={styles.savebutton} onPress={confirmSubmission}>
            <Text style={styles.savebuttontext}>작성 완료</Text>
          </Pressable>
        </SafeAreaView>
      </ScrollView>

      {/* <StoreConfirmationModal
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
        is24Hours={is24Hours}
      /> */}

      <AlertComponent />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
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
    fontFamily: 'Pretendard-Medium',
    color: '#181A1A',
  },
  savebutton: {
    alignSelf: 'center',
    alignItems: 'center',
    width: '90%',
    marginVertical: 7,
    backgroundColor: '#45C9FF',
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 30,
  },
  savebuttontext: {
    color: 'white',
    fontFamily: 'Pretendard-Bold',
    fontSize: 18,
  },
});

export default StoreAddScreen;
