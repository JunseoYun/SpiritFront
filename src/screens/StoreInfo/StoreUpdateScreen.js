import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  findNodeHandle,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useRoute, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import useCustomAlert from '../../hooks/useCustomAlert';
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
import Loading from '../../hooks/Loading';
import BottomActionButton from '../../utils/BottomActionButton';
import useDoubleBackExit from '../../hooks/useDoubleBackExit';
import {
  DeleteStoreImage,
  StoreMainget,
  UpdateStore,
  UpdateStoreImage,
} from '../../api/storeApi';

const MOOD_TEMPLATE = {
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
};

const FACILITY_TEMPLATE = {
  hasScreen: false,
  isGroupAvailable: false,
  hasRoom: false,
  hasOutdoor: false,
  isCorkageAvailable: false,
  isParkingAvailable: false,
};
const FACILITY_KEYS = Object.keys(FACILITY_TEMPLATE);

const DAY_KEYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

const DAY_TO_UPPER = DAY_KEYS.reduce((acc, day) => {
  acc[day] = day.toUpperCase();
  return acc;
}, {});

const UPPER_TO_DAY = Object.entries(DAY_TO_UPPER).reduce(
  (acc, [day, upper]) => {
    acc[upper] = day;
    return acc;
  },
  {},
);

const createEmptyOperatingHours = () =>
  DAY_KEYS.reduce((acc, day) => {
    acc[day] = {openHour: '', openMinute: '', closedHour: '', closedMinute: ''};
    return acc;
  }, {});

const createEmptyBreakingHours = () =>
  DAY_KEYS.reduce((acc, day) => {
    acc[day] = {startHour: '', startMinute: '', endHour: '', endMinute: ''};
    return acc;
  }, {});

const adjustTime = time => {
  if (!time) return '';
  const [hourStr = '0', minuteStr = '0'] = time.split(':');
  const hour = Number(hourStr);
  const minute = Number(minuteStr);
  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return time;
  }
  const adjustedHour = hour >= 24 ? hour - 24 : hour;
  return `${adjustedHour.toString().padStart(2, '0')}:${minute
    .toString()
    .padStart(2, '0')}`;
};

const normalizeImageValue = value => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.path) return value.path;
  if (value.uri) return value.uri;
  return '';
};

const normalizeImages = list =>
  (list || []).map(normalizeImageValue).filter(Boolean);

const shallowEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

const buildSnapshotPayload = ({
  images = [],
  name = '',
  address = '',
  addressDetail = '',
  coords = {},
  categories = [],
  moods = [],
  operatingHours = {},
  breakingHours = {},
  closedDay = [],
  is24Hours = false,
  alcohol = [],
  facilities = {},
  storeNumber = '',
  storeContent = '',
}) => {
  const operatingEntries = DAY_KEYS.map(day => {
    const entry = operatingHours?.[day] || {};
    return {
      day,
      openHour: entry.openHour || '',
      openMinute: entry.openMinute || '',
      closedHour: entry.closedHour || '',
      closedMinute: entry.closedMinute || '',
    };
  });

  const breakingEntries = DAY_KEYS.map(day => {
    const entry = breakingHours?.[day] || {};
    return {
      day,
      startHour: entry.startHour || '',
      startMinute: entry.startMinute || '',
      endHour: entry.endHour || '',
      endMinute: entry.endMinute || '',
    };
  });

  const facilitiesSnapshot = FACILITY_KEYS.reduce((acc, key) => {
    acc[key] = Boolean(facilities?.[key]);
    return acc;
  }, {});

  return {
    images: normalizeImages(images),
    name: (name || '').trim(),
    address: (address || '').trim(),
    addressDetail: (addressDetail || '').trim(),
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
    categories: [...categories],
    moods: [...moods].sort(),
    operatingHours: operatingEntries,
    breakingHours: breakingEntries,
    closedDay: [...closedDay].sort(),
    is24Hours: Boolean(is24Hours),
    alcohol: [...alcohol],
    facilities: facilitiesSnapshot,
    storeNumber: (storeNumber || '').trim(),
    storeContent: (storeContent || '').trim(),
  };
};

