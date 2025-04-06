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
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';

import ClosedDaySelector from '../../components/StoreAddScreen/StoreAddTimeSet/ClosedDaySelector';
import OperatingHoursToggle from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursToggle';
import OperatingHoursCheckbox from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursCheckbox';
import OperatingHoursInput from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursInput';
import OperatingHoursTimePicker from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursTimePicker';
import BreakTimeInput from '../../components/StoreAddScreen/StoreAddTimeSet/BreakTimeInput';
import BreakTimePicker from '../../components/StoreAddScreen/StoreAddTimeSet/BreakTimePicker';
import BreakTimeToggle from '../../components/StoreAddScreen/StoreAddTimeSet/BreakTimeToggle';
import OperatingDayItem from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingDayItem';
import OperateBottomSheetHeader from '../../components/StoreAddScreen/StoreAddTimeSet/OperateBottom/OperateBottomSheetHeader';
import OperateBottomHoursSelector from '../../components/StoreAddScreen/StoreAddTimeSet/OperateBottom/OperateBottomHoursSelector';
import OperateBottomOperatingTimePicker from '../../components/StoreAddScreen/StoreAddTimeSet/OperateBottom/OperateBottomOperatingTimePicker';
import OperateBottomBreakSelector from '../../components/StoreAddScreen/StoreAddTimeSet/OperateBottom/OperateBottomBreakSelector';
import OperateBottomBreakingTimePicker from '../../components/StoreAddScreen/StoreAddTimeSet/OperateBottom/OperateBottomBreakingTimePicker';
import OperateBottomBreakToggle from '../../components/StoreAddScreen/StoreAddTimeSet/OperateBottom/OperateBottomBreakToggle';
import OperateBottomConfirmButton from '../../components/StoreAddScreen/StoreAddTimeSet/OperateBottom/OperateBottomConfirmButton';

import {UpdateStore} from '../../api/storeApi';

const days = [
  {label: '월', value: 'MONDAY'},
  {label: '화', value: 'TUESDAY'},
  {label: '수', value: 'WEDNESDAY'},
  {label: '목', value: 'THURSDAY'},
  {label: '금', value: 'FRIDAY'},
  {label: '토', value: 'SATURDAY'},
  {label: '일', value: 'SUNDAY'},
];

