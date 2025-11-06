import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  ToastAndroid,
  Keyboard,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {StoreRegister, StoreSuggestion} from '../../../api/storeApi';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import StoreAddProgressbar from '../../../components/StoreAddScreen/StoreAddProgressbar';
import StoreCategory from '../../../components/StoreAddScreen/StoreCategory';
import OperatingHoursPreview from '../../../components/StoreAddScreen/OperatingHoursPreview';
import StoreGroup from '../../../components/StoreAddScreen/StoreGroup';
import StoreTV from '../../../components/StoreAddScreen/StoreTV';
import StoreAlcohol from '../../../components/StoreAddScreen/StoreAlcohol';
import StoreInfo from '../../../components/StoreAddScreen/StoreInfo';
import useCustomAlert from '../../../hooks/useCustomAlert';
import Loading from '../../../hooks/Loading';
import useSafeAndroidInsets from '../../../hooks/useSafeAndroidInsets';

const StoreAddInfoScreen = ({navigation}) => {
  const {bottom} = useSafeAndroidInsets();
  const route = useRoute();
  const {storename, address, detailedAddress, imageUris, index, coords} =
    route.params;
  const [loading, setLoading] = useState(false);
  const [storeData, setStoreData] = useState({
    storeNumber: '',
    storeContent: '',
  });
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedscreenOption, setselectedscreenOption] = useState(null);
  const [closedDay, setClosedDay] = useState([]);
  const [alcohol, setAlcohol] = useState([]);
  const [is24Hours, setIs24Hours] = useState(null);
  const [isSameEveryTime, setIsSameEveryTime] = useState(true);
  const [error, setError] = useState('');

  const scrollViewRef = useRef(null);
  const storeCategoryRef = useRef(null);
  const storeOperateRef = useRef(null);
  const StoreGroupRef = useRef(null);
  const StoreScreenRef = useRef(null);
  const storeDrinkRef = useRef(null);
  const {showAlert, AlertComponent} = useCustomAlert();
  const [confirm, setConfirm] = useState(false);

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
    if (!selectedCategory.length && index) {
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

    if (hasEmptyOperatingHours && index) {
      setError('StoreOperate');
      scrollToError(storeOperateRef);
      return;
    }

    if (selectedOption === null && index) {
      setError('StoreGroup');
      scrollToError(StoreGroupRef);
      return;
    }

    if (selectedscreenOption === null && index) {
      setError('StoreScreen');
      scrollToError(StoreScreenRef);
      return;
    }

    const hasValidAlcohol = (alcohol || []).length > 0;

    if (!hasValidAlcohol && index) {
      setError('StoreDrink');
      scrollToError(storeDrinkRef);
      return;
    }
    const isRegister = !!index;
    showAlert({
      title: isRegister ? '매장 등록' : '매장 제보',
      message: isRegister
        ? '매장을 등록하시겠습니까?'
        : '매장을 제보하시겠습니까?',
      onConfirm: () => StoreAdd(),
      onCancel: null,
      type: 'confirm',
    });

    // setIsModalVisible(true); // 모든 값이 유효하면 모달 열기
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={loading || confirm ? null : confirmSubmission}
          disabled={loading || confirm}>
          <Text style={[styles.nextButton]}>{index ? '등록' : '제보'}</Text>
        </Pressable>
      ),
    });
  }, [
    navigation,
    storename,
    storeData,
    operatingHours,
    breakingHours,
    coords,
    address,
    detailedAddress,
    selectedCategory,
    selectedOption,
    selectedscreenOption,
    is24Hours,
    closedDay,
    alcohol,
    imageUris,
    confirm,
    loading,
  ]);

  const adjustTime = time => {
    if (!time) return null; // 값이 없으면 그대로 반환

    const [hour, minute] = time.split(':').map(Number);
    const adjustedHour = hour >= 24 ? hour - 24 : hour; // 24 이상이면 -24 처리
    return `${adjustedHour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
  };

  const StoreAdd = async () => {
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
    let data;

    const createStoreDto = {
      name: storename,
    };

    if (index) {
      // ⭐ 매장 등록 - 전체 필드
      data = {
        files: imageUris,
        createStoreDto: {
          contact: storeData.storeNumber,
          isAlwaysOpen: is24Hours ?? false,
          hasScreen: selectedscreenOption,
          ...(!is24Hours && {operationInfoDtos}),
          locationDto: {
            address,
            addressDetail: detailedAddress,
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
          name: storename,
          mainDrinkTypes: alcohol,
          isGroupAvailable: selectedOption,
          categories: selectedCategory.filter(c => c !== '-'),
          description: storeData.storeContent,
        },
      };
    } else {
      // ⭐ 매장 제보 - 값이 있는 것만 넣기

      // contact
      if (storeData.storeNumber) createStoreDto.contact = storeData.storeNumber;
      if (is24Hours !== null) createStoreDto.isAlwaysOpen = is24Hours;
      if (!is24Hours) {
        const hasValidTime = Object.entries(operatingHours).some(
          ([day, time]) => {
            const isClosed = closedDay.includes(day.toUpperCase());
            if (isClosed) return false;
            return (
              time.openHour &&
              time.openMinute &&
              time.closedHour &&
              time.closedMinute
            );
          },
        );
        if (hasValidTime) {
          createStoreDto.operationInfoDtos = operationInfoDtos;
        }
      }
      const hasLocation =
        address || detailedAddress || coords?.latitude || coords?.longitude;
      if (hasLocation) {
        createStoreDto.locationDto = {};
        if (address) createStoreDto.locationDto.address = address;
        if (detailedAddress)
          createStoreDto.locationDto.addressDetail = detailedAddress;
        if (coords?.latitude)
          createStoreDto.locationDto.latitude = coords.latitude;
        if (coords?.longitude)
          createStoreDto.locationDto.longitude = coords.longitude;
      }
      const validDrinks = alcohol.filter(Boolean);
      if (validDrinks.length > 0) {
        createStoreDto.mainDrinkTypes = validDrinks;
      }
      createStoreDto.isGroupAvailable = selectedOption;
      createStoreDto.hasScreen = selectedscreenOption;
      const filteredCategories = selectedCategory.filter(c => c !== '-');
      if (filteredCategories.length > 0) {
        createStoreDto.categories = filteredCategories;
      }
      if (storeData.storeContent)
        createStoreDto.description = storeData.storeContent;

      data = {
        files: imageUris,
        createStoreDto,
      };
    }

    try {
      let response;
      if (index) {
        // response = await StoreRegister(data);
        const locationDto = {
          address,
          addressDetail: detailedAddress,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };

        navigation.navigate('StoreCheckScreen', {
          storeName: storename,
          storeLocationDto: locationDto,
          storeContact: storeData.storeNumber,
          storeSuggestionData: data,
        });
      } else {
        setConfirm(true);
        setLoading(true);
        response = await StoreSuggestion(data);
        if (response.status === 200) {
          showAlert({
            title: '매장 제보가 완료되었습니다.',
            message: '다른 분들을 위해 \n매장 제보를 해주셔서 감사합니다.',
            onConfirm: () => {
              setConfirm(false);
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'MainBtmbar',
                    state: {routes: [{name: 'MainScreen'}]},
                  },
                ],
              });
            },
          });
        }
      }
    } catch (error) {
      console.error(error?.response);
      setConfirm(false);
      showAlert({
        title: '등록 실패',
        message:
          '잠시 후 다시 시도해 주세요.\n계속 실패할 경우, 메일로 문의해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  };
  const lastBackPressed = useRef(0);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          onPress={() => {
            const now = Date.now();
            if (now - lastBackPressed.current < 2000) {
              navigation.goBack();
            } else {
              lastBackPressed.current = now;
              ToastAndroid.show(
                '한 번 더 누르면 작성한 내용이 사라집니다.',
                ToastAndroid.SHORT,
              );
            }
          }}
          hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
          <Ionicons
            name="arrow-back-outline"
            size={23}
            color="#333"
            style={{paddingLeft: 12}}
          />
        </Pressable>
      ),
    });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        const now = Date.now();

        if (now - lastBackPressed.current < 2000) {
          navigation.goBack();
          return true;
        }

        lastBackPressed.current = now;
        ToastAndroid.show(
          '한 번 더 누르면 작성한 내용이 사라집니다.',
          ToastAndroid.SHORT,
        );
        return true; // 기본 동작 막기
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => backHandler.remove(); // cleanup
    }, [navigation]),
  );

  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <SafeAreaView
        style={[
          styles.storetopview,
          {paddingBottom: keyboardVisible ? 0 : bottom},
        ]}>
        <StoreAddProgressbar progress={1} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          ref={scrollViewRef}>
          <Text style={styles.title}>
            {index
              ? '상세정보를 입력해주세요*'
              : '상세정보를 입력해주세요 (선택)'}
          </Text>

          <View ref={storeCategoryRef}>
            <StoreCategory
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              error={error}
              index={index}
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
              index={index}
            />
          </View>
          <View ref={StoreGroupRef}>
            <StoreGroup
              selectedOption={selectedOption}
              setSelectedOption={setSelectedOption}
              index={index}
              error={error}
            />
          </View>
          <View ref={StoreScreenRef}>
            <StoreTV
              selectedscreenOption={selectedscreenOption}
              setselectedscreenOption={setselectedscreenOption}
              index={index}
              error={error}
            />
          </View>
          <View ref={storeDrinkRef}>
            <StoreAlcohol
              alcohol={alcohol}
              setAlcohol={setAlcohol}
              index={index}
              error={error}
            />
          </View>
          <StoreInfo
            storeData={storeData}
            setStoreData={setStoreData}
            error={error}
          />
        </ScrollView>
        <View style={styles.storeAddTextview}>
          <Pressable
            style={styles.storeAddButtonsearch}
            onPress={confirmSubmission}>
            <Text style={styles.storeAddText}>
              {index ? '매장 등록' : '매장 제보'}
            </Text>
          </Pressable>
        </View>
        <AlertComponent />
        <Loading loading={loading} />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  storetopview: {
    backgroundColor: 'white',
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // 하단 버튼 영역 확보
  },

  title: {
    marginTop: 30,
    marginHorizontal: 18,
    color: '#121212',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
  },
  nextButton: {
    marginRight: 18,
    fontSize: 19,
    fontFamily: 'Pretendard-SemiBold',
    color: '#3CBBFF',
  },

  storeAddTextview: {
    borderTopWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'android' && 10,
    justifyContent: 'space-between',
  },
  storeAddButtonsearch: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3CBBFF',
    borderRadius: 10,
    elevation: 3, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  storeAddText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
});

export default StoreAddInfoScreen;