const serializeSnapshot = snapshot => JSON.stringify(snapshot);

const extractMoodsFromData = data => {
  const raw =
    data?.moods ||
    data?.moodTypes ||
    data?.moodDtos ||
    data?.storeMoodDtos ||
    [];
  if (!Array.isArray(raw)) return [];
  return raw
    .map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object') {
        return item?.type || item?.moodType || item?.key || item?.value;
      }
      return null;
    })
    .filter(Boolean);
};

const convertOperationInfoDtos = infoDtos => {
  const operating = createEmptyOperatingHours();
  const breaking = createEmptyBreakingHours();
  const closed = [];
  let hasBreak = false;

  (infoDtos || []).forEach(dto => {
    const dayKey = UPPER_TO_DAY[dto?.dayOfWeek];
    if (!dayKey) return;

    if (dto.isClosed) {
      closed.push(dto.dayOfWeek);
      return;
    }

    const [openHour = '00', openMinute = '00'] = (
      dto.openTime || '00:00'
    ).split(':');
    const [closeHour = '00', closeMinute = '00'] = (
      dto.closeTime || '00:00'
    ).split(':');

    operating[dayKey] = {
      openHour: openHour.padStart(2, '0'),
      openMinute: openMinute.padStart(2, '0'),
      closedHour: closeHour.padStart(2, '0'),
      closedMinute: closeMinute.padStart(2, '0'),
    };

    if (dto.breakStartTime && dto.breakEndTime) {
      const [startHour = '00', startMinute = '00'] =
        dto.breakStartTime.split(':');
      const [endHour = '00', endMinute = '00'] = dto.breakEndTime.split(':');
      breaking[dayKey] = {
        startHour: startHour.padStart(2, '0'),
        startMinute: startMinute.padStart(2, '0'),
        endHour: endHour.padStart(2, '0'),
        endMinute: endMinute.padStart(2, '0'),
      };
      hasBreak = true;
    }
  });

  return {operating, breaking, closed, hasBreak};
};

const checkAllDaysEqual = schedule => {
  if (!schedule) return true;
  const reference = schedule[DAY_KEYS[0]];
  return DAY_KEYS.every(day => {
    const current = schedule[day];
    return (
      reference?.openHour === current?.openHour &&
      reference?.openMinute === current?.openMinute &&
      reference?.closedHour === current?.closedHour &&
      reference?.closedMinute === current?.closedMinute
    );
  });
};

const splitImageChanges = (current, original) => {
  const originalSet = new Set(original);
  const currentUris = current.map(normalizeImageValue).filter(Boolean);

  const deleted = original.filter(url => !currentUris.includes(url));
  const added = current.filter(item => {
    const uri = normalizeImageValue(item);
    return uri && !originalSet.has(uri) && typeof item === 'object';
  });

  return {
    added,
    deleted: deleted.map(url => ({imageUrl: url})),
  };
};