const StoreTimeEditScreen = ({navigation, route}) => {
  const {storeId, operationInfoDtos, is24Hours} = route.params;

  const scrollViewRef = useRef(null);

  const [timeState, setTimeState] = useState({
    sameOpenTime: {
      openHour: '09',
      openMinute: '00',
    },
    sameCloseTime: {
      closedHour: '18',
      closedMinute: '00',
    },
    sameStartTime: {
      startHour: '15',
      startMinute: '00',
    },
    sameEndTime: {
      endHour: '17',
      endMinute: '00',
    },
  });

  const [isSameEveryday, setIsSameEveryday] = useState(false);
  const [hasLocalBreaking, setHasLocalBreaking] = useState(false);
  const [is24, setIs24] = useState(false);
  const [localOperatingHours, setLocalOperatingHours] = useState('');
  const [localBreakingHours, setLocalBreakingHours] = useState('');
  const [localClosedDay, setLocalClosedDay] = useState([]);
  const [isOpenTime, setIsOpenTime] = useState(false);
  const [isClosed, setIsClosed] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [isCloseTime, setIsCloseTime] = useState(false);
  const [isStartTime, setIsStartTime] = useState(false);
  const [isEndTime, setIsEndTime] = useState(false);
  const [isBottomOpen, setIsBottonOpen] = useState(false);
  const [isAllClosed, setIsAllClosed] = useState(false);
  const [isSameOperating, setIsSameOperating] = useState(false);
  const [wrongBreak, setWrongBreak] = useState(false);
  const [operateError, setOperateError] = useState(false);
  const [breakError, setBreakError] = useState(false);
  const [emptyTime, setEmptyTime] = useState(false);
  const [breakErrorMessage, setBreakErrorMessage] = useState('');
  const [operateErrorMessage, setOperateErrorMessage] = useState('');

  const [tempState, setTempState] = useState({
    tempOperating: {},
    tempBreaking: {},
  });

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
              !isSameEveryday && emptyTime && {color: '#999'}, // 🔥 운영시간이 없으면 버튼 비활성화
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
    operateError,
    emptyTime,
  ]);

  const deepEqual = (a, b) => {
    return JSON.stringify(a) === JSON.stringify(b);
  };

  const normalizeDtos = dtos => {
    const formatTime = time => {
      if (!time) return null;
      const [h, m] = time.split(':');
      return `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
    };

    return dtos
      .map(dto => ({
        dayOfWeek: dto.dayOfWeek,
        isClosed: dto.isClosed,
        openTime: dto.isClosed ? null : formatTime(dto.openTime),
        closeTime: dto.isClosed ? null : formatTime(dto.closeTime),
        breakStartTime: dto.isClosed ? null : formatTime(dto.breakStartTime),
        breakEndTime: dto.isClosed ? null : formatTime(dto.breakEndTime),
      }))
      .sort((a, b) => a.dayOfWeek.localeCompare(b.dayOfWeek));
  };

  const handleComplete = async () => {
    if (isAllClosed) return;
    if (is24) {
      await UpdateStore(storeId, {isAlwaysOpen: true});
      navigation.goBack();
      return;
    }

    if (
      (isSameEveryday && (isSameOperating || wrongBreak)) ||
      (!isSameEveryday && (breakError || operateError || emptyTime))
    ) {
      return;
    }

    const buildTimeMap = isSame => {
      const result = {};
      days.forEach(({value: day}) => {
        const formattedDay = day.charAt(0) + day.slice(1).toLowerCase();
        if (isSame) {
          result[formattedDay] = {
            openHour: timeState.sameOpenTime.openHour,
            openMinute: timeState.sameOpenTime.openMinute,
            closedHour: timeState.sameCloseTime.closedHour,
            closedMinute: timeState.sameCloseTime.closedMinute,
          };
        } else {
          result[formattedDay] = localOperatingHours[formattedDay];
        }
      });
      return result;
    };

    const formatHourMinute = (hour, minute) => {
      const h = parseInt(hour, 10);
      const adjustedHour =
        h >= 24 ? (h - 24).toString().padStart(2, '0') : hour.padStart(2, '0');
      return `${adjustedHour}:${minute.padStart(2, '0')}`;
    };

    const buildBreakMap = isSame => {
      const result = {};
      days.forEach(({value: day}) => {
        const formattedDay = day.charAt(0) + day.slice(1).toLowerCase();
        if (isSame) {
          result[formattedDay] = hasLocalBreaking
            ? {
                startHour: timeState.sameStartTime.startHour,
                startMinute: timeState.sameStartTime.startMinute,
                endHour: timeState.sameEndTime.endHour,
                endMinute: timeState.sameEndTime.endMinute,
              }
            : {
                startHour: '',
                startMinute: '',
                endHour: '',
                endMinute: '',
              };
        } else {
          result[formattedDay] = localBreakingHours[formattedDay] || {};
        }
      });
      return result;
    };

    const opHours = buildTimeMap(isSameEveryday);
    const brHours = buildBreakMap(isSameEveryday);

    const newOperationInfoDtos = Object.keys(opHours).map(day => {
      const upperCaseDay = day.toUpperCase();
      const isClosed = localClosedDay.includes(upperCaseDay);
      const op = opHours[day] || {};
      const br = brHours[day] || {};

      if (isClosed) {
        return {dayOfWeek: upperCaseDay, isClosed: true};
      }

      return {
        dayOfWeek: upperCaseDay,
        isClosed: false,
        openTime: formatHourMinute(op.openHour, op.openMinute),
        closeTime: formatHourMinute(op.closedHour, op.closedMinute),
        breakStartTime:
          br.startHour && br.startMinute
            ? formatHourMinute(br.startHour, br.startMinute)
            : null,
        breakEndTime:
          br.endHour && br.endMinute
            ? formatHourMinute(br.endHour, br.endMinute)
            : null,
      };
    });

    const normalizedOld = normalizeDtos(operationInfoDtos);
    const normalizedNew = normalizeDtos(newOperationInfoDtos);

    if (deepEqual(normalizedOld, normalizedNew)) {
      navigation.goBack();
      return;
    }

    await UpdateStore(storeId, {
      isAlwaysOpen: false,
      operationInfoDtos: newOperationInfoDtos,
    });

    navigation.goBack();
  };

  useEffect(() => {
    if (is24Hours) {
      setIs24(is24Hours);
    }
    const {operatingHours, breakingHours, closedDay} =
      convertToOperatingAndBreakingHours(operationInfoDtos);

    const isOperatingTimeSame = isAllSame(operatingHours, closedDay);
    const isBreakingTimeSame = isAllSame(breakingHours, closedDay);
    const isEmpty = isBreakingHoursEmpty(breakingHours);
    if (is24Hours) {
      setIs24(is24Hours);
      setIsSameEveryday(true);
      setHasLocalBreaking(false);
    } else {
      setIsSameEveryday(
        isOperatingTimeSame === true && isBreakingTimeSame === true,
      );
      setHasLocalBreaking(
        isOperatingTimeSame === true &&
          isBreakingTimeSame === true &&
          isEmpty === false,
      );
    }

    setLocalClosedDay(closedDay);

    const openDay = Object.keys(operatingHours).find(
      day => !closedDay.includes(day),
    );

    setIsClosed(closedDay.length > 0);
    setTimeState({
      sameOpenTime: {
        openHour: getDefaultTime(operatingHours?.[openDay]?.openHour, '09'),
        openMinute: getDefaultTime(operatingHours?.[openDay]?.openMinute, '00'),
      },
      sameCloseTime: {
        closedHour: getDefaultTime(operatingHours?.[openDay]?.closedHour, '18'),
        closedMinute: getDefaultTime(
          operatingHours?.[openDay]?.closedMinute,
          '00',
        ),
      },
      sameStartTime: {
        startHour: getDefaultTime(breakingHours?.[openDay]?.startHour, '15'),
        startMinute: getDefaultTime(
          breakingHours?.[openDay]?.startMinute,
          '00',
        ),
      },
      sameEndTime: {
        endHour: getDefaultTime(breakingHours?.[openDay]?.endHour, '17'),
        endMinute: getDefaultTime(breakingHours?.[openDay]?.endMinute, '00'),
      },
    });
    setLocalOperatingHours(JSON.parse(JSON.stringify(operatingHours)));
    setLocalBreakingHours(JSON.parse(JSON.stringify(breakingHours)));
  }, [operationInfoDtos]);

  const convertToOperatingAndBreakingHours = operationInfoDtos => {
    const defaultOperatingHours = {
      Monday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
      Tuesday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
      Wednesday: {
        openHour: '',
        openMinute: '',
        closedHour: '',
        closedMinute: '',
      },
      Thursday: {
        openHour: '',
        openMinute: '',
        closedHour: '',
        closedMinute: '',
      },
      Friday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
      Saturday: {
        openHour: '',
        openMinute: '',
        closedHour: '',
        closedMinute: '',
      },
      Sunday: {openHour: '', openMinute: '', closedHour: '', closedMinute: ''},
    };

    const defaultBreakingHours = {
      Monday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
      Tuesday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
      Wednesday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
      Thursday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
      Friday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
      Saturday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
      Sunday: {startHour: '', startMinute: '', endHour: '', endMinute: ''},
    };
    const closedDay = [];

    operationInfoDtos.forEach(
      ({
        dayOfWeek,
        isClosed,
        openTime,
        closeTime,
        breakStartTime,
        breakEndTime,
      }) => {
        const formattedDay =
          dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase(); // "TUESDAY" -> "Tuesday"

        if (isClosed) {
          closedDay.push(dayOfWeek);
        } else {
          if (openTime && closeTime) {
            const [openHour, openMinute] = openTime.split(':');
            const [closedHourRaw, closedMinute] = closeTime.split(':');
            const openTotalMinutes =
              parseInt(openHour, 10) * 60 + parseInt(openMinute, 10);
            const closedTotalMinutes =
              parseInt(closedHourRaw, 10) * 60 + parseInt(closedMinute, 10);

            const closedHour =
              closedTotalMinutes < openTotalMinutes
                ? String(parseInt(closedHourRaw, 10) + 24).padStart(2, '0')
                : closedHourRaw;

            defaultOperatingHours[formattedDay] = {
              openHour,
              openMinute,
              closedHour,
              closedMinute,
            };
          }

          if (breakStartTime && breakEndTime) {
            const [startHour, startMinute] = breakStartTime.split(':');
            const [endHourRaw, endMinute] = breakEndTime.split(':');

            const startTotalMinutes =
              parseInt(startHour, 10) * 60 + parseInt(startMinute, 10);
            const endTotalMinutes =
              parseInt(endHourRaw, 10) * 60 + parseInt(endMinute, 10);

            const endHour =
              endTotalMinutes < startTotalMinutes
                ? String(parseInt(endHourRaw, 10) + 24).padStart(2, '0')
                : endHourRaw;

            defaultBreakingHours[formattedDay] = {
              startHour,
              startMinute,
              endHour,
              endMinute,
            };
          }
        }
      },
    );

    return {
      operatingHours: defaultOperatingHours,
      breakingHours: defaultBreakingHours,
      closedDay,
    };
  };
  useEffect(() => {
    setIsAllClosed(localClosedDay.length === days.length);
  }, [localClosedDay]);

  const isAllSame = (timeData, closedDays) => {
    const filteredDays = Object.keys(timeData).filter(day => {
      const times = timeData[day];
      const hasValidTime = Object.values(times).some(value => value !== ''); // 🔥 값이 있는 경우만 비교
      return !closedDays.includes(day) && hasValidTime;
    });

    if (filteredDays.length <= 1) return true; // 비교할 요일이 1개 이하라면 자동으로 true
    const normalizeTime = time => {
      return Object.entries(time)
        .filter(([_, value]) => value !== '') // 빈 값 제외
        .reduce((obj, [key, value]) => {
          obj[key] = value;
          return obj;
        }, {});
    };

    const firstDayTime = JSON.stringify(
      normalizeTime(timeData[filteredDays[0]]),
    );

    return filteredDays.every(
      day => JSON.stringify(normalizeTime(timeData[day])) === firstDayTime,
    );
  };

  const isBreakingHoursEmpty = breakingHours => {
    return Object.values(breakingHours).every(
      ({startHour, startMinute, endHour, endMinute}) =>
        startHour === '' &&
        startMinute === '' &&
        endHour === '' &&
        endMinute === '',
    );
  };

  const convertToMinutes = (hour, minute) =>
    parseInt(hour, 10) * 60 + parseInt(minute, 10);

  const getDefaultTime = (time, defaultValue) => {
    return time === null || time === undefined || time === ''
      ? defaultValue
      : time;
  };

  useEffect(() => {
    setIsAllClosed(localClosedDay.length === days.length); // 모든 요일이 휴무일인지 확인
    setEmptyTime(hasEmptyOperatingHours()); // 운영시간이 비어있는 요일이 있으면 에러
  }, [localClosedDay, localOperatingHours]);

  const hasEmptyOperatingHours = () => {
    return Object.keys(localOperatingHours).some(day => {
      if (localClosedDay.includes(day.toUpperCase())) return false; // 휴무일 제외

      const {openHour, closedHour} = localOperatingHours[day];
      return openHour === '' || closedHour === ''; // 운영시간이 비어있으면 true 반환
    });
  };

  const handleTimePickerToggle = type => {
    setIsOpenTime(type === 'open' ? prev => !prev : false);
    setIsCloseTime(type === 'close' ? prev => !prev : false);
    setIsStartTime(type === 'start' ? prev => !prev : false);
    setIsEndTime(type === 'end' ? prev => !prev : false);
  };

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
      if (hasLocalBreaking) {
        errorMessage = '영업 시간은 브레이크타임을 포함하도록 설정해주세요.';
        setWrongBreak(true);
      }
    } else {
      setWrongBreak(false);
      errorMessage = '';
    }
    setBreakErrorMessage(errorMessage);
  }, [timeState]);

  const handleBottomOpen = day => {
    setSelectedDay(day);

    setIsBottonOpen(true);
    const formattedDay = day.value.charAt(0) + day.value.slice(1).toLowerCase();

    if (
      !localOperatingHours[formattedDay] ||
      !localOperatingHours[formattedDay].openHour
    ) {
      setLocalOperatingHours(prev => ({
        ...prev,
        [formattedDay]: {
          openHour: '09',
          openMinute: '00',
          closedHour: '18',
          closedMinute: '00',
        },
      }));
    }

    setTempState({
      tempOperating: {...localOperatingHours[formattedDay]},
      tempBreaking: {...(localBreakingHours[formattedDay] || {})},
    });
  };

  const handleBottomClose = () => {
    setIsBottonOpen(false);
    setIsOpenTime(false);
    setIsCloseTime(false);
    setIsStartTime(false);
    setIsEndTime(false);
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
    if (!isClosed) {
      setLocalClosedDay([]);
    }
  }, [isClosed]);

  const toggle24Hours = () => {
    if (isSameEveryday) {
      setIs24(prev => !prev);
    }
    if (!is24) {
      setIsClosed(false);
      setLocalClosedDay([]);
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

  useEffect(() => {
    setLocalOperatingHours(prevState => {
      const newState = {...prevState};
      localClosedDay.forEach(day => {
        const formattedDay = day.charAt(0) + day.slice(1).toLowerCase(); // "TUESDAY" -> "Tuesday"
        newState[formattedDay] = {
          openHour: '',
          openMinute: '',
          closedHour: '',
          closedMinute: '',
        };
      });
      return newState;
    });

    setLocalBreakingHours(prevState => {
      const newState = {...prevState};
      localClosedDay.forEach(day => {
        const formattedDay = day.charAt(0) + day.slice(1).toLowerCase();
        newState[formattedDay] = {
          startHour: '',
          startMinute: '',
          endHour: '',
          endMinute: '',
        };
      });
      return newState;
    });
  }, [localClosedDay]);

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        nestedScrollEnabled={true}
        contentContainerStyle={{paddingBottom: 100, flexGrow: 1}}
        showsVerticalScrollIndicator={false}>
        <ClosedDaySelector
          days={days}
          isClosed={isClosed}
          setIsClosed={setIsClosed}
          localClosedDay={localClosedDay}
          setLocalClosedDay={setLocalClosedDay}
          setIs24={setIs24}
          handleBottomClose={handleBottomClose}
          setIsAllClosed={setIsAllClosed}
          isBottomOpen={isBottomOpen}
        />

        <View style={styles.division} />

        <OperatingHoursToggle
          isSameEveryday={isSameEveryday}
          setIsSameEveryday={setIsSameEveryday}
          handleBottomClose={handleBottomClose}
          setIs24={setIs24}
          isBottomOpen={isBottomOpen}
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
                operateErrorMessage={operateErrorMessage}
              />
            )}

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
                    breakErrorMessage={breakErrorMessage}
                  />
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
            const isClosedDay = localClosedDay.includes(day.value);
            const formattedDay =
              day.value.charAt(0) + day.value.slice(1).toLowerCase();

            return (
              <OperatingDayItem
                key={day.value}
                day={day}
                isClosedDay={isClosedDay}
                openHour={localOperatingHours?.[formattedDay]?.openHour}
                openMinute={localOperatingHours?.[formattedDay]?.openMinute}
                closeHour={localOperatingHours?.[formattedDay]?.closedHour}
                closeMinute={localOperatingHours?.[formattedDay]?.closedMinute}
                breakStartHour={localBreakingHours?.[formattedDay]?.startHour}
                breakStartMinute={
                  localBreakingHours?.[formattedDay]?.startMinute
                }
                breakEndHour={localBreakingHours?.[formattedDay]?.endHour}
                breakEndMinute={localBreakingHours?.[formattedDay]?.endMinute}
                handleBottomOpen={handleBottomOpen}
                isLastItem={isLastItem}
              />
            );
          })
        )}
      </ScrollView>
      {isBottomOpen && selectedDay && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={isBottomOpen}
          onRequestClose={handleBottomClose}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.bottomSheetContent}>
                <OperateBottomSheetHeader
                  title={`${selectedDay.label}요일 영업 정보`}
                  onClose={handleCancelChanges}
                />
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
                      <OperateBottomHoursSelector
                        openHour={openHour}
                        openMinute={openMinute}
                        closeHour={closeHour}
                        closeMinute={closeMinute}
                        isOpenTime={isOpenTime}
                        isCloseTime={isCloseTime}
                        breakError={breakError}
                        operateError={operateError}
                        handleTimePickerToggle={handleTimePickerToggle}
                      />
                      {!is24 && (isOpenTime || isCloseTime) && (
                        <OperateBottomOperatingTimePicker
                          isOpenTime={isOpenTime}
                          openHour={openHour}
                          openMinute={openMinute}
                          closeHour={closeHour}
                          closeMinute={closeMinute}
                          handleDiffOperating={handleDiffOperating}
                          formattedDay={formattedDay}
                          breakError={breakError}
                          operateError={operateError}
                          operateErrorMessage={operateErrorMessage}
                        />
                      )}

                      {breakStartHour && (
                        <>
                          <OperateBottomBreakSelector
                            isStartTime={isStartTime}
                            isEndTime={isEndTime}
                            breakStartHour={breakStartHour}
                            breakStartMinute={breakStartMinute}
                            breakEndHour={breakEndHour}
                            breakEndMinute={breakEndMinute}
                            breakError={breakError}
                            handleTimePickerToggle={handleTimePickerToggle}
                          />

                          {(isStartTime || isEndTime) && (
                            // OperateBottomBreakingTimePicker
                            <OperateBottomBreakingTimePicker
                              isStartTime={isStartTime}
                              breakStartHour={breakStartHour}
                              breakStartMinute={breakStartMinute}
                              breakEndHour={breakEndHour}
                              breakEndMinute={breakEndMinute}
                              handleDiffBreaking={handleDiffBreaking}
                              formattedDay={formattedDay}
                              breakError={breakError}
                              breakErrorMessage={breakErrorMessage}
                            />
                          )}
                        </>
                      )}

                      <OperateBottomBreakToggle
                        onPress={() => handleBreaking(formattedDay)}
                        hasBreakTime={!!breakStartHour}
                      />

                      <OperateBottomConfirmButton
                        onPress={handleBottomClose}
                        disabled={breakError || operateError}
                      />
                    </>
                  );
                })()}
              </View>
              {/* </BottomSheet> */}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingTop: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 70,
  },
  searchButton: {
    marginRight: 18,
    fontSize: 18,
    fontWeight: '500',
    color: '#16BBFF',
  },
});

export default StoreTimeEditScreen;
