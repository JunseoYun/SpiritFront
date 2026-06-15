//사장님 매장 등록 및 인증 스크린
import React, {
  useState,
  useLayoutEffect,
  useRef,
  useMemo,
  useCallback,
  useEffect,
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
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';

import {useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import StoreImage from '../../components/StoreAddScreen/StoreImage';
import StoreAddname from '../../components/StoreAddScreen/StoreAddname';
import StoreAddress from '../../components/StoreAddScreen/StoreAddress';
import StoreMood from '../../components/StoreAddScreen/StoreMood';
import StoreCategory from '../../components/StoreAddScreen/StoreCategory';
import OperatingHoursPreview from '../../components/StoreAddScreen/OperatingHoursPreview';
import StoreAlcohol from '../../components/StoreAddScreen/StoreAlcohol';
import StoreFacilitiesInfo from '../../components/StoreAddScreen/StoreFacilitiesInfo';
import StorAddeNumber from '../../components/StoreAddScreen/StoreAddNumber';
import StoreAddContent from '../../components/StoreAddScreen/StoreAddContent';
import useSafeAndroidInsets from '../../hooks/useSafeAndroidInsets';
import Loading from '../../hooks/Loading';
import BottomActionButton from '../../utils/BottomActionButton';
import ColorUtil from '../../utils/ColorUtil';
import useCustomAlert from '../../hooks/useCustomAlert';
import useDoubleBackExit from '../../hooks/useDoubleBackExit';
import BusinessCertificate from '../../components/StoreAuthority/BusinessCertificate';
import {
  Create_store_with_ownership,
  Create_store_with_ownership_photoOnly,
} from '../../api/storeApi';
import CustomText from '../../utils/CustomText';
const STEPS = [
  'image',
  'name',
  'address',
  'mood',
  'category',
  'hours',
  'alcohol',
  'facilities',
  'contact',
  'content',
  'businessCertificate',
  'consent',
];

const STEP_GUIDES = {
  image: {
    type: '매장 사진',
    title: '매장 사진을 등록해주세요',
    description: '대표 사진을 포함해 최대 5장까지 업로드할 수 있어요.',
    tipTitle: '사진 가이드',
    tip: '첫 번째로 추가한 사진이 대표 사진으로 설정돼요.',
  },
  name: {
    type: '매장 이름',
    title: '매장 이름을 입력해주세요',
    description:
      '고객이 검색하거나 지도에서 볼 수 있는 공식 상호명을 입력해 주세요.',
    tipTitle: '이름 가이드',
    tip: '사업자등록증과 동일한 이름을 권장해요. 특수문자는 최소한으로 사용해 주세요.',
  },
  address: {
    type: '매장 주소',
    title: '매장 주소를 알려주세요',
    description: '정확한 주소는 고객 방문과 심사에 꼭 필요해요.',
    tipTitle: '주소 입력 방법',
    tip: '검색으로 찾기 어렵다면 지도에서 위치를 직접 지정해 보세요.',
  },
  mood: {
    type: '분위기',
    title: '매장 분위기를 선택해주세요',
    description:
      '고객이 매장의 감성을 느낄 수 있도록 최대 4개까지 선택할 수 있어요.',
  },
  category: {
    type: '매장 카테고리',
    title: '매장 카테고리를 골라주세요',
    description: '대표되는 업종을 최대 3개까지 선택하면 추천에 도움이 돼요.',
  },
  hours: {
    type: '매장 영업 시간',
    title: '영업 시간을 등록해주세요',
    description: '요일별 영업 시간과 휴무일을 정확히 입력해 주세요.',
    tipTitle: '시간 입력 팁',
    tip: '브레이크 타임이 있다면 함께 입력하면 고객 문의가 줄어들어요.',
  },
  alcohol: {
    type: '매장 대표 주종',
    title: '대표 주종을 알려주세요',
    description: '매장을 대표하는 주종을 최대 3개까지 선택해 주세요.',
    tipTitle: '대표 주종이란',
    tip: '대표 주종은 매장을 가장 잘 나타내는 술 종류를 의미해요. 실제 판매 주종은 더 다양하게 등록하실 수 있어요.',
  },
  facilities: {
    type: '편의시설',
    title: '편의시설 정보를 선택해주세요',
    description: '제공되는 서비스는 고객 방문 결정에 큰 도움이 됩니다.',
  },
  contact: {
    type: '매장 연락처',
    title: '매장 연락처를 입력해주세요',
    description: '고객이 문의하거나 예약할 수 있는 번호를 입력해 주세요.',
  },
  content: {
    type: '매장 소개',
    title: '매장을 소개해주세요',
    description: '매장만의 분위기, 시그니처 메뉴 등을 자유롭게 작성해 주세요.',
    tipTitle: '소개글 작성 팁',
    tip: '대표 메뉴, 좌석 수, 예약 가능 여부 등을 함께 적어주면 좋아요.',
  },
  businessCertificate: {
    type: '사업자등록증',
    title: '사업자등록증을 첨부해주세요',
    description:
      '사업자등록증에는 주류판매신고번호가 확인 가능한 사진을 첨부해 주세요.',
    tipTitle: '첨부 가이드',
    tip: '전체 정보가 잘 보이도록 밝은 곳에서 촬영해 주세요. 등록증은 최신본을 사용해주세요.',
  },
  consent: {
    type: '개인정보 수집 동의',
    title: '동의가 필요해요',
    description:
      '매장 등록 및 사업자 인증을 위해 정보 수집·이용에 동의해주세요.',
    tipTitle: '왜 필요한가요?',
    tip: '한잔할까는 사업자 등록증과 신청자 정보를 대조해 간편하게 인증하기 때문에, 본인 확인을 위한 최소한의 정보가 필요해요.',
  },
};

const StoreOwnershipScreen = ({navigation}) => {
  useDoubleBackExit(navigation);
  const {bottom} = useSafeAndroidInsets();
  const route = useRoute();
  const {index, location} = route.params;

  const [stepIndex, setStepIndex] = useState(0);
  const step = STEPS[stepIndex];
  const totalSteps = STEPS.length;
  const currentStepNumber = stepIndex + 1;
  const currentStepTitle = STEP_GUIDES[step]?.type ?? '';
  const progressRatio = useMemo(
    () => (currentStepNumber / totalSteps) * 100,
    [currentStepNumber, totalSteps],
  );

  const progressShared = useSharedValue(progressRatio);
  const animatedProgressStyle = useAnimatedStyle(
    () => ({
      width: `${progressShared.value}%`,
    }),
    [progressShared],
  );

  const [imageUris, setImageUris] = useState([]);
  const [storename, setStorename] = useState('');
  const [coords, setCoords] = useState({latitude: 0, longitude: 0});
  const [address, setAddress] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [moodInfo, setMoodInfo] = useState({
    QUIET: false,
    LIVELY: false,
    SOLO_FRIENDLY: false,
    DATE: false,
    PARTY_EVENT: false,
    TRADITIONAL: false,
    EXOTIC: false,
    MODERN: false,
    OLD_SCHOOL: false,
    VIEW_SPOT: false,
    LOCAL_FAVORITE: false,
    SECOND_ROUND: false,
  });
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [facilitiesInfo, setFacilitiesInfo] = useState({
    hasScreen: false,
    hasRoom: false,
    hasOutdoor: false,
    isGroupAvailable: false,
    isParkingAvailable: false,
    isCorkageAvailable: false,
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
  const [closedDay, setClosedDay] = useState([]);
  const [is24Hours, setIs24Hours] = useState(null);
  const [isSameEveryTime, setIsSameEveryTime] = useState(true);
  const [hasBreaking, setHasBreaking] = useState(false);
  const [alcohol, setAlcohol] = useState([]);
  const [storeNumber, setStoreNumber] = useState('');
  const [storeContent, setStoreContent] = useState('');
  const [businessCertificate, setBusinessCertificate] = useState(null);
  const [isConsentChecked, setIsConsentChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {showAlert, AlertComponent} = useCustomAlert();

  const scrollViewRef = useRef(null);
  const storeImageRef = useRef(null);
  const storeInfoRef = useRef(null);
  const storeAddressRef = useRef(null);
  const categoryRef = useRef(null);
  const operatingRef = useRef(null);
  const alcoholRef = useRef(null);
  const facilitiesRef = useRef(null);
  const storeNumberRef = useRef(null);
  const storeContentRef = useRef(null);
  const businessCertificateRef = useRef(null);

  const handleAddressSelect = ({address, coords}) => {
    setAddress(address);
    setCoords(coords);
  };

  useEffect(() => {
    if (businessCertificate && error === 'businessCertificate') {
      setError('');
    }
  }, [businessCertificate, error]);

  const handleConsentConfirm = useCallback(() => {
    if (!isConsentChecked) {
      showAlert({
        title: '동의 필요',
        message: '동의 후 등록을 진행할 수 있어요.',
      });
      return;
    }
    handleSubmit();
  }, [isConsentChecked, handleSubmit, showAlert]);

  const scrollToError = useCallback(ref => {
    if (ref?.current && scrollViewRef.current) {
      ref.current.measureLayout(
        scrollViewRef.current,
        (x, y) => {
          scrollViewRef.current.scrollTo({
            y: Math.max(y - 100, 0),
            animated: true,
          });
        },
        () => {},
      );
    }
  }, []);

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

  const renderStepIntro = useCallback(stepKey => {
    const guide = STEP_GUIDES[stepKey];
    if (!guide?.title && !guide?.description) {
      return null;
    }
    return (
      <View style={styles.sectionIntro}>
        {guide.title && (
          <CustomText style={styles.sectionTitle}>{guide.title}</CustomText>
        )}
        {guide.description && (
          <CustomText style={styles.sectionDescription}>
            {guide.description}
          </CustomText>
        )}
      </View>
    );
  }, []);

  const renderStepTip = useCallback(stepKey => {
    const guide = STEP_GUIDES[stepKey];
    if (!guide?.tip) {
      return null;
    }

    return (
      <View style={styles.tipWrapper}>
        <CustomText style={styles.tipBadge}>TIP</CustomText>
        <View style={styles.tipContent}>
          {guide.tipTitle && (
            <CustomText style={styles.tipTitle}>{guide.tipTitle}</CustomText>
          )}
          <CustomText style={styles.tipBody}>{guide.tip}</CustomText>
        </View>
      </View>
    );
  }, []);

  const scrollToTop = useCallback(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollTo({y: 0, animated: true});
    }
  }, []);

  const storeTimeHandle = () => {
    navigation.navigate('StoreAddTimeSetScreen', {
      operatingHours,
      setOperatingHours,
      breakingHours,
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

  const hasCompletedOperatingHours = useMemo(() => {
    if (is24Hours) {
      return true;
    }

    const activeDays = Object.entries(operatingHours).filter(([day]) => {
      return !closedDay.includes(day.toUpperCase());
    });

    if (activeDays.length === 0) {
      return false;
    }

    return activeDays.every(([, time]) => {
      const {openHour, openMinute, closedHour, closedMinute} = time;
      return (
        openHour !== '' &&
        openMinute !== '' &&
        closedHour !== '' &&
        closedMinute !== ''
      );
    });
  }, [is24Hours, operatingHours, closedDay]);

  const isSubmitDisabled = useMemo(
    () =>
      !imageUris.length ||
      !storename.trim() ||
      !address.trim() ||
      selectedCategory.length === 0 ||
      !hasCompletedOperatingHours ||
      alcohol.length === 0 ||
      !storeNumber.trim() ||
      !businessCertificate,
    [
      imageUris.length,
      storename,
      address,
      selectedCategory.length,
      hasCompletedOperatingHours,
      alcohol.length,
      storeNumber,
      businessCertificate,
    ],
  );

  const isCurrentStepValid = useMemo(() => {
    switch (step) {
      case 'image':
        return imageUris.length > 0;
      case 'name':
        return !!storename.trim();
      case 'address':
        return !!address.trim();
      case 'category':
        return selectedCategory.length > 0;
      case 'hours':
        return hasCompletedOperatingHours;
      case 'alcohol':
        return alcohol.length > 0;
      case 'contact':
        return !!storeNumber.trim();
      case 'businessCertificate':
        return !!businessCertificate;
      case 'consent':
        return isConsentChecked;
      default:
        return true;
    }
  }, [
    step,
    imageUris.length,
    storename,
    address,
    selectedCategory.length,
    hasCompletedOperatingHours,
    alcohol.length,
    storeNumber,
    businessCertificate,
    isConsentChecked,
  ]);

  const adjustTime = time => {
    if (!time) return null;

    const [hour, minute] = time.split(':').map(Number);
    const adjustedHour = hour >= 24 ? hour - 24 : hour;
    return `${adjustedHour.toString().padStart(2, '0')}:${minute
      .toString()
      .padStart(2, '0')}`;
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitDisabled) {
      return;
    }

    if (!businessCertificate) {
      setError('businessCertificate');
      scrollToError(businessCertificateRef);
      return;
    }

    const operationInfoDtos = Object.keys(operatingHours).map(day => {
      const upperCaseDay = day.toUpperCase();
      const isClosed = closedDay.includes(upperCaseDay);

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

    const selectedMoods = Object.entries(moodInfo)
      .filter(([, value]) => value)
      .map(([key]) => key);

    const locationDto = {
      address,
      addressDetail: detailedAddress,
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    const createStoreDto = {
      name: storename.trim(),
      contact: storeNumber.trim(),
      description: storeContent.trim(),
      locationDto,
      moods: selectedMoods,
      categories: selectedCategory.filter(c => c !== '-'),
      mainDrinkTypes: alcohol,
      facilitiesInfoDto: facilitiesInfo,
      isAlwaysOpen: is24Hours ?? false,
    };

    if (!is24Hours) {
      createStoreDto.operationInfoDtos = operationInfoDtos;
    }

    const payload = {
      storeImages: imageUris.map(image => {
        if (image?.path) return image.path;
        if (image?.uri) return image.uri;
        return image;
      }),
      businessRegistrationCertificateImage:
        businessCertificate?.path ||
        businessCertificate?.uri ||
        businessCertificate,
      createStoreRqDto: createStoreDto,
    };

    try {
      setLoading(true);
      const response = await Create_store_with_ownership_photoOnly(payload);
      if (response.status === 200) {
        showAlert({
          title: '매장 등록 및 인증 신청 완료',
          message:
            '신청 내용을 확인한 후, 빠른 시일 내에\n알림으로 안내드릴 예정입니다.',
          onConfirm: () => {
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
    } catch (apiError) {
      showAlert({
        title: '등록 실패',
        message:
          '잠시 후 다시 시도해 주세요.\n계속 실패할 경우, 메일로 문의해 주세요.',
      });
    } finally {
      setLoading(false);
    }
  }, [
    isSubmitDisabled,
    operatingHours,
    closedDay,
    breakingHours,
    moodInfo,
    address,
    detailedAddress,
    coords.latitude,
    coords.longitude,
    storename,
    storeNumber,
    storeContent,
    selectedCategory,
    alcohol,
    facilitiesInfo,
    is24Hours,
    imageUris,
    businessCertificate,
    scrollToError,
    navigation,
    showAlert,
    setLoading,
  ]);

  const validateStep = useCallback(() => {
    switch (step) {
      case 'image':
        if (!imageUris.length) {
          setError('StoreImage');
          scrollToError(storeImageRef);
          return false;
        }
        break;
      case 'name':
        if (!storename.trim()) {
          setError('storename');
          scrollToError(storeInfoRef);
          return false;
        }
        break;
      case 'address':
        if (!address.trim()) {
          setError('StoreAddress');
          scrollToError(storeAddressRef);
          return false;
        }
        break;
      case 'category':
        if (!selectedCategory.length) {
          setError('StoreCategory');
          scrollToError(categoryRef);
          return false;
        }
        break;
      case 'hours':
        if (!hasCompletedOperatingHours) {
          setError('StoreOperate');
          scrollToError(operatingRef);
          return false;
        }
        break;
      case 'alcohol':
        if (!alcohol.length) {
          setError('StoreDrink');
          scrollToError(alcoholRef);
          return false;
        }
        break;
      case 'contact':
        if (!storeNumber.trim()) {
          setError('storeNumber');
          scrollToError(storeNumberRef);
          return false;
        }
        break;
      case 'businessCertificate':
        if (!businessCertificate) {
          setError('businessCertificate');
          scrollToError(businessCertificateRef);
          return false;
        }
        break;
      default:
        break;
    }

    setError('');
    return true;
  }, [
    step,
    imageUris.length,
    storename,
    address,
    selectedCategory.length,
    hasCompletedOperatingHours,
    alcohol.length,
    storeNumber,
    scrollToError,
    businessCertificate,
  ]);

  const animateProgress = useCallback(
    target => {
      progressShared.value = withTiming(target, {duration: 240});
    },
    [progressShared],
  );

  const handleNext = useCallback(() => {
    if (!validateStep()) {
      return;
    }

    if (stepIndex >= STEPS.length - 1) {
      return;
    }

    const nextIndex = stepIndex + 1;
    if (STEPS[nextIndex] === 'consent') {
      setIsConsentChecked(false);
    }
    setStepIndex(nextIndex);
    setError('');
    scrollToTop();
  }, [validateStep, stepIndex, scrollToTop]);

  const handleStepBack = useCallback(() => {
    if (stepIndex === 0) {
      navigation.goBack();
      return;
    }
    setStepIndex(prev => prev - 1);
    setError('');
    scrollToTop();
  }, [navigation, stepIndex, scrollToTop]);

  const handleCancelPress = useCallback(() => {
    showAlert({
      title: '매장 등록을 그만둘까요?',
      message: '작성 중인 내용은 저장되지 않아요.',
      type: 'confirm',
      confirmText: '그만두기',
      cancelText: '취소',
      onConfirm: () => navigation.goBack(),
    });
  }, [navigation, showAlert]);

  useEffect(() => {
    animateProgress(progressRatio);
  }, [progressRatio, animateProgress]);

  const handlePrimaryAction = useCallback(() => {
    if (step === 'consent') {
      handleConsentConfirm();
      return;
    }
    handleNext();
  }, [step, handleConsentConfirm, handleNext]);

  useLayoutEffect(() => {
    const isIOS = Platform.OS === 'ios';

    navigation.setOptions({
      headerTitle: () => (
        <CustomText
          style={{
            fontFamily: 'Pretendard-Bold',
            fontSize: 18,
          }}>
          {currentStepTitle || '매장 등록'}
        </CustomText>
      ),
      headerTitleAlign: 'center',
      gestureEnabled: !isIOS || stepIndex === 0,
      headerLeft: () => (
        <Pressable
          onPress={handleCancelPress}
          hitSlop={{top: 10, bottom: 10, left: 20, right: 20}}>
          <Ionicons
            name="close"
            size={24}
            color="#333"
            style={{paddingLeft: 12}}
          />
        </Pressable>
      ),
    });
  }, [navigation, stepIndex, handleCancelPress, currentStepTitle]);

  return (
    <SafeAreaView style={[styles.container, {paddingBottom: bottom}]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoiding}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, animatedProgressStyle]} />
        </View>
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}>
          {step === 'image' && (
            <>
              {renderStepIntro('image')}
              <View ref={storeImageRef}>
                <StoreImage
                  imageUris={imageUris}
                  setImageUris={setImageUris}
                  error={error}
                  setLoading={setLoading}
                  type="registration"
                />
              </View>
              {renderStepTip('image')}
            </>
          )}

          {step === 'name' && (
            <>
              {renderStepIntro('name')}
              <View ref={storeInfoRef}>
                <StoreAddname
                  storename={storename}
                  setStorename={setStorename}
                  error={error}
                  type="registration"
                />
              </View>
              {/* {renderStepTip('name')} */}
            </>
          )}

          {step === 'address' && (
            <>
              {renderStepIntro('address')}
              <View ref={storeAddressRef}>
                <StoreAddress
                  address={address}
                  detailedAddress={detailedAddress}
                  setDetailedAddress={setDetailedAddress}
                  navigation={navigation}
                  onAddressSelect={handleAddressSelect}
                  location={coords}
                  error={error}
                  screen="StoreRegistrationScreen"
                  type="registration"
                />
              </View>
              {renderStepTip('address')}
            </>
          )}

          {step === 'mood' && (
            <>
              {renderStepIntro('mood')}
              <StoreMood
                moodInfo={moodInfo}
                setMoodInfo={setMoodInfo}
                type="registration"
              />
              {renderStepTip('mood')}
            </>
          )}

          {step === 'category' && (
            <>
              {renderStepIntro('category')}
              <View ref={categoryRef}>
                <StoreCategory
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                  error={error}
                  type="registration"
                />
              </View>
              {renderStepTip('category')}
            </>
          )}

          {step === 'hours' && (
            <>
              {renderStepIntro('hours')}
              <View ref={operatingRef}>
                <OperatingHoursPreview
                  storeTimeHandle={storeTimeHandle}
                  is24Hours={is24Hours}
                  operatingHours={operatingHours}
                  breakingHours={breakingHours}
                  closedDay={closedDay}
                  index={index}
                  error={error}
                  type="registration"
                />
              </View>
              {renderStepTip('hours')}
            </>
          )}

          {step === 'alcohol' && (
            <>
              {renderStepIntro('alcohol')}
              <View ref={alcoholRef}>
                <StoreAlcohol
                  alcohol={alcohol}
                  setAlcohol={setAlcohol}
                  index={index}
                  error={error}
                  type="registration"
                />
              </View>
              {renderStepTip('alcohol')}
            </>
          )}

          {step === 'facilities' && (
            <>
              {renderStepIntro('facilities')}
              <View ref={facilitiesRef}>
                <StoreFacilitiesInfo
                  facilitiesInfo={facilitiesInfo}
                  setFacilitiesInfo={setFacilitiesInfo}
                  error={error}
                  type="registration"
                />
              </View>
              {renderStepTip('facilities')}
            </>
          )}

          {step === 'contact' && (
            <>
              {renderStepIntro('contact')}
              <View ref={storeNumberRef}>
                <StorAddeNumber
                  storeNumber={storeNumber}
                  setStoreNumber={setStoreNumber}
                  error={error}
                  onFocusInput={scrollToInput}
                  type="registration"
                />
              </View>
              {renderStepTip('contact')}
            </>
          )}

          {step === 'content' && (
            <>
              {renderStepIntro('content')}
              <View ref={storeContentRef}>
                <StoreAddContent
                  storeContent={storeContent}
                  setStoreContent={setStoreContent}
                  error={error}
                  onFocusInput={scrollToInput}
                  type="registration"
                />
              </View>
              {renderStepTip('content')}
            </>
          )}

          {step === 'businessCertificate' && (
            <>
              {renderStepIntro('businessCertificate')}
              <View ref={businessCertificateRef}>
                <BusinessCertificate
                  business_registration_certificate={businessCertificate}
                  setBusiness_registration_certificate={setBusinessCertificate}
                  type="registration"
                  error={error}
                />
              </View>
              {renderStepTip('businessCertificate')}
            </>
          )}
          {step === 'consent' && (
            <>
              {renderStepIntro('consent')}
              <View style={styles.consentCard}>
                <CustomText style={styles.consentBody}>
                  한잔할까는 매장 등록 및 사업자 인증을 위해 신청자의 이름,
                  연락처, 사업자등록증 사본을 수집·이용합니다. 해당 정보는 등록
                  심사와 사업자 진위 확인 외의 용도로 사용되지 않으며, 심사 완료
                  후 일정 기간이 지난 후 안전하게 파기됩니다.
                </CustomText>
                <Pressable
                  style={styles.inlineConsentRow}
                  onPress={() => setIsConsentChecked(prev => !prev)}>
                  <View
                    style={[
                      styles.inlineCheckbox,
                      isConsentChecked && styles.inlineCheckboxChecked,
                    ]}>
                    {isConsentChecked && (
                      <Ionicons name="checkmark" size={16} color="#FFF" />
                    )}
                  </View>
                  <CustomText style={styles.inlineConsentLabel}>
                    위 내용에 동의합니다. (필수)
                  </CustomText>
                </Pressable>
              </View>
              {renderStepTip('consent')}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomActionButton
        label={step === 'consent' ? '등록' : '다음'}
        disabled={
          loading ||
          (step === 'consent'
            ? isSubmitDisabled || !isConsentChecked
            : !isCurrentStepValid)
        }
        cancel
        cancelLabel="이전"
        onPress={handlePrimaryAction}
        onCancel={handleStepBack}
      />
      <Loading loading={loading} />
      <AlertComponent />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    flex: 1,
  },
  keyboardAvoiding: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E6EDF8',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 18,
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: ColorUtil.main,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  sectionIntro: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    color: '#333',
    fontFamily: 'Pretendard-Bold',
  },
  sectionDescription: {
    paddingTop: 8,
    fontSize: 16,
    color: '#6b7280',
    fontFamily: 'Pretendard-Regular',
    lineHeight: 22,
  },
  tipWrapper: {
    marginHorizontal: 18,
    marginTop: 14,
    // flexDirection: 'row',
    // alignItems: 'flex-start',
  },
  tipBadge: {
    fontSize: 12,
    color: '#1789E0',
    fontFamily: 'Pretendard-Bold',
    marginRight: 10,
    paddingVertical: 4,
  },
  tipContent: {
    flex: 1,
    backgroundColor: '#F3F6FC',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  tipTitle: {
    fontSize: 14,
    fontFamily: 'Pretendard-SemiBold',
    color: '#0D47A1',
    marginBottom: 3,
  },
  tipBody: {
    paddingTop: 3,
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    color: '#24324A',
    lineHeight: 20,
  },
  consentCard: {
    marginHorizontal: 18,
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#F8FBFF',
    borderWidth: 1,
    borderColor: '#E1E8F5',
  },
  consentBody: {
    fontSize: 14,
    color: '#333',
    lineHeight: 21,
    fontFamily: 'Pretendard-Regular',
  },
  inlineConsentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
  },
  inlineCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFF',
  },
  inlineCheckboxChecked: {
    backgroundColor: ColorUtil.main,
    borderColor: ColorUtil.main,
  },
  inlineConsentLabel: {
    fontSize: 15,
    color: '#222',
    fontFamily: 'Pretendard-SemiBold',
  },
});

export default StoreOwnershipScreen;