const StoreUpdateScreen = ({navigation}) => {
  const insets = useSafeAreaInsets();
  const route = useRoute();
  useDoubleBackExit(navigation);
  const {storeId, initialStoreData} = route.params || {};

  const {showAlert, AlertComponent} = useCustomAlert();
  const allowLeaveRef = useRef(false);

  const [imageUris, setImageUris] = useState([]);
  const [originalImages, setOriginalImages] = useState([]);
  const [storename, setStorename] = useState('');
  const [coords, setCoords] = useState({latitude: 0, longitude: 0});
  const [address, setAddress] = useState('');
  const [detailedAddress, setDetailedAddress] = useState('');
  const [moodInfo, setMoodInfo] = useState(MOOD_TEMPLATE);
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [operatingHours, setOperatingHours] = useState(
    createEmptyOperatingHours(),
  );
  const [breakingHours, setBreakingHours] = useState(
    createEmptyBreakingHours(),
  );
  const [closedDay, setClosedDay] = useState([]);
  const [is24Hours, setIs24Hours] = useState(false);
  const [isSameEveryTime, setIsSameEveryTime] = useState(true);
  const [hasBreaking, setHasBreaking] = useState(false);
  const [alcohol, setAlcohol] = useState([]);
  const [facilitiesInfo, setFacilitiesInfo] = useState(FACILITY_TEMPLATE);
  const [storeNumber, setStoreNumber] = useState('');
  const [storeContent, setStoreContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const scrollViewRef = useRef(null);
  const imageRef = useRef(null);
  const nameRef = useRef(null);
  const addressRef = useRef(null);
  const categoryRef = useRef(null);
  const operatingRef = useRef(null);
  const alcoholRef = useRef(null);
  const facilitiesRef = useRef(null);
  const contactRef = useRef(null);
  const contentRef = useRef(null);
  const initialSnapshotRef = useRef(null);
  const initialSnapshotStringRef = useRef('');

  const currentSnapshot = useMemo(
    () =>
      buildSnapshotPayload({
        images: imageUris,
        name: storename,
        address,
        addressDetail: detailedAddress,
        coords,
        categories: selectedCategory,
        moods: Object.keys(MOOD_TEMPLATE).filter(key => moodInfo[key]),
        operatingHours,
        breakingHours,
        closedDay,
        is24Hours,
        alcohol,
        facilities: facilitiesInfo,
        storeNumber,
        storeContent,
      }),
    [
      imageUris,
      storename,
      address,
      detailedAddress,
      coords,
      selectedCategory,
      moodInfo,
      operatingHours,
      breakingHours,
      closedDay,
      is24Hours,
      alcohol,
      facilitiesInfo,
      storeNumber,
      storeContent,
    ],
  );

  useEffect(() => {
    if (!initialSnapshotStringRef.current) return;
    const serialized = serializeSnapshot(currentSnapshot);
    setHasChanges(serialized !== initialSnapshotStringRef.current);
  }, [currentSnapshot]);

  const scrollToError = useCallback(ref => {
    if (!ref?.current || !scrollViewRef.current) return;
    ref.current.measureLayout(
      scrollViewRef.current,
      (x, y) => {
        scrollViewRef.current.scrollTo({
          y: Math.max(y - 40, 0),
          animated: true,
        });
      },
      () => {},
    );
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

  const hasCompletedOperatingHours = useMemo(() => {
    if (is24Hours) {
      return true;
    }
    const activeDays = DAY_KEYS.filter(
      day => !closedDay.includes(DAY_TO_UPPER[day]),
    );

    if (!activeDays.length) {
      return false;
    }

    return activeDays.every(day => {
      const {openHour, openMinute, closedHour, closedMinute} =
        operatingHours[day] || {};
      return openHour && openMinute && closedHour && closedMinute;
    });
  }, [is24Hours, operatingHours, closedDay]);

  const hydrateForm = useCallback(data => {
    if (!data) return;

    const remoteImages = Array.isArray(data.imgUrlList)
      ? data.imgUrlList.filter(Boolean)
      : [];
    setImageUris(remoteImages);
    setOriginalImages(normalizeImages(remoteImages));

    setStorename(data.name || '');
    setStoreNumber(data.contact || '');
    setStoreContent(data.description || '');

    const location = data.locationDto || {};
    setAddress(location.address || '');
    setDetailedAddress(location.addressDetail || '');
    setCoords({
      latitude: location.latitude ?? 0,
      longitude: location.longitude ?? 0,
    });

    setSelectedCategory(
      Array.isArray(data.categories)
        ? data.categories.filter(category => category && category !== '-')
        : [],
    );

    const moods = extractMoodsFromData(data);
    setMoodInfo(prev => {
      const next = {...MOOD_TEMPLATE};
      moods.forEach(mood => {
        if (next.hasOwnProperty(mood)) {
          next[mood] = true;
        }
      });
      return next;
    });

    const {
      operating,
      breaking,
      closed,
      hasBreak: hasBreakTime,
    } = convertOperationInfoDtos(data.operationInfoDtos);
    setOperatingHours(operating);
    setBreakingHours(breaking);
    setClosedDay(closed);
    setHasBreaking(hasBreakTime);
    setIs24Hours(Boolean(data.isAlwaysOpen));
    setIsSameEveryTime(checkAllDaysEqual(operating));

    const drinks = Array.isArray(data.mainDrinkDtos)
      ? data.mainDrinkDtos.map(item => item?.type).filter(Boolean)
      : Array.isArray(data.mainDrinkTypes)
      ? data.mainDrinkTypes.filter(Boolean)
      : [];
    setAlcohol(drinks.slice(0, 3));

    const facilitySource = data.facilitiesInfoDto || data;
    const nextFacilities = {...FACILITY_TEMPLATE};
    Object.keys(nextFacilities).forEach(key => {
      nextFacilities[key] = Boolean(facilitySource?.[key]);
    });
    setFacilitiesInfo(nextFacilities);

    const snapshot = buildSnapshotPayload({
      images: remoteImages,
      name: data.name,
      address: location.address,
      addressDetail: location.addressDetail,
      coords: {
        latitude: location.latitude ?? 0,
        longitude: location.longitude ?? 0,
      },
      categories: Array.isArray(data.categories)
        ? data.categories.filter(category => category && category !== '-')
        : [],
      moods,
      operatingHours: operating,
      breakingHours: breaking,
      closedDay: closed,
      is24Hours: data.isAlwaysOpen,
      alcohol: drinks.slice(0, 3),
      facilities: nextFacilities,
      storeNumber: data.contact,
      storeContent: data.description,
    });
    initialSnapshotRef.current = snapshot;
    initialSnapshotStringRef.current = serializeSnapshot(snapshot);
    setHasChanges(false);
  }, []);

  const fetchStoreInfo = useCallback(async () => {
    if (!storeId) return;
    setLoading(true);
    try {
      const data =
        initialStoreData && Object.keys(initialStoreData).length
          ? initialStoreData
          : await StoreMainget(storeId);
      hydrateForm(data);
    } catch (error) {
      showAlert({
        title: '정보를 불러올 수 없어요.',
        message: '네트워크 상태를 확인한 뒤 다시 시도해주세요.',
      });
    } finally {
      setLoading(false);
    }
  }, [storeId, initialStoreData, hydrateForm, showAlert]);

  useEffect(() => {
    if (!storeId) {
      showAlert({
        title: '매장 정보를 찾을 수 없어요.',
        message: '이전 화면으로 돌아갑니다.',
        onConfirm: () => navigation.goBack(),
      });
      return;
    }
    fetchStoreInfo();
  }, [storeId, fetchStoreInfo, navigation, showAlert]);

  const exitScreen = useCallback(
    action => {
      allowLeaveRef.current = true;
      if (action) {
        navigation.dispatch(action);
      } else {
        navigation.goBack();
      }
    },
    [navigation],
  );

  const handleCancelPress = useCallback(
    (exitAction = null) => {
      if (!hasChanges) {
        exitScreen(exitAction);
        return;
      }
      showAlert({
        title: '수정을 중단할까요?',
        message: '작성 중인 내용은 저장되지 않아요.',
        type: 'confirm',
        confirmText: '그만두기',
        cancelText: '계속 수정',
        onConfirm: () => exitScreen(exitAction),
      });
    },
    [hasChanges, showAlert, exitScreen],
  );

  useFocusEffect(
    useCallback(() => {
      const beforeRemove = e => {
        if (allowLeaveRef.current || !hasChanges) {
          allowLeaveRef.current = false;
          return;
        }
        e.preventDefault();
        handleCancelPress(e.data.action);
      };
      const unsubscribe = navigation.addListener('beforeRemove', beforeRemove);
      return () => unsubscribe();
    }, [navigation, handleCancelPress, hasChanges]),
  );

  useLayoutEffect(() => {
    const isIOS = Platform.OS === 'ios';

    navigation.setOptions({
      gestureEnabled: !isIOS,
      headerLeft: () => (
        <Pressable
          onPress={() => handleCancelPress()}
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
  }, [navigation, handleCancelPress]);

  useEffect(() => {
    if (Platform.OS !== 'ios') {
      return;
    }

    const parent = navigation.getParent?.();
    const grandParent = parent?.getParent?.();

    navigation.setOptions({gestureEnabled: false});
    parent?.setOptions?.({gestureEnabled: false});
    grandParent?.setOptions?.({gestureEnabled: false});

    return () => {
      navigation.setOptions({gestureEnabled: true});
      parent?.setOptions?.({gestureEnabled: true});
      grandParent?.setOptions?.({gestureEnabled: true});
    };
  }, [navigation]);

  const handleAddressSelect = useCallback(({address, coords}) => {
    setAddress(address);
    if (coords) {
      setCoords(coords);
    }
  }, []);

  const storeTimeHandle = useCallback(() => {
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
  }, [
    navigation,
    operatingHours,
    breakingHours,
    closedDay,
    is24Hours,
    isSameEveryTime,
    hasBreaking,
  ]);

  const buildOperationInfoDtos = useCallback(() => {
    return DAY_KEYS.map(day => {
      const upper = DAY_TO_UPPER[day];
      const schedule = operatingHours[day] || {};
      const breakSchedule = breakingHours[day] || {};
      const isClosed = closedDay.includes(upper);

      return {
        dayOfWeek: upper,
        isClosed,
        openTime: isClosed ? '' : `${schedule.openHour}:${schedule.openMinute}`,
        closeTime: isClosed
          ? ''
          : adjustTime(`${schedule.closedHour}:${schedule.closedMinute}`),
        breakStartTime:
          isClosed || !breakSchedule.startHour || !breakSchedule.startMinute
            ? ''
            : `${breakSchedule.startHour}:${breakSchedule.startMinute}`,
        breakEndTime:
          isClosed || !breakSchedule.endHour || !breakSchedule.endMinute
            ? ''
            : adjustTime(`${breakSchedule.endHour}:${breakSchedule.endMinute}`),
      };
    });
  }, [operatingHours, breakingHours, closedDay]);

  const validateForm = useCallback(() => {
    if (!imageUris.length) {
      setError('StoreImage');
      scrollToError(imageRef);
      showAlert({
        title: '이미지가 필요해요',
        message: '매장 사진을 최소 1장 이상 등록해주세요.',
      });
      return false;
    }

    if (!storename.trim()) {
      setError('storename');
      scrollToError(nameRef);
      showAlert({
        title: '매장 이름을 입력해주세요',
        message: '고객이 매장을 식별할 수 있도록 이름을 입력해주세요.',
      });
      return false;
    }

    if (!address.trim()) {
      setError('StoreAddress');
      scrollToError(addressRef);
      showAlert({
        title: '주소가 필요해요',
        message: '정확한 매장 주소를 입력해주세요.',
      });
      return false;
    }

    if (!selectedCategory.length) {
      setError('StoreCategory');
      scrollToError(categoryRef);
      showAlert({
        title: '카테고리를 선택해주세요',
        message: '대표 카테고리를 최소 1개 이상 선택해주세요.',
      });
      return false;
    }

    if (!is24Hours && !hasCompletedOperatingHours) {
      setError('StoreOperate');
      scrollToError(operatingRef);
      showAlert({
        title: '영업 시간을 확인해주세요',
        message: '휴무일을 제외한 요일의 영업 시간을 입력해야 합니다.',
      });
      return false;
    }

    if (!alcohol.length) {
      setError('StoreDrink');
      scrollToError(alcoholRef);
      showAlert({
        title: '대표 주종을 선택해주세요',
        message: '최소 1개 이상의 대표 주종을 선택해주세요.',
      });
      return false;
    }

    if (!storeNumber.trim()) {
      setError('storeNumber');
      scrollToError(contactRef);
      showAlert({
        title: '연락처를 입력해주세요',
        message: '고객 문의를 위한 매장 연락처가 필요합니다.',
      });
      return false;
    }

    if (!storeContent.trim()) {
      setError('storeContent');
      scrollToError(contentRef);
      showAlert({
        title: '매장 소개를 입력해주세요',
        message: '매장만의 특징을 자유롭게 작성해주세요.',
      });
      return false;
    }

    return true;
  }, [
    imageUris.length,
    storename,
    address,
    selectedCategory.length,
    is24Hours,
    hasCompletedOperatingHours,
    alcohol.length,
    storeNumber,
    storeContent,
    scrollToError,
    imageRef,
    nameRef,
    addressRef,
    categoryRef,
    operatingRef,
    alcoholRef,
    contactRef,
    contentRef,
    showAlert,
  ]);

  const handleSave = useCallback(async () => {
    setError('');
    if (!validateForm() || !storeId) return;

    const operationInfoDtos = buildOperationInfoDtos();
    const {added, deleted} = splitImageChanges(imageUris, originalImages);
    const normalizedCurrentImages = normalizeImages(imageUris);

    const diffPayload = {};
    if (initialSnapshotRef.current) {
      const initial = initialSnapshotRef.current;
      const current = currentSnapshot;

      if (current.name !== initial.name) {
        diffPayload.name = current.name;
      }

      if (current.storeNumber !== initial.storeNumber) {
        diffPayload.contact = current.storeNumber;
      }

      if (current.storeContent !== initial.storeContent) {
        diffPayload.description = current.storeContent;
      }

      const locationChanged =
        current.address !== initial.address ||
        current.addressDetail !== initial.addressDetail ||
        current.latitude !== initial.latitude ||
        current.longitude !== initial.longitude;
      if (locationChanged) {
        diffPayload.locationDto = {
          address: current.address,
          addressDetail: current.addressDetail,
          latitude: current.latitude,
          longitude: current.longitude,
        };
      }

      if (!shallowEqual(current.categories, initial.categories)) {
        diffPayload.categories = current.categories.filter(
          value => value && value !== '-',
        );
      }

      if (!shallowEqual(current.alcohol, initial.alcohol)) {
        diffPayload.mainDrinkTypes = current.alcohol;
      }

      if (!shallowEqual(current.facilities, initial.facilities)) {
        diffPayload.facilitiesInfoDto = current.facilities;
      }

      if (current.is24Hours !== initial.is24Hours) {
        diffPayload.isAlwaysOpen = current.is24Hours;
      }

      const operationChanged =
        !shallowEqual(current.operatingHours, initial.operatingHours) ||
        !shallowEqual(current.breakingHours, initial.breakingHours) ||
        !shallowEqual(current.closedDay, initial.closedDay);

      const needsOperationInfo =
        !current.is24Hours &&
        (operationChanged || current.is24Hours !== initial.is24Hours);

      if (needsOperationInfo) {
        diffPayload.operationInfoDtos = operationInfoDtos;
        if (typeof diffPayload.isAlwaysOpen === 'undefined') {
          diffPayload.isAlwaysOpen = current.is24Hours;
        }
      }

      if (!shallowEqual(current.moods, initial.moods)) {
        diffPayload.moods = current.moods;
      }
    }

    const shouldUpdateStore = Object.keys(diffPayload).length > 0;

    try {
      setLoading(true);
      if (shouldUpdateStore) {
        console.log('[StoreUpdateScreen] 매장 정보 수정 요청 페이로드', {
          storeId,
          payload: diffPayload,
        });
        const updateResponse = await UpdateStore(storeId, diffPayload);
        console.log('[StoreUpdateScreen] 매장 정보 수정 응답', updateResponse);
      }

      if (deleted.length) {
        console.log('[StoreUpdateScreen] 매장 이미지 삭제 요청 페이로드', {
          storeId,
          deleted,
        });
        const deletedResponse = await DeleteStoreImage(storeId, deleted);
        console.log(
          '[StoreUpdateScreen] 매장 이미지 삭제 응답',
          deletedResponse,
        );
        if (deletedResponse?.length) {
          const payload = {mainImgUrl: deletedResponse[0]};
          console.log(
            '[StoreUpdateScreen] 메인 이미지 갱신 요청 페이로드(삭제 결과)',
            {
              storeId,
              payload,
            },
          );
          const mainImgUpdateResponse = await UpdateStore(storeId, payload);
          console.log(
            '[StoreUpdateScreen] 메인 이미지 갱신 응답(삭제 결과)',
            mainImgUpdateResponse,
          );
        }
      }

      if (added.length) {
        console.log('[StoreUpdateScreen] 매장 이미지 업로드 요청 페이로드', {
          storeId,
          added,
        });
        const uploadResponse = await UpdateStoreImage(storeId, added);
        console.log(
          '[StoreUpdateScreen] 매장 이미지 업로드 응답',
          uploadResponse,
        );
        if (uploadResponse?.length) {
          const payload = {mainImgUrl: uploadResponse[0]};
          console.log(
            '[StoreUpdateScreen] 메인 이미지 갱신 요청 페이로드(업로드 결과)',
            {
              storeId,
              payload,
            },
          );
          const mainImgUpdateResponse = await UpdateStore(storeId, payload);
          console.log(
            '[StoreUpdateScreen] 메인 이미지 갱신 응답(업로드 결과)',
            mainImgUpdateResponse,
          );
        }
      }

      initialSnapshotRef.current = currentSnapshot;
      initialSnapshotStringRef.current = serializeSnapshot(currentSnapshot);
      setOriginalImages(normalizedCurrentImages);
      setHasChanges(false);

      showAlert({
        title: '저장 완료',
        message: '매장 정보가 수정되었어요.',
        onConfirm: () => exitScreen(),
      });
    } catch (error) {
      showAlert({
        title: '수정에 실패했어요',
        message: '잠시 후 다시 시도해주세요.',
      });
    } finally {
      setLoading(false);
    }
  }, [
    validateForm,
    storeId,
    buildOperationInfoDtos,
    imageUris,
    originalImages,
    currentSnapshot,
    showAlert,
    exitScreen,
  ]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: 140 + insets.bottom},
          ]}>
          <View ref={imageRef}>
            <StoreImage
              imageUris={imageUris}
              setImageUris={setImageUris}
              error={error}
              setLoading={setLoading}
            />
          </View>

          <View ref={nameRef}>
            <StoreAddname
              storename={storename}
              setStorename={setStorename}
              error={error}
            />
          </View>

          <View ref={addressRef}>
            <StoreAddress
              address={address}
              detailedAddress={detailedAddress}
              setDetailedAddress={setDetailedAddress}
              navigation={navigation}
              onAddressSelect={handleAddressSelect}
              location={coords}
              error={error}
              screen="StoreUpdateScreen"
            />
          </View>

          <StoreMood moodInfo={moodInfo} setMoodInfo={setMoodInfo} />

          <View ref={categoryRef}>
            <StoreCategory
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              error={error}
            />
          </View>

          <View ref={operatingRef}>
            <OperatingHoursPreview
              storeTimeHandle={storeTimeHandle}
              is24Hours={is24Hours}
              operatingHours={operatingHours}
              breakingHours={breakingHours}
              closedDay={closedDay}
              error={error}
            />
          </View>

          <View ref={alcoholRef}>
            <StoreAlcohol
              alcohol={alcohol}
              setAlcohol={setAlcohol}
              error={error}
            />
          </View>

          <View ref={facilitiesRef}>
            <StoreFacilitiesInfo
              facilitiesInfo={facilitiesInfo}
              setFacilitiesInfo={setFacilitiesInfo}
              error={error}
            />
          </View>

          <View ref={contactRef}>
            <StorAddeNumber
              storeNumber={storeNumber}
              setStoreNumber={setStoreNumber}
              error={error}
              onFocusInput={scrollToInput}
            />
          </View>

          <View ref={contentRef}>
            <StoreAddContent
              storeContent={storeContent}
              setStoreContent={setStoreContent}
              error={error}
              onFocusInput={scrollToInput}
            />
          </View>
        </ScrollView>

        <BottomActionButton
          label="저장하기"
          onPress={handleSave}
          disabled={!hasChanges || loading}
          cancel
          cancelLabel="취소"
          onCancel={() => handleCancelPress()}
        />
      </KeyboardAvoidingView>
      <AlertComponent />
      <Loading loading={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 160,
  },
});

export default StoreUpdateScreen;
