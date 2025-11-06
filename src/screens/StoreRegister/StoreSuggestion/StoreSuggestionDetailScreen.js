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
  findNodeHandle,
  Modal,
} from 'react-native';
import {UpdateStore} from '../../../api/storeApi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import StoreCategory from '../../../components/StoreAddScreen/StoreCategory';
import OperatingHoursPreview from '../../../components/StoreAddScreen/OperatingHoursPreview';
import StoreFacilitiesInfo from '../../../components/StoreAddScreen/StoreFacilitiesInfo';
import StoreAlcohol from '../../../components/StoreAddScreen/StoreAlcohol';
import StorAddeNumber from '../../../components/StoreAddScreen/StoreAddNumber';
import StoreAddContent from '../../../components/StoreAddScreen/StoreAddContent';
import useCustomAlert from '../../../hooks/useCustomAlert';
import Loading from '../../../hooks/Loading';
import useSafeAndroidInsets from '../../../hooks/useSafeAndroidInsets';
import BottomActionButton from '../../../utils/BottomActionButton';
import ColorUtil from '../../../utils/ColorUtil';
import useDoubleBackExit from '../../../hooks/useDoubleBackExit';
const StoreSuggestionDetailScreen = ({navigation}) => {
  useDoubleBackExit(navigation);
  const {bottom} = useSafeAndroidInsets();
  const route = useRoute();
  const {storename, index, preStoreId} = route.params;
  const [loading, setLoading] = useState(false);
  const [isChoiceModalVisible, setIsChoiceModalVisible] = useState(false);
  const [storeNumber, setStoreNumber] = useState('');
  const [storeContent, setStoreContent] = useState('');

  const [selectedCategory, setSelectedCategory] = useState([]);
  const [facilitiesInfo, setFacilitiesInfo] = useState({
    hasScreen: false,
    hasRoom: false,
    hasOutdoor: false,
    isGroupAvailable: false,
    isParkingAvailable: false,
    isCorkageAvailable: false,
  });
  const [closedDay, setClosedDay] = useState([]);
  const [alcohol, setAlcohol] = useState([]);
  const [is24Hours, setIs24Hours] = useState(null);
  const [isSameEveryTime, setIsSameEveryTime] = useState(true);

  const scrollViewRef = useRef(null);
  const {showAlert, AlertComponent} = useCustomAlert();

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

  const [isChanged, setIsChanged] = useState(false);

  // 1️⃣ 최초 로드 시 초기 상태 저장
  const initialState = useRef({
    storeNumber: '',
    storeContent: '',
    selectedCategory: [],
    facilitiesInfo: {
      hasScreen: false,
      hasRoom: false,
      hasOutdoor: false,
      isGroupAvailable: false,
      isParkingAvailable: false,
      isCorkageAvailable: false,
    },
    closedDay: [],
    alcohol: [],
    is24Hours: null,
    operatingHours: JSON.parse(JSON.stringify(operatingHours)), // 깊은 복사
    breakingHours: JSON.parse(JSON.stringify(breakingHours)),
  });

  // 2️⃣ 변경 감지 useEffect
  useEffect(() => {
    const initial = initialState.current;

    const hasChange =
      storeNumber !== initial.storeNumber ||
      storeContent !== initial.storeContent ||
      JSON.stringify(selectedCategory) !==
        JSON.stringify(initial.selectedCategory) ||
      JSON.stringify(facilitiesInfo) !==
        JSON.stringify(initial.facilitiesInfo) ||
      JSON.stringify(closedDay) !== JSON.stringify(initial.closedDay) ||
      JSON.stringify(alcohol) !== JSON.stringify(initial.alcohol) ||
      is24Hours !== initial.is24Hours ||
      JSON.stringify(operatingHours) !==
        JSON.stringify(initial.operatingHours) ||
      JSON.stringify(breakingHours) !== JSON.stringify(initial.breakingHours);

    setIsChanged(hasChange);
  }, [
    storeNumber,
    storeContent,
    selectedCategory,
    facilitiesInfo,
    closedDay,
    alcohol,
    is24Hours,
    operatingHours,
    breakingHours,
  ]);
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

  const confirmSubmission = () => {
    showAlert({
      title: '매장 제보',
      message: '매장을 제보하시겠습니까?',
      onConfirm: () => StoreSuggestionDetail(),
      onCancel: null,
      type: 'confirm',
    });
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={confirmSubmission}
          disabled={!preStoreId || !isChanged || loading}>
          <Text
            style={[
              styles.nextButton,
              (!preStoreId || !isChanged || loading) && {
                color: ColorUtil.mainDisable,
              },
            ]}>
            {'제보'}
          </Text>
        </Pressable>
      ),
    });
  }, [
    navigation,
    storename,
    storeNumber,
    storeContent,
    operatingHours,
    breakingHours,
    selectedCategory,
    facilitiesInfo,
    is24Hours,
    closedDay,
    alcohol,
    loading,
    preStoreId,
  ]);

  const adjustTime = time => {
    if (!time) return null; // 값이 없으면 그대로 반환

    const [hour, minute] = time.split(':').map(Number);
    const adjustedHour = hour >= 24 ? hour - 24 : hour; // 24 이상이면 -24 처리
    return `${adjustedHour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
  };

  const StoreSuggestionDetail = async () => {
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

    const updatePayload = {};

    if (storename) updatePayload.name = storename;
    if (storeNumber) updatePayload.contact = storeNumber;
    if (storeContent) updatePayload.description = storeContent;
    if (is24Hours !== null) updatePayload.isAlwaysOpen = is24Hours;
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
        updatePayload.operationInfoDtos = operationInfoDtos;
      }
    }

    const validDrinks = alcohol.filter(Boolean).map(type => ({type}));
    if (validDrinks.length > 0) {
      updatePayload.mainDrinkDtos = validDrinks;
    }

    const filteredCategories = selectedCategory.filter(c => c !== '-');
    if (filteredCategories.length > 0) {
      updatePayload.categories = filteredCategories;
    }

    updatePayload.facilitiesInfoDto = facilitiesInfo;
    // console.log(updatePayload);
    try {
      setLoading(true);
      if (!preStoreId) {
        throw new Error('Missing preStoreId for update');
      }

      await UpdateStore(preStoreId, updatePayload);
      setIsChoiceModalVisible(true);
    } catch (error) {
      console.error(error);
      showAlert({
        title: '등록 실패',
        message:
          '잠시 후 다시 시도해 주세요.\n계속 실패할 경우, 메일로 문의해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  };

  const scrollToInput = useCallback((inputRef, extraOffset = 0) => {
    if (!scrollViewRef.current || !inputRef?.current) {
      return;
    }

    const nodeHandle = findNodeHandle(inputRef.current);
    if (!nodeHandle) {
      return;
    }

    const scrollResponder = scrollViewRef.current.getScrollResponder?.();
    if (!scrollResponder) {
      return;
    }

    const keyboardOffset = Platform.OS === 'ios' ? 20 : 40;

    setTimeout(
      () => {
        scrollResponder.scrollResponderScrollNativeHandleToKeyboard(
          nodeHandle,
          keyboardOffset + extraOffset,
          true,
        );
      },
      Platform.OS === 'android' ? 120 : 0,
    );
  }, []);

  const handleModalConfirm = () => {
    setIsChoiceModalVisible(false);
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'MainBtmbar',
          state: {routes: [{name: 'MainScreen'}]},
        },
      ],
    });
  };

  return (
    <SafeAreaView style={[styles.storetopview, {paddingBottom: bottom}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled">
          <View style={styles.tipView}>
            <View style={styles.tipbadge}>
              <Text style={styles.tipbadgeText}>Tip</Text>
            </View>
            <Text style={styles.tipText}>
              항목은 선택적으로 입력할 수 있습니다
            </Text>
          </View>
          <StoreCategory
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            index={index}
          />
          <OperatingHoursPreview
            storeTimeHandle={storeTimeHandle}
            is24Hours={is24Hours}
            operatingHours={operatingHours}
            breakingHours={breakingHours}
            closedDay={closedDay}
            index={index}
          />
          <StoreAlcohol
            alcohol={alcohol}
            setAlcohol={setAlcohol}
            index={index}
          />
          <StoreFacilitiesInfo
            facilitiesInfo={facilitiesInfo}
            setFacilitiesInfo={setFacilitiesInfo}
            index={index}
          />
          <StorAddeNumber
            storeNumber={storeNumber}
            setStoreNumber={setStoreNumber}
            index={index}
            onFocusInput={scrollToInput}
          />
          <StoreAddContent
            storeContent={storeContent}
            setStoreContent={setStoreContent}
            index={index}
            onFocusInput={scrollToInput}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomActionButton
        label={'제보하기'}
        cancel={true}
        disabled={!preStoreId || !isChanged}
        onPress={() => confirmSubmission()}
        onCancel={() => navigation.goBack()}
      />
      <AlertComponent />

      <Loading loading={loading} />

      <Modal
        transparent
        animationType="fade"
        visible={isChoiceModalVisible}
        onRequestClose={handleModalConfirm}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconWrapper}>
              <Ionicons name="checkmark" size={26} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>매장 제보가 완료되었어요 🎉</Text>
            <Text style={styles.modalDescription}>
              매장 제보를 해주셔서 감사합니다.
            </Text>
            <View style={styles.modalButtonGroup}>
              <Pressable
                style={styles.modalPrimaryButton}
                onPress={handleModalConfirm}>
                <Text style={styles.modalPrimaryLabel}>확인</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  storetopview: {
    backgroundColor: 'white',
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // 하단 버튼 영역 확보
  },
  tipView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 25,
  },
  tipbadge: {
    backgroundColor: 'rgba(0, 83, 200, 0.08)', // 은은한 파란 배경 (약한 블루)
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginRight: 6,
  },
  tipbadgeText: {
    color: '#003C8F', // 짙은 블루 (#003C8F)
    fontFamily: 'Pretendard-Regular',
    fontSize: 13,
  },
  tipText: {
    color: '#003C8F',
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
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
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: ColorUtil.main,
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

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
    maxWidth: 340,
    alignSelf: 'center',
    width: '100%',
  },
  modalIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ColorUtil.main,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    color: '#111',
    textAlign: 'center',
  },
  modalDescription: {
    marginTop: 12,
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: '#555',
    lineHeight: 22,
    textAlign: 'center',
  },
  modalButtonGroup: {
    marginTop: 28,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  modalPrimaryButton: {
    backgroundColor: ColorUtil.main,
    borderRadius: 7,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  modalPrimaryLabel: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
});

export default StoreSuggestionDetailScreen;
