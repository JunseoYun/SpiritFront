// StoreAddTimeSetScreen.js
import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
  useLayoutEffect,
} from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';

import Ionicons from 'react-native-vector-icons/Ionicons';

import ClosedDaySelector from '../../components/StoreAddScreen/StoreAddTimeSet/ClosedDaySelector';
import OperatingHoursToggle from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursToggle';
import OperatingHoursCheckbox from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursCheckbox';
import OperatingHoursInput from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursInput';
import OperatingHoursTimePicker from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursTimePicker';
import BreakTimeInput from '../../components/StoreAddScreen/StoreAddTimeSet/BreakTimeInput';
import BreakTimePicker from '../../components/StoreAddScreen/StoreAddTimeSet/BreakTimePicker';
import BreakTimeToggle from '../../components/StoreAddScreen/StoreAddTimeSet/BreakTimeToggle';
import BottomSheet from '@gorhom/bottom-sheet';
import TimePicker from '../../hooks/TimePicker';
import CloseTimePicker from '../../hooks/CloseTimePicker';
const days = [
  {label: '월', value: 'MONDAY'},
  {label: '화', value: 'TUESDAY'},
  {label: '수', value: 'WEDNESDAY'},
  {label: '목', value: 'THURSDAY'},
  {label: '금', value: 'FRIDAY'},
  {label: '토', value: 'SATURDAY'},
  {label: '일', value: 'SUNDAY'},
];

