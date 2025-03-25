import React, {useEffect, useState, useRef, useMemo} from 'react';
import {
  View,
  Animated,
  Text,
  Platform,
  TouchableWithoutFeedback,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
} from 'react-native';

import {useRoute, useFocusEffect} from '@react-navigation/native';
import {
  StoreMainget,
  UpdateStore,
  DeleteStoreImage,
  UpdateStoreImage,
} from '../../api/storeApi';

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

  return (
    <>
      <Text>ㅎㅇ</Text>
    </>
  );
};

const styles = StyleSheet.create({});

export default StoreTimeEditScreen;
