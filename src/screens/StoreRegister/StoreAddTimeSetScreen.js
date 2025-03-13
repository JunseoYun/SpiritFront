// StoreAddTimeSetScreen.js
import React, {useState, useEffect, useRef, useMemo} from 'react';
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
import ClosedDaySelector from '../../components/StoreAddScreen/StoreAddTimeSet/ClosedDaySelector';
import OperatingHoursToggle from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursToggle';
import OperatingHoursCheckbox from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursCheckbox';
import OperatingHoursInput from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursInput';
import OperatingHoursTimePicker from '../../components/StoreAddScreen/StoreAddTimeSet/OperatingHoursTimePicker';
import BreakTimeInput from '../../components/StoreAddScreen/StoreAddTimeSet/BreakTimeInput';
import BreakTimePicker from '../../components/StoreAddScreen/StoreAddTimeSet/BreakTimePicker';
import BreakTimeToggle from '../../components/StoreAddScreen/StoreAddTimeSet/BreakTimeToggle';
import BottomSheet from '@gorhom/bottom-sheet';
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
    isNextStart,
    setIsNextStart,
    isNextBreak,
    setIsNextBreak,
    isSameEveryTime,
    setIsSameEveryTime,
  } = route.params;

  const convertToMinutes = (hour, minute) =>
    parseInt(hour, 10) * 60 + parseInt(minute, 10);

  const getDefaultTime = (time, defaultValue) => time ?? defaultValue;

  const [sameOpenTime, setSameOpenTime] = useState({
    hour: getDefaultTime(operatingHours?.Monday?.openHour, '09'),
    minute: getDefaultTime(operatingHours?.Monday?.openMinute, '00'),
  });

  const [sameCloseTime, setSameCloseTime] = useState({
    hour: getDefaultTime(operatingHours?.Monday?.closedHour, '18'),
    minute: getDefaultTime(operatingHours?.Monday?.closedMinute, '00'),
  });

  const [sameStartTime, setSameStartTime] = useState({
    hour: getDefaultTime(breakingHours?.Monday?.startHour, '15'),
    minute: getDefaultTime(breakingHours?.Monday?.startMinute, '00'),
  });

  const [sameEndTime, setSameEndTime] = useState({
    hour: getDefaultTime(breakingHours?.Monday?.endHour, '17'),
    minute: getDefaultTime(breakingHours?.Monday?.endMinute, '00'),
  });

  const [localClosedDay, setLocalClosedDay] = useState(closedDay || []);
  const [isClosed, setIsClosed] = useState(localClosedDay.length > 0);
  const [isSameEveryday, setIsSameEveryday] = useState(isSameEveryTime);
  const [is24, setIs24] = useState(is24Hours);
  const [isOpenTime, setIsOpenTime] = useState(false);
  const [isCloseTime, setIsCloseTime] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null); // 선택한 요일 정보 저장
  const [hasBreaking, setHasBreaking] = useState(
    breakingHours.Monday.startHour ? true : false,
  );
  const [isNextOperating, setIsNextOperating] = useState(isNextStart);
  const [isNextBreaking, setIsNextBreaking] = useState(isNextBreak);
  const [isStartTime, setIsStartTime] = useState(false);
  const [isEndTime, setIsEndTime] = useState(false);
  const [wrongBreak, setWrongBreak] = useState(false);
  const [isSameOperating, setIsSameOperating] = useState(false);

  const handleTimePickerToggle = type => {
    if (wrongBreak) {
      return;
    }
    if (isSameOperating) {
      return;
    }
    setIsOpenTime(type === 'open' ? prev => !prev : false);
    setIsCloseTime(type === 'close' ? prev => !prev : false);
    setIsStartTime(type === 'start' ? prev => !prev : false);
    setIsEndTime(type === 'end' ? prev => !prev : false);
  };

  const scrollViewRef = useRef(null);
  const bottomSheetRef = useRef(null);

  const snapPoints = useMemo(() => ['25%', '50%', '80%'], []);
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);

  // const handleBottomOpen = day => {
  //   setSelectedDay(day); // 선택한 요일 저장
  //   setIsBottomSheetVisible(true);
  //   bottomSheetRef.current?.expand();
  // };

  // const handleBottomClose = () => {
  //   bottomSheetRef.current?.close();
  //   setTimeout(() => setIsBottomSheetVisible(false), 300);
  // };

  const handleBottomOpen = day => {
    setSelectedDay(day);
    setIsBottomSheetVisible(true);
    bottomSheetRef.current?.expand();
  };

  const handleBottomClose = () => {
    bottomSheetRef.current?.close();
  };

  // 바텀시트 닫힐 때 상태 업데이트
  const onBottomSheetClose = () => {
    setIsBottomSheetVisible(false);
  };

  const handleIsBreaking = () => {
    setHasBreaking(prev => {
      const newValue = !prev;

      if (newValue) {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({animated: true});
        }, 100);
      }

      return newValue;
    });

    const defaultTimes = {
      startHour: '15',
      startMinute: '00',
      endHour: '17',
      endMinute: '00',
    };

    Object.entries(defaultTimes).forEach(([key, defaultValue]) => {
      handleSameBreaking(key, hasBreaking ? '' : defaultValue);
    });
  };

  useEffect(() => {
    if (!operatingHours?.Monday?.openHour) {
      handleSameOperating('openHour', '09');
      handleSameOperating('openMinute', '00');
      handleSameOperating('closedHour', '18');
      handleSameOperating('closedMinute', '00');
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
      setIs24Hours(prev => !prev);
    }
    if (!is24) {
      setIsClosed(false);
      setLocalClosedDay([]);
      setClosedDay([]);
    }
  };

  const updateOperatingHours = (day, field, value) => {
    setOperatingHours(prevState => ({
      ...prevState,
      [day]: {...prevState[day], [field]: value},
    }));
  };

  const updateBreakingHours = (day, field, value) => {
    setBreakingHours(prevState => ({
      ...prevState,
      [day]: {...prevState[day], [field]: value},
    }));
  };
  const handleSameOperating = (field, value) => {
    let isInvalid = false;
    let isBreakInvalid = false;
    let isSameOperating = false;
    // 기존 운영 시간 객체를 복사하고 새 값을 반영
    let newSameOpenTime = {...sameOpenTime};
    let newSameCloseTime = {...sameCloseTime};

    switch (field) {
      case 'openHour':
        isInvalid =
          sameCloseTime.hour < value ||
          (sameCloseTime.hour === value &&
            sameCloseTime.minute < sameOpenTime.minute);
        isSameOperating =
          value === sameCloseTime.hour &&
          sameOpenTime.minute === sameCloseTime.minute;
        setSameOpenTime(prev => ({...prev, hour: value}));
        newSameOpenTime.hour = value;
        break;
      case 'openMinute':
        isInvalid =
          sameCloseTime.hour < sameOpenTime.hour ||
          (sameCloseTime.hour === sameOpenTime.hour &&
            sameCloseTime.minute < value);
        isSameOperating =
          sameOpenTime.hour === sameCloseTime.hour &&
          value === sameCloseTime.minute;
        setSameOpenTime(prev => ({...prev, minute: value}));
        newSameOpenTime.minute = value;
        break;
      case 'closedHour':
        isInvalid =
          value < sameOpenTime.hour ||
          (value === sameOpenTime.hour &&
            sameCloseTime.minute < sameOpenTime.minute);
        isSameOperating =
          sameOpenTime.hour === value &&
          sameOpenTime.minute === sameCloseTime.minute;
        setSameCloseTime(prev => ({...prev, hour: value}));
        newSameCloseTime.hour = value;
        break;
      case 'closedMinute':
        isInvalid =
          sameCloseTime.hour < sameOpenTime.hour ||
          (sameCloseTime.hour === sameOpenTime.hour &&
            value < sameOpenTime.minute);
        isSameOperating =
          sameOpenTime.hour === sameCloseTime.hour &&
          sameOpenTime.minute === value;
        setSameCloseTime(prev => ({...prev, minute: value}));
        newSameCloseTime.minute = value;
        break;
      default:
        break;
    }
    setIsNextOperating(isInvalid);
    setIsNextStart(isInvalid);
    setIsSameOperating(isSameOperating);
    // 업데이트된 값을 기준으로 운영 시간 분 단위 계산
    const opStart = convertToMinutes(
      newSameOpenTime.hour,
      newSameOpenTime.minute,
    );
    const opEnd = convertToMinutes(
      newSameCloseTime.hour,
      newSameCloseTime.minute,
    );

    if (hasBreaking) {
      const brStart = convertToMinutes(
        sameStartTime.hour,
        sameStartTime.minute,
      );
      const brEnd = convertToMinutes(sameEndTime.hour, sameEndTime.minute);

      if (opEnd > opStart) {
        if (brStart < opStart || brEnd > opEnd) {
          isBreakInvalid = true;
        }
      } else {
        const normalizedOpStart = opStart;
        const normalizedOpEnd = opEnd + 1440;
        let normalizedBrStart = brStart;
        let normalizedBrEnd = brEnd;
        if (brStart < opStart) {
          normalizedBrStart += 1440;
        }
        if (brEnd < opStart) {
          normalizedBrEnd += 1440;
        }
        if (
          normalizedBrStart < normalizedOpStart ||
          normalizedBrEnd > normalizedOpEnd
        ) {
          isBreakInvalid = true;
        }
      }
    }
    setWrongBreak(isBreakInvalid);
    if (isBreakInvalid === false && isSameOperating === false) {
      days.forEach(({value: day}) => {
        const formattedDay = day.charAt(0) + day.slice(1).toLowerCase();
        updateOperatingHours(formattedDay, field, value);
      });
    }
  };

  const handleSameBreaking = (field, value) => {
    let updatedStart = {...sameStartTime};
    let updatedEnd = {...sameEndTime};
    let isInvalid = false;

    switch (field) {
      case 'startHour':
        updatedStart.hour = value;
        setSameStartTime(prev => ({...prev, hour: value}));
        isInvalid =
          sameEndTime.hour < value ||
          (sameEndTime.hour === value &&
            sameEndTime.minute < sameStartTime.minute);
        break;
      case 'startMinute':
        updatedStart.minute = value;
        setSameStartTime(prev => ({...prev, minute: value}));
        isInvalid =
          sameEndTime.hour < sameStartTime.hour ||
          (sameEndTime.hour === sameStartTime.hour &&
            sameEndTime.minute < value);
        break;
      case 'endHour':
        updatedEnd.hour = value;
        setSameEndTime(prev => ({...prev, hour: value}));
        isInvalid =
          value < sameStartTime.hour ||
          (value === sameStartTime.hour &&
            sameEndTime.minute < sameStartTime.minute);
        break;
      case 'endMinute':
        updatedEnd.minute = value;
        setSameEndTime(prev => ({...prev, minute: value}));
        isInvalid =
          sameEndTime.hour < sameStartTime.hour ||
          (sameEndTime.hour === sameStartTime.hour &&
            value < sameStartTime.minute);
        break;
      default:
        break;
    }
    setIsNextBreaking(isInvalid);
    setIsNextBreak(isInvalid);

    const opStart = convertToMinutes(sameOpenTime.hour, sameOpenTime.minute);
    const opEnd = convertToMinutes(sameCloseTime.hour, sameCloseTime.minute);
    const brStart = convertToMinutes(updatedStart.hour, updatedStart.minute);
    const brEnd = convertToMinutes(updatedEnd.hour, updatedEnd.minute);

    let normalizedOpStart = opStart;
    let normalizedOpEnd = opEnd;
    if (opEnd <= opStart) {
      normalizedOpEnd = opEnd + 1440;
    }

    let normalizedBrStart = brStart;
    let normalizedBrEnd = brEnd;
    if (brStart < opStart) {
      normalizedBrStart += 1440;
    }
    if (brEnd < opStart) {
      normalizedBrEnd += 1440;
    }

    const isBreakInvalid =
      normalizedBrStart < normalizedOpStart ||
      normalizedBrEnd > normalizedOpEnd ||
      normalizedBrStart >= normalizedBrEnd;

    setWrongBreak(isBreakInvalid);
    if (isBreakInvalid === false) {
      days.forEach(({value: day}) => {
        const formattedDay = day.charAt(0) + day.slice(1).toLowerCase();
        updateBreakingHours(formattedDay, field, value);
      });
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (isBottomSheetVisible) {
          handleBottomClose(); // 바텀시트 닫기
        }
      }}>
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
          />
          <View style={styles.division} />

          <OperatingHoursToggle
            isSameEveryday={isSameEveryday}
            setIsSameEveryday={setIsSameEveryday}
            setIsSameEveryTime={setIsSameEveryTime}
            handleBottomClose={handleBottomClose}
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
                  sameOpenTime={sameOpenTime}
                  sameCloseTime={sameCloseTime}
                  isOpenTime={isOpenTime}
                  isCloseTime={isCloseTime}
                  wrongBreak={wrongBreak}
                  isSameOperating={isSameOperating}
                  isNextOperating={isNextOperating}
                  handleTimePickerToggle={handleTimePickerToggle}
                />
              )}

              {!is24 && (isOpenTime || isCloseTime) && (
                <OperatingHoursTimePicker
                  isOpenTime={isOpenTime}
                  sameOpenTime={sameOpenTime}
                  sameCloseTime={sameCloseTime}
                  wrongBreak={wrongBreak}
                  isSameOperating={isSameOperating}
                  handleSameOperating={handleSameOperating}
                  handleTimePickerToggle={handleTimePickerToggle}
                />
              )}

              {!is24 && hasBreaking && (
                <>
                  <BreakTimeInput
                    sameStartTime={sameStartTime}
                    sameEndTime={sameEndTime}
                    isStartTime={isStartTime}
                    isEndTime={isEndTime}
                    wrongBreak={wrongBreak}
                    isNextBreaking={isNextBreaking}
                    handleTimePickerToggle={handleTimePickerToggle}
                  />

                  {(isStartTime || isEndTime) && (
                    <BreakTimePicker
                      isStartTime={isStartTime}
                      sameStartTime={sameStartTime}
                      sameEndTime={sameEndTime}
                      wrongBreak={wrongBreak}
                      handleSameBreaking={handleSameBreaking}
                      handleTimePickerToggle={handleTimePickerToggle}
                    />
                  )}
                </>
              )}
              {!is24 && (
                <BreakTimeToggle
                  hasBreaking={hasBreaking}
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
              const openHour = operatingHours?.[formattedDay]?.openHour || '09';
              const openMinute =
                operatingHours?.[formattedDay]?.openMinute || '00';
              const closeHour =
                operatingHours?.[formattedDay]?.closedHour || '18';
              const closeMinute =
                operatingHours?.[formattedDay]?.closedMinute || '00';

              const breakStartHour = breakingHours?.[formattedDay]?.startHour;
              const breakStartMinute =
                breakingHours?.[formattedDay]?.startMinute;
              const breakEndHour = breakingHours?.[formattedDay]?.endHour;
              const breakEndMinute = breakingHours?.[formattedDay]?.endMinute;

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
                    <View style={styles.timeInputContainer}>
                      <View style={styles.timeInputView}>
                        {isClosedDay ? (
                          <Text style={styles.holidayText}>휴무</Text>
                        ) : (
                          <>
                            <Text style={styles.timeInputTitle}>영업 시간</Text>
                            <Text style={styles.timeInputText}>
                              {openHour
                                ? `${openHour}:${openMinute} ~ ${closeHour}:${closeMinute}`
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
                                  ? `${breakStartHour}:${breakStartMinute} ~ ${breakEndHour}:${breakEndMinute}`
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
            enablePanDownToClose={true}
            gestureEnabled={false}
            backgroundStyle={{
              backgroundColor: '#F7F7F7',
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
              <Text style={styles.sheetTitle}>
                {selectedDay.label}요일 영업 정보
              </Text>

              {/* 요일 포맷팅 */}
              {(() => {
                const formattedDay =
                  selectedDay.value.charAt(0) +
                  selectedDay.value.slice(1).toLowerCase();
                const openHour = operatingHours[formattedDay]?.openHour || '09';
                const openMinute =
                  operatingHours[formattedDay]?.openMinute || '00';
                const closeHour =
                  operatingHours[formattedDay]?.closedHour || '18';
                const closeMinute =
                  operatingHours[formattedDay]?.closedMinute || '00';

                const breakStartHour = breakingHours[formattedDay]?.startHour;
                const breakStartMinute =
                  breakingHours[formattedDay]?.startMinute;
                const breakEndHour = breakingHours[formattedDay]?.endHour;
                const breakEndMinute = breakingHours[formattedDay]?.endMinute;
                return (
                  <>
                    <Text style={styles.sheetText}>
                      <Text style={styles.boldText}>영업 시간:</Text>{' '}
                      {openHour === '미설정'
                        ? '미설정'
                        : `${openHour}:${openMinute} ~ ${closeHour}:${closeMinute}`}
                    </Text>
                    {breakStartHour && (
                      <Text style={styles.sheetText}>
                        <Text style={styles.boldText}>브레이크타임:</Text>{' '}
                        {breakStartHour === '없음'
                          ? '없음'
                          : `${breakStartHour}:${breakStartMinute} ~ ${breakEndHour}:${breakEndMinute}`}
                      </Text>
                    )}
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  division: {
    width: '100%',
    height: 10,
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
  timeInputContainer: {},
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
  bottomSheetContent: {
    padding: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sheetText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 5,
  },
});