const StoreAddTimeSetScreen = ({navigation, route}) => {
  const {
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
  } = route.params;

  const convertToMinutes = (hour, minute) =>
    parseInt(hour, 10) * 60 + parseInt(minute, 10);

  const getDefaultTime = (time, defaultValue) => time ?? defaultValue;

  const [timeState, setTimeState] = useState({
    sameOpenTime: {
      openHour: getDefaultTime(operatingHours?.Monday?.openHour, '09'),
      openMinute: getDefaultTime(operatingHours?.Monday?.openMinute, '00'),
    },
    sameCloseTime: {
      closedHour: getDefaultTime(operatingHours?.Monday?.closedHour, '18'),
      closedMinute: getDefaultTime(operatingHours?.Monday?.closedMinute, '00'),
    },
    sameStartTime: {
      startHour: getDefaultTime(breakingHours?.Monday?.startHour, '15'),
      startMinute: getDefaultTime(breakingHours?.Monday?.startMinute, '00'),
    },
    sameEndTime: {
      endHour: getDefaultTime(breakingHours?.Monday?.endHour, '17'),
      endMinute: getDefaultTime(breakingHours?.Monday?.endMinute, '00'),
    },
  });
  const [localClosedDay, setLocalClosedDay] = useState(closedDay || []);
  const [isClosed, setIsClosed] = useState(localClosedDay.length > 0);
  const [isSameEveryday, setIsSameEveryday] = useState(isSameEveryTime);
  const [is24, setIs24] = useState(is24Hours);
  const [isOpenTime, setIsOpenTime] = useState(false);
  const [isCloseTime, setIsCloseTime] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null); // 선택한 요일 정보 저장
  const [hasLocalBreaking, setHasLocalBreaking] = useState(hasBreaking);
  const [isStartTime, setIsStartTime] = useState(false);
  const [isEndTime, setIsEndTime] = useState(false);
  const [wrongBreak, setWrongBreak] = useState(false);
  const [isSameOperating, setIsSameOperating] = useState(false);
  const [operateError, setOperateError] = useState(false);
  const [breakError, setBreakError] = useState(false);
  const [isAllClosed, setIsAllClosed] = useState(false);
  const [tempState, setTempState] = useState({
    tempOperating: {},
    tempBreaking: {},
  });

  const [localOperatingHours, setLocalOperatingHours] = useState(() => {
    const hasOperatingHours = Object.values(operatingHours).some(
      ({openHour, closedHour}) => openHour !== '' && closedHour !== '',
    );
    if (hasOperatingHours === true) {
      return JSON.parse(JSON.stringify(operatingHours)); // 기존 데이터 복사
    } else {
      const defaultHours = {};
      days.forEach(({value: day}) => {
        const formattedDay = day.charAt(0) + day.slice(1).toLowerCase();
        defaultHours[formattedDay] = {
          openHour: '09',
          openMinute: '00',
          closedHour: '18',
          closedMinute: '00',
        };
      });
      return defaultHours;
    }
  });
  const [localBreakingHours, setLocalBreakingHours] = useState(
    JSON.parse(JSON.stringify(breakingHours)), // 기존 데이터 복사
  );

  const scrollViewRef = useRef(null);
  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ['90%'], []);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={handleComplete}>
          <Text
            style={[
              styles.searchButton,
              (wrongBreak || isSameOperating) &&
                isSameEveryday && {color: '#999'},

              (breakError || operateError) &&
                !isSameEveryday && {color: '#999'},
              isAllClosed && {color: '#999'},
            ]}>
            완료
          </Text>
        </Pressable>
      ),
    });
  }, [
    handleComplete, // 최신 handleComplete 함수 반영
    isSameEveryday,
    isSameOperating,
    wrongBreak,
    timeState,
    localOperatingHours,
    localBreakingHours,
    hasLocalBreaking,
    localClosedDay,
    is24,
  ]);
  const handleComplete = () => {
    if (isAllClosed) {
      return;
    }
    if (isSameEveryday) {
      if (isSameOperating || wrongBreak) {
        return;
      }
      // 🔹 같은 영업 시간 적용 (모든 요일에 동일한 시간 저장)
      const updatedOperatingHours = {};
      const updatedBreakingHours = {};

      days.forEach(({value: day}) => {
        const formattedDay = day.charAt(0) + day.slice(1).toLowerCase();

        // 운영 시간 적용
        updatedOperatingHours[formattedDay] = {
          openHour: timeState.sameOpenTime.openHour,
          openMinute: timeState.sameOpenTime.openMinute,
          closedHour: timeState.sameCloseTime.closedHour,
          closedMinute: timeState.sameCloseTime.closedMinute,
        };
        // 브레이크타임 적용
        if (hasLocalBreaking) {
          updatedBreakingHours[formattedDay] = {
            startHour: timeState.sameStartTime.startHour,
            startMinute: timeState.sameStartTime.startMinute,
            endHour: timeState.sameEndTime.endHour,
            endMinute: timeState.sameEndTime.endMinute,
          };
        } else {
          updatedBreakingHours[formattedDay] = {
            startHour: '',
            startMinute: '',
            endHour: '',
            endMinute: '',
          };
        }
      });
      setClosedDay(localClosedDay);
      setHasBreaking(hasLocalBreaking);
      setOperatingHours(updatedOperatingHours);
      setBreakingHours(updatedBreakingHours);
      setIs24Hours(is24);
    } else {
      if (breakError || operateError) {
        return;
      }
      setOperatingHours(localOperatingHours);
      setBreakingHours(localBreakingHours);
      setClosedDay(localClosedDay);
      setIs24Hours(is24);
    }

    // 설정 저장 후 이전 화면으로 이동
    navigation.goBack();
  };

  const handleTimePickerToggle = type => {
    setIsOpenTime(type === 'open' ? prev => !prev : false);
    setIsCloseTime(type === 'close' ? prev => !prev : false);
    setIsStartTime(type === 'start' ? prev => !prev : false);
    setIsEndTime(type === 'end' ? prev => !prev : false);
  };

  const [breakErrorMessage, setBreakErrorMessage] = useState('');

  const [operateErrorMessage, setOperateErrorMessage] = useState('');

  const handleTimeChange = (category, field, value) => {
    setTimeState(prevState => {
      const newState = {
        ...prevState,
        [category]: {
          ...prevState[category],
          [field]: value,
        },
      };
      const opStart = convertToMinutes(
        newState.sameOpenTime.openHour,
        newState.sameOpenTime.openMinute,
      );
      const opEnd = convertToMinutes(
        newState.sameCloseTime.closedHour,
        newState.sameCloseTime.closedMinute,
      );

      let operateErrorMessage = '';

      if (opStart === opEnd) {
        operateErrorMessage = '영업시작 시간과 종료시간을 다르게 설정해주세요.';
        setIsSameOperating(true);
      } else if (
        newState.sameCloseTime.closedHour >= 24 &&
        opEnd - 1440 >= opStart
      ) {
        operateErrorMessage =
          '영업종료 시간을 영업시작 시간 이전으로 설정해주세요.';
        setIsSameOperating(true);
      } else if (newState.sameCloseTime.closedHour < 24 && opStart > opEnd) {
        operateErrorMessage =
          '영업종료 시간을 영업시작 시간 이후로 설정해주세요.';
        setIsSameOperating(true);
      } else {
        setIsSameOperating(false);
        operateErrorMessage = '';
      }
      setOperateErrorMessage(operateErrorMessage);

      return newState;
    });
  };
  useEffect(() => {
    const opStart = convertToMinutes(
      timeState.sameOpenTime.openHour,
      timeState.sameOpenTime.openMinute,
    );
    const opEnd = convertToMinutes(
      timeState.sameCloseTime.closedHour,
      timeState.sameCloseTime.closedMinute,
    );
    const brStart = convertToMinutes(
      timeState.sameStartTime.startHour,
      timeState.sameStartTime.startMinute,
    );
    const brEnd = convertToMinutes(
      timeState.sameEndTime.endHour,
      timeState.sameEndTime.endMinute,
    );

    let errorMessage = '';

    if (brStart === brEnd) {
      errorMessage =
        '브레이크타임 시작 시간과 종료 시간을 다르게 설정해주세요.';
      setWrongBreak(true);
    } else if (brEnd < brStart) {
      errorMessage =
        '브레이크타임 시작 시간을 종료 시간 이전으로 설정해주세요.';
      setWrongBreak(true);
    } else if (opStart >= brStart || opEnd <= brEnd) {
      errorMessage = '영업 시간은 브레이크타임을 포함하도록 설정해주세요.';
      setWrongBreak(true);
    } else {
      setWrongBreak(false);
      errorMessage = '';
    }
    setBreakErrorMessage(errorMessage);
  }, [timeState]);

  const handleBottomOpen = day => {
    setSelectedDay(day);
    setIsBottomSheetVisible(true);
    bottomSheetRef.current?.expand();

    const formattedDay = day.value.charAt(0) + day.value.slice(1).toLowerCase();

    // 현재 값을 복사해서 임시 저장
    setTempState({
      tempOperating: {...localOperatingHours[formattedDay]},
      tempBreaking: {...(localBreakingHours[formattedDay] || {})},
    });
  };

  const handleCancelChanges = () => {
    if (selectedDay) {
      const formattedDay =
        selectedDay.value.charAt(0) + selectedDay.value.slice(1).toLowerCase();

      // 🔹 원래 값으로 복구
      setLocalOperatingHours(prev => ({
        ...prev,
        [formattedDay]: {...tempState.tempOperating},
      }));

      setLocalBreakingHours(prev => ({
        ...prev,
        [formattedDay]: {...tempState.tempBreaking},
      }));
      setBreakError(false);
      setOperateError(false);
      setBreakErrorMessage('');
      setOperateErrorMessage('');
    }

    // 🔹 바텀시트 닫기
    handleBottomClose();
  };

  const handleBottomClose = () => {
    bottomSheetRef.current?.close();
  };

  // 바텀시트 닫힐 때 상태 업데이트
  const onBottomSheetClose = () => {
    setIsBottomSheetVisible(false);
    setIsOpenTime(false);
    setIsCloseTime(false);
    setIsStartTime(false);
    setIsEndTime(false);
  };

  const handleBreaking = useCallback(
    day => {
      setLocalBreakingHours(prevState => {
        const updatedState = {...prevState};

        if (prevState[day]) {
          // 🔹 브레이크타임 삭제
          delete updatedState[day];
          setBreakError(false);
        } else {
          // 🔹 브레이크타임 추가 (자동으로 적절한 시간 설정)
          const openHour = localOperatingHours[day]?.openHour || '09';
          const openMinute = localOperatingHours[day]?.openMinute || '00';
          const closeHour = localOperatingHours[day]?.closedHour || '18';
          const closeMinute = localOperatingHours[day]?.closedMinute || '00';

          let startHour, startMinute, endHour, endMinute;

          if (openMinute !== '55') {
            startHour = openHour;
            startMinute = String(Number(openMinute) + 5).padStart(2, '0');
          } else {
            startHour = String(Number(openHour) + 1).padStart(2, '0');
            startMinute = '00';
          }

          if (closeMinute === '00') {
            endHour = String(Number(closeHour) - 1).padStart(2, '0');
            endMinute = '55';
          } else {
            endHour = closeHour;
            endMinute = String(Number(closeMinute) - 5).padStart(2, '0');
          }

          updatedState[day] = {
            startHour,
            startMinute,
            endHour,
            endMinute,
          };
        }

        // 🔹 특정 날짜만 유효성 검사 실행
        validateBreakingHours(day, updatedState);

        return updatedState;
      });
    },
    [localOperatingHours, setLocalBreakingHours],
  );
  const validateBreakingHours = (day, updatedState) => {
    const brStart = convertToMinutes(
      updatedState[day]?.startHour,
      updatedState[day]?.startMinute,
    );
    const brEnd = convertToMinutes(
      updatedState[day]?.endHour,
      updatedState[day]?.endMinute,
    );

    const opStart = convertToMinutes(
      localOperatingHours[day]?.openHour,
      localOperatingHours[day]?.openMinute,
    );
    const opEnd = convertToMinutes(
      localOperatingHours[day]?.closedHour,
      localOperatingHours[day]?.closedMinute,
    );

    let errorMessage = '';
    let hasError = false;

    // 🔹 브레이크타임이 시작과 종료가 같으면 오류
    if (brStart === brEnd) {
      errorMessage =
        '브레이크타임 시작 시간과 종료 시간을 다르게 설정해주세요.';
      hasError = true;
    }
    // 🔹 브레이크타임이 영업 시간 내에 포함되지 않으면 오류
    else if (brStart < opStart || brEnd > opEnd) {
      errorMessage = '브레이크타임은 영업 시간 내에 포함되어야 합니다.';
      hasError = true;
    }
    // 🔹 브레이크타임이 종료 시간보다 빠르면 오류
    else if (brEnd < brStart) {
      errorMessage =
        '브레이크타임 시작 시간을 종료 시간 이전으로 설정해주세요.';
      hasError = true;
    }

    // 🔹 오류 상태 업데이트
    setBreakError(hasError);
    setBreakErrorMessage(errorMessage);
  };

  const handleIsBreaking = () => {
    setHasLocalBreaking(prev => {
      const newValue = !prev;
      if (newValue) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({animated: true});
        }, 100);
      }
      return newValue;
    });

    setTimeState(prevState => {
      let newState = {...prevState};

      if (!hasLocalBreaking) {
        if (prevState.sameOpenTime.openMinute !== '55') {
          newState.sameStartTime = {
            startHour: prevState.sameOpenTime.openHour,
            startMinute: String(
              Number(prevState.sameOpenTime.openMinute) + 5,
            ).padStart(2, '0'),
          };
        } else {
          newState.sameStartTime = {
            startHour: String(
              Number(prevState.sameOpenTime.openHour) + 1,
            ).padStart(2, '0'),
            startMinute: String(
              Number(prevState.sameOpenTime.openMinute) - 55,
            ).padStart(2, '0'),
          };
        }

        if (prevState.sameCloseTime.closedMinute === '00') {
          newState.sameEndTime = {
            endHour: String(
              Number(prevState.sameCloseTime.closedHour) - 1,
            ).padStart(2, '0'),
            endMinute: String(
              Number(prevState.sameCloseTime.closedMinute) + 55,
            ).padStart(2, '0'),
          };
        } else {
          newState.sameEndTime = {
            endHour: prevState.sameCloseTime.closedHour,
            endMinute: String(
              Number(prevState.sameCloseTime.closedMinute) - 5,
            ).padStart(2, '0'),
          };
        }
      } else {
        newState.sameStartTime = {startHour: '', startMinute: ''};
        newState.sameEndTime = {endHour: '', endMinute: ''};
      }

      return newState;
    });
  };

  useEffect(() => {
    if (!operatingHours?.Monday?.openHour) {
      setTimeState(prevState => ({
        ...prevState,
        sameOpenTime: {openHour: '09', openMinute: '00'},
        sameCloseTime: {closedHour: '18', closedMinute: '00'},
      }));
    }
  }, [operatingHours]);

  useEffect(() => {
    if (!isClosed) {
      setLocalClosedDay([]);
      setClosedDay([]);
    }
  }, [isClosed]);

  const toggle24Hours = () => {
    if (isSameEveryday) {
      setIs24(prev => !prev);
    }
    if (!is24) {
      setIsClosed(false);
      setLocalClosedDay([]);
      setClosedDay([]);
    }
  };

  const handleDiffOperating = (day, field, value) => {
    let newDiffOperating = {...localOperatingHours?.[day]};
    let isSameOperating = false;
    let isOverTime = false;

    setLocalOperatingHours(prevState => {
      const newState = {
        ...prevState,
        [day]: {
          ...prevState[day],
          [field]: value,
        },
      };
      return newState;
    });
    newDiffOperating[field] = value;

    // 영업 시작과 종료 시간을 분 단위로 변환
    const opStart = convertToMinutes(
      newDiffOperating.openHour,
      newDiffOperating.openMinute,
    );
    const opEnd = convertToMinutes(
      newDiffOperating.closedHour,
      newDiffOperating.closedMinute,
    );

    let operateErrorMessage = '';
    if (opStart === opEnd) {
      operateErrorMessage = '영업시작 시간과 종료시간을 다르게 설정해주세요.';
      // setOperateError(true);
      isSameOperating = true;
    } else if (newDiffOperating.closedHour >= 24 && opEnd - 1440 >= opStart) {
      operateErrorMessage =
        '영업종료 시간을 영업시작 시간 이전으로 설정해주세요.';
      // setOperateError(true);

      isSameOperating = true;
    } else if (newDiffOperating.closedHour < 24 && opStart > opEnd) {
      operateErrorMessage =
        '영업종료 시간을 영업시작 시간 이후로 설정해주세요.';
      // setOperateError(true);

      isSameOperating = true;
    } else {
      // setOperateError(false);

      isSameOperating = false;
      operateErrorMessage = '';
    }
    setOperateErrorMessage(operateErrorMessage);

    const currentIndex = days.findIndex(d => d.value === day.toUpperCase());
    const prevIndex = (currentIndex - 1 + days.length) % days.length; // 이전 요일 (일요일 → 월요일 예외 처리)
    const prevDay =
      days[prevIndex].value.charAt(0) +
      days[prevIndex].value.slice(1).toLowerCase(); // 포맷팅
    const prevOpEnd = convertToMinutes(
      localOperatingHours[prevDay]?.closedHour,
      localOperatingHours[prevDay]?.closedMinute,
    );
    const nextIndex = (currentIndex + 1 + days.length) % days.length; // 이전 요일 (일요일 → 월요일 예외 처리)
    const nextDay =
      days[nextIndex].value.charAt(0) +
      days[nextIndex].value.slice(1).toLowerCase(); // 포맷팅
    const nextOpStart = convertToMinutes(
      localOperatingHours[nextDay]?.openHour,
      localOperatingHours[nextDay]?.openMinute,
    );

    const isPrevDayClosed = localClosedDay.includes(
      days[prevIndex].value.toUpperCase(),
    ); // 이전날 휴무 여부
    const isNextDayClosed = localClosedDay.includes(
      days[nextIndex].value.toUpperCase(),
    ); // 다음날 휴무 여부

    if (isPrevDayClosed && isNextDayClosed) {
      isOverTime = false;
    } else if (isPrevDayClosed && !isNextDayClosed) {
      if (newDiffOperating.closedHour >= 24 && opEnd - 1440 >= nextOpStart) {
        operateErrorMessage =
          '영업종료 시간을 다음날 영업시작 시간 이전으로 설정해주세요.';
        // setOperateError(true);
        isOverTime = true;
      } else {
        // setOperateError(false);
        isOverTime = false;
        operateErrorMessage = '';
      }
    } else if (isNextDayClosed && !isPrevDayClosed) {
      if (
        localOperatingHours[prevDay]?.closedHour >= 24 &&
        prevOpEnd - 1440 >= opStart
      ) {
        operateErrorMessage =
          '영업시작 시간을 전날 영업종료 시간 이후로 설정해주세요.';
        // setOperateError(true);
        isOverTime = true;
      } else {
        // setOperateError(false);
        isOverTime = false;
        operateErrorMessage = '';
      }
    } else {
      if (
        localOperatingHours[prevDay]?.closedHour >= 24 &&
        prevOpEnd - 1440 >= opStart
      ) {
        operateErrorMessage =
          '영업시작 시간을 전날 영업종료 시간 이후로 설정해주세요.';
        // setOperateError(true);
        isOverTime = true;
      } else if (
        newDiffOperating.closedHour >= 24 &&
        opEnd - 1440 >= nextOpStart
      ) {
        operateErrorMessage =
          '영업종료 시간을 다음날 영업시작 시간 이전으로 설정해주세요.';
        // setOperateError(true);
        isOverTime = true;
      }
    }
    setOperateError(isSameOperating || isOverTime);
    setOperateErrorMessage(operateErrorMessage);

    let isBreakInvalid = false;
    if (localBreakingHours?.[day]) {
      const brStart = convertToMinutes(
        localBreakingHours[day]?.startHour,
        localBreakingHours[day]?.startMinute,
      );
      const brEnd = convertToMinutes(
        localBreakingHours[day]?.endHour,
        localBreakingHours[day]?.endMinute,
      );

      if (brStart <= opStart || brEnd >= opEnd) {
        isBreakInvalid = true;
      }
    }

    setBreakError(isBreakInvalid);
  };

  const handleDiffBreaking = (day, field, value) => {
    // let isInvalid = false;
    let newDiffBreaking = {...localBreakingHours?.[day]};
    setLocalBreakingHours(prevState => {
      const newState = {
        ...prevState,
        [day]: {
          ...prevState[day],
          [field]: value,
        },
      };
      return newState;
    });
    newDiffBreaking[field] = value;
    const brStart = convertToMinutes(
      newDiffBreaking.startHour,
      newDiffBreaking.startMinute,
    );
    const brEnd = convertToMinutes(
      newDiffBreaking.endHour,
      newDiffBreaking.endMinute,
    );

    const opStart = convertToMinutes(
      localOperatingHours[day]?.openHour,
      localOperatingHours[day]?.openMinute,
    );
    const opEnd = convertToMinutes(
      localOperatingHours[day]?.closedHour,
      localOperatingHours[day]?.closedMinute,
    );

    let errorMessage = '';

    if (brStart <= opStart || brEnd >= opEnd) {
      errorMessage = '브레이크타임은 영업 시간에 포함되도록 설정해주세요.';
      setBreakError(true);
    } else if (brStart === brEnd) {
      errorMessage =
        '브레이크타임 시작 시간과 종료 시간을 다르게 설정해주세요.';
      setBreakError(true);
    } else if (brStart > brEnd) {
      errorMessage = '브레이크타임 종료 시간을 시작 시간 이후로 설정해주세요.';
      setBreakError(true);
    } else {
      setBreakError(false);
    }
    setBreakErrorMessage(errorMessage);
  };

  return (
    <TouchableWithoutFeedback>
      <View style={styles.container}>
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{paddingBottom: 100}}
          showsVerticalScrollIndicator={false}>
          <ClosedDaySelector
            days={days}
            isClosed={isClosed}
            setIsClosed={setIsClosed}
            localClosedDay={localClosedDay}
            setLocalClosedDay={setLocalClosedDay}
            setClosedDay={setClosedDay}
            setIs24={setIs24}
            setIs24Hours={setIs24Hours}
            handleBottomClose={handleBottomClose}
            setIsAllClosed={setIsAllClosed}
          />
          <View style={styles.division} />

          <OperatingHoursToggle
            isSameEveryday={isSameEveryday}
            setIsSameEveryday={setIsSameEveryday}
            setIsSameEveryTime={setIsSameEveryTime}
            handleBottomClose={handleBottomClose}
            setIs24={setIs24}
          />
          {isSameEveryday ? (
            <>
              <OperatingHoursCheckbox
                isSameEveryday={isSameEveryday}
                is24={is24}
                toggle24Hours={toggle24Hours}
              />
              {/* 간단한 현재 시간 표시 */}
              {!is24 && (
                <OperatingHoursInput
                  sameOpenTime={timeState.sameOpenTime}
                  sameCloseTime={timeState.sameCloseTime}
                  isOpenTime={isOpenTime}
                  isCloseTime={isCloseTime}
                  wrongBreak={wrongBreak}
                  isSameOperating={isSameOperating}
                  handleTimePickerToggle={handleTimePickerToggle}
                />
              )}

              {!is24 && (isOpenTime || isCloseTime) && (
                <OperatingHoursTimePicker
                  isOpenTime={isOpenTime}
                  sameOpenTime={timeState.sameOpenTime}
                  sameCloseTime={timeState.sameCloseTime}
                  wrongBreak={wrongBreak}
                  isSameOperating={isSameOperating}
                  handleTimeChange={handleTimeChange}
                  handleTimePickerToggle={handleTimePickerToggle}
                  operateErrorMessage={operateErrorMessage}
                />
              )}
              {isSameOperating ? (
                <Text style={styles.wrongText}>{operateErrorMessage}</Text>
              ) : wrongBreak ? (
                <Text style={styles.wrongText}>
                  영업 시간은 브레이크타임을 포함하도록 설정해주세요.
                </Text>
              ) : null}
              <View
                style={{
                  width: '100%',
                  height: 1,
                  backgroundColor: '#EAEAEA',
                  marginTop: 30,
                }}
              />
              {!is24 && hasLocalBreaking && (
                <>
                  <BreakTimeInput
                    sameStartTime={timeState.sameStartTime}
                    sameEndTime={timeState.sameEndTime}
                    isStartTime={isStartTime}
                    isEndTime={isEndTime}
                    wrongBreak={wrongBreak}
                    handleTimePickerToggle={handleTimePickerToggle}
                  />

                  {(isStartTime || isEndTime) && (
                    <BreakTimePicker
                      isStartTime={isStartTime}
                      sameStartTime={timeState.sameStartTime}
                      sameEndTime={timeState.sameEndTime}
                      wrongBreak={wrongBreak}
                      handleTimeChange={handleTimeChange}
                      handleTimePickerToggle={handleTimePickerToggle}
                      breakErrorMessage={breakErrorMessage}
                    />
                  )}
                  {wrongBreak && (
                    <Text style={styles.wrongText}>{breakErrorMessage}</Text>
                  )}
                  <View
                    style={{
                      width: '100%',
                      height: 1,
                      backgroundColor: '#EAEAEA',
                      marginTop: 30,
                    }}
                  />
                </>
              )}
              {!is24 && (
                <BreakTimeToggle
                  hasBreaking={hasLocalBreaking}
                  handleIsBreaking={handleIsBreaking}
                />
              )}
            </>
          ) : (
            // 요일마다 다름일 때
            days.map((day, index, array) => {
              const isLastItem = index === array.length - 1; // 마지막 요소 확인
              const isClosedDay = localClosedDay.includes(day.value); // 휴무일 여부 확인

              const formattedDay =
                day.value.charAt(0) + day.value.slice(1).toLowerCase();
              const openHour =
                localOperatingHours?.[formattedDay]?.openHour || '09';
              const openMinute =
                localOperatingHours?.[formattedDay]?.openMinute || '00';
              const closeHour =
                localOperatingHours?.[formattedDay]?.closedHour || '18';
              const closeMinute =
                localOperatingHours?.[formattedDay]?.closedMinute || '00';

              const breakStartHour =
                localBreakingHours?.[formattedDay]?.startHour;
              const breakStartMinute =
                localBreakingHours?.[formattedDay]?.startMinute;
              const breakEndHour = localBreakingHours?.[formattedDay]?.endHour;
              const breakEndMinute =
                localBreakingHours?.[formattedDay]?.endMinute;
              return (
                <Pressable
                  key={day.value}
                  onPress={() => !isClosedDay && handleBottomOpen(day)}
                  style={[
                    styles.dayContainer,
                    isLastItem && {borderBottomWidth: 0}, // 마지막 요소 보더 제거
                    isClosedDay && styles.disabled,
                    !isClosedDay && breakStartHour && {paddingVertical: 15},
                  ]}>
                  <Text style={styles.operateDayText}>{day.label}요일</Text>
                  <View style={[styles.timeConatainer]}>
                    <View>
                      <View style={styles.timeInputView}>
                        {isClosedDay ? (
                          <Text style={styles.holidayText}>휴무</Text>
                        ) : (
                          <>
                            <Text style={styles.timeInputTitle}>영업 시간</Text>
                            <Text style={styles.timeInputText}>
                              {openHour
                                ? `${openHour}:${openMinute} ~ ${
                                    closeHour >= 24
                                      ? `다음날 ${String(
                                          closeHour - 24,
                                        ).padStart(2, '0')}`
                                      : String(closeHour).padStart(2, '0')
                                  }:${closeMinute}`
                                : '미설정'}
                            </Text>
                          </>
                        )}
                      </View>
                      {isClosedDay
                        ? null
                        : breakStartHour && (
                            <View style={styles.timeInputView}>
                              <Text style={styles.timeInputTitle}>
                                브레이크타임
                              </Text>

                              <Text style={styles.timeInputText}>
                                {breakStartHour
                                  ? `${breakStartHour}:${breakStartMinute} ~ ${
                                      breakEndHour >= 24
                                        ? `다음날 ${String(
                                            breakEndHour - 24,
                                          ).padStart(2, '0')}`
                                        : String(breakEndHour).padStart(2, '0')
                                    }:${breakEndMinute}`
                                  : '미설정'}
                              </Text>
                            </View>
                          )}
                    </View>
                    {!isClosedDay && (
                      <Octicons
                        name="chevron-right"
                        size={20}
                        color="#4B4B4B"
                        style={styles.icons}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })
          )}
        </ScrollView>
        {isBottomSheetVisible && selectedDay && (
          <BottomSheet
            ref={bottomSheetRef}
            index={0}
            snapPoints={snapPoints}
            // enablePanDownToClose={true}
            enablePanDownToClose={false}
            gestureEnabled={false}
            handleIndicatorStyle={{display: 'none'}}
            backgroundStyle={{
              backgroundColor: '#FDFDFD',
              borderTopLeftRadius: 35,
              borderTopRightRadius: 35,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: -3},
              shadowOpacity: 0.2,
              shadowRadius: 5,
              elevation: 10,
            }}
            onClose={onBottomSheetClose} // 바텀시트 닫힐 때 상태 변경
          >
            <View style={styles.bottomSheetContent}>
              {/* <Text style={styles.sheetTitle}>
                {selectedDay.label}요일 영업 정보
              </Text> */}
              <View style={styles.bottomSheetHeader}>
                <Text style={styles.sheetTitle}>
                  {selectedDay.label}요일 영업 정보
                </Text>
                <Pressable
                  onPress={handleCancelChanges}
                  style={styles.closeButton}>
                  <Ionicons
                    name="close"
                    size={25}
                    color="4B4B4B"
                    // style={{marginRight: 18}}
                  />
                </Pressable>
              </View>

              {/* 요일 포맷팅 */}
              {(() => {
                const formattedDay =
                  selectedDay.value.charAt(0) +
                  selectedDay.value.slice(1).toLowerCase();
                const openHour =
                  localOperatingHours?.[formattedDay]?.openHour || '09';
                const openMinute =
                  localOperatingHours?.[formattedDay]?.openMinute || '00';
                const closeHour =
                  localOperatingHours?.[formattedDay]?.closedHour || '18';
                const closeMinute =
                  localOperatingHours?.[formattedDay]?.closedMinute || '00';

                const breakStartHour =
                  localBreakingHours?.[formattedDay]?.startHour;
                const breakStartMinute =
                  localBreakingHours?.[formattedDay]?.startMinute;
                const breakEndHour =
                  localBreakingHours?.[formattedDay]?.endHour;
                const breakEndMinute =
                  localBreakingHours?.[formattedDay]?.endMinute;
                return (
                  <>
                    <Text style={styles.boldText}>영업 시간</Text>
                    <View style={styles.timeInputContainer}>
                      <Pressable
                        style={[
                          styles.timeInput,
                          isOpenTime && {
                            backgroundColor: 'rgba(22, 187, 255, 0.2)',
                          },
                          isOpenTime &&
                            breakError && {
                              backgroundColor: 'rgba(255, 50, 50, 0.2)',
                            },
                          isOpenTime &&
                            operateError && {
                              backgroundColor: 'rgba(255, 50, 50, 0.2)',
                            },
                        ]}
                        onPress={() => handleTimePickerToggle('open')}>
                        <Text
                          style={[
                            styles.timeText,
                            isOpenTime && {color: '#16BBFF'},
                            isOpenTime && breakError && {color: '#FF4816'},
                            isOpenTime && operateError && {color: '#FF4816'},
                          ]}>{`${openHour}:${openMinute}`}</Text>
                      </Pressable>
                      <Text style={styles.separator}>~</Text>

                      <Pressable
                        style={[
                          styles.timeInput,
                          isCloseTime && {
                            backgroundColor: 'rgba(22, 187, 255, 0.2)',
                          },
                          isCloseTime &&
                            breakError && {
                              backgroundColor: 'rgba(255, 50, 50, 0.2)',
                            },
                          isCloseTime &&
                            operateError && {
                              backgroundColor: 'rgba(255, 50, 50, 0.2)',
                            },
                        ]}
                        onPress={() => handleTimePickerToggle('close')}>
                        {closeHour >= 24 && (
                          <Text
                            style={[
                              styles.nextText,
                              isCloseTime && {color: '#16BBFF'},
                              isCloseTime &&
                                breakError && {
                                  color: '#FF4816',
                                  borderColor: '#FF4816',
                                },
                              isCloseTime &&
                                operateError && {
                                  color: '#FF4816',
                                  borderColor: '#FF4816',
                                },
                            ]}>
                            다음날
                          </Text>
                        )}

                        <Text
                          style={[
                            styles.timeText,
                            isCloseTime && {color: '#16BBFF'},
                            isCloseTime && breakError && {color: '#FF4816'},
                            isCloseTime && operateError && {color: '#FF4816'},
                          ]}>
                          {closeHour >= 24
                            ? `${String(closeHour - 24).padStart(
                                2,
                                '0',
                              )}:${closeMinute}`
                            : `${String(closeHour).padStart(
                                2,
                                '0',
                              )}:${closeMinute}`}
                        </Text>
                      </Pressable>
                    </View>
                    {!is24 && (isOpenTime || isCloseTime) && (
                      <View style={styles.pickerTopView}>
                        <View style={styles.pickerWrapper}>
                          {isOpenTime ? (
                            <TimePicker
                              selectedHour={openHour}
                              selectedMinute={openMinute}
                              onHourChange={value => {
                                handleDiffOperating(
                                  formattedDay,
                                  'openHour',
                                  value,
                                );
                              }}
                              onMinuteChange={value => {
                                handleDiffOperating(
                                  formattedDay,
                                  'openMinute',
                                  value,
                                );
                              }}
                            />
                          ) : (
                            <CloseTimePicker
                              selectedHour={closeHour}
                              selectedMinute={closeMinute}
                              onHourChange={value => {
                                handleDiffOperating(
                                  formattedDay,
                                  'closedHour',
                                  value,
                                );
                              }}
                              onMinuteChange={value => {
                                handleDiffOperating(
                                  formattedDay,
                                  'closedMinute',
                                  value,
                                );
                              }}
                            />
                          )}
                        </View>
                      </View>
                    )}
                    {breakError && (
                      <Text style={styles.wrongText}>
                        영업 시간은 브레이크타임을 포함하도록 설정해주세요.
                      </Text>
                    )}
                    {operateError && (
                      <Text style={styles.wrongText}>
                        {operateErrorMessage}
                      </Text>
                    )}

                    {breakStartHour && (
                      <>
                        <Text style={[styles.boldText, {marginTop: 20}]}>
                          브레이크타임
                        </Text>

                        <View style={styles.timeInputContainer}>
                          <Pressable
                            style={[
                              styles.timeInput,
                              isStartTime && {
                                backgroundColor: 'rgba(22, 187, 255, 0.2)',
                              },
                              isStartTime &&
                                breakError && {
                                  backgroundColor: 'rgba(255, 50, 50, 0.2)',
                                },
                              isStartTime &&
                                isSameOperating && {
                                  backgroundColor: 'rgba(255, 50, 50, 0.2)',
                                },
                            ]}
                            onPress={() => handleTimePickerToggle('start')}>
                            <Text
                              style={[
                                styles.timeText,
                                isStartTime && {color: '#16BBFF'},
                                isStartTime && breakError && {color: '#FF4816'},
                              ]}>{`${breakStartHour}:${breakStartMinute}`}</Text>
                          </Pressable>
                          <Text style={styles.separator}>~</Text>

                          <Pressable
                            style={[
                              styles.timeInput,
                              isEndTime && {
                                backgroundColor: 'rgba(22, 187, 255, 0.2)',
                              },
                              isEndTime &&
                                breakError && {
                                  backgroundColor: 'rgba(255, 50, 50, 0.2)',
                                },
                            ]}
                            onPress={() => handleTimePickerToggle('end')}>
                            {breakEndHour >= 24 && (
                              <Text
                                style={[
                                  styles.nextText,
                                  isEndTime && {color: '#16BBFF'},
                                  isEndTime &&
                                    breakError && {
                                      color: '#FF4816',
                                      borderColor: '#FF4816',
                                    },
                                ]}>
                                다음날
                              </Text>
                            )}
                            <Text
                              style={[
                                styles.timeText,
                                isEndTime && {color: '#16BBFF'},
                                isEndTime && breakError && {color: '#FF4816'},
                              ]}>
                              {breakEndHour >= 24
                                ? `${String(breakEndHour - 24).padStart(
                                    2,
                                    '0',
                                  )}:${breakEndMinute}`
                                : `${String(breakEndHour).padStart(
                                    2,
                                    '0',
                                  )}:${breakEndMinute}`}
                            </Text>
                          </Pressable>
                        </View>
                        {(isStartTime || isEndTime) && (
                          <View style={styles.pickerTopView}>
                            <View style={styles.pickerWrapper}>
                              {isStartTime ? (
                                <TimePicker
                                  selectedHour={breakStartHour}
                                  selectedMinute={breakStartMinute}
                                  onHourChange={value => {
                                    handleDiffBreaking(
                                      formattedDay,
                                      'startHour',
                                      value,
                                    );
                                  }}
                                  onMinuteChange={value => {
                                    handleDiffBreaking(
                                      formattedDay,
                                      'startMinute',
                                      value,
                                    );
                                  }}
                                />
                              ) : (
                                <CloseTimePicker
                                  selectedHour={breakEndHour}
                                  selectedMinute={breakEndMinute}
                                  onHourChange={value => {
                                    handleDiffBreaking(
                                      formattedDay,
                                      'endHour',
                                      value,
                                    );
                                  }}
                                  onMinuteChange={value => {
                                    handleDiffBreaking(
                                      formattedDay,
                                      'endMinute',
                                      value,
                                    );
                                  }}
                                />
                              )}

                              {breakError && (
                                <Text style={styles.wrongText}>
                                  {/* 브레이크타임은 영업 시간에 포함되도록
                                  설정해주세요. */}
                                  {breakErrorMessage}
                                </Text>
                              )}
                            </View>
                          </View>
                        )}
                      </>
                    )}
                    <Pressable
                      onPress={() => handleBreaking(formattedDay)}
                      style={styles.addBreakButton}>
                      <Text style={styles.addBreakText}>
                        {breakStartHour
                          ? '- 브레이크타임 제거'
                          : '+ 브레이크타임 추가'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleBottomClose}
                      disabled={breakError || operateError}
                      style={[
                        styles.pickerOkView,
                        (breakError || operateError) && {
                          backgroundColor: '#F2F2F2',
                        },
                      ]}>
                      <Text style={styles.pickerOkText}>확인</Text>
                    </Pressable>
                  </>
                );
              })()}
            </View>
          </BottomSheet>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default StoreAddTimeSetScreen;

const styles = StyleSheet.create({
  searchButton: {
    marginRight: 18,
    fontSize: 18,
    fontWeight: '500',
    color: '#16BBFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  division: {
    width: '100%',
    height: 7,
    backgroundColor: '#EAEAEA',
    marginTop: 10,
  },
  dayContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  operateDayText: {
    color: '#4B4B4B',
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'center',
  },

  timeConatainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  disabled: {
    backgroundColor: '#EFEFEF',
  },

  timeInputView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  timeInputTitle: {
    lineHeight: 30,
    color: '#999',
    fontWeight: 500,
    fontSize: 15,
    marginRight: 7,
  },
  timeInputText: {
    lineHeight: 30,
    fontWeight: 400,
    fontSize: 15,
    color: '#4B4B4B',
  },
  holidayText: {
    lineHeight: 30,
    fontWeight: 500,
    fontSize: 15,
    color: '#4B4B4B',
    marginRight: 18,
  },
  icons: {
    marginLeft: 15,
    alignSelf: 'center',
  },
  bottomSheetBackground: {
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 10,
  },
  bottomSheetContent: {},
  bottomSheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
  },
  closeButton: {
    borderRadius: 5,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  sheetText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },

  boldText: {
    marginHorizontal: 18,
    marginVertical: 10,
    fontWeight: 500,
    fontSize: 16,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 12,
  },
  timeInput: {
    backgroundColor: '#F2F2F2',
    color: '#333',
    padding: 10,
    borderRadius: 5,
    width: 80,
    textAlign: 'center',
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 12,
    color: '#16BBFF',
    fontWeight: 600,
    borderWidth: 1,
    borderColor: '#16BBFF',
    padding: 3,
    marginRight: 5,
    borderRadius: 3,
  },
  timeText: {
    fontWeight: '600',
    color: '#333',
    fontSize: 15,
  },
  separator: {
    fontSize: 18,
    color: '#333',
    marginHorizontal: 15,
  },
  addBreakButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  addBreakText: {
    color: '#0af',
    fontSize: 16,
  },
  pickerTopView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: 8,
  },
  // wrongText: {
  //   paddingHorizontal: 1,
  //   marginTop: 5,
  //   fontSize: 15,
  //   fontWeight: '500',
  //   color: '#FF4816',
  // },
  wrongText: {
    alignSelf: 'center',
    marginTop: 5,
    fontSize: 15,
    fontWeight: '500',
    color: '#FF4816',
  },
  pickerOkView: {
    width: '90%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#16BBFF',
    borderRadius: 7,
    paddingHorizontal: 18,
    alignSelf: 'center',
  },
  pickerOkText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});
