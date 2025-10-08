import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Keyboard,
  StyleSheet,
} from 'react-native';

const DAY_ORDER = [
  'SUNDAY',
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

const MIN_ORDER_PEOPLE = 1;
const MAX_ORDER_PEOPLE = 20;

const createDateWithTime = (baseDate, timeString) => {
  if (!timeString) {
    return null;
  }
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date(baseDate);
  date.setHours(hours, minutes ?? 0, 0, 0);
  return date;
};

const buildScheduleWindow = (schedule, baseDate) => {
  if (
    !schedule ||
    schedule.isClosed ||
    !schedule.openTime ||
    !schedule.closeTime
  ) {
    return null;
  }

  const openDate = createDateWithTime(baseDate, schedule.openTime);
  const closeDateRaw = createDateWithTime(baseDate, schedule.closeTime);

  if (!openDate || !closeDateRaw) {
    return null;
  }

  const closeDate =
    closeDateRaw <= openDate
      ? new Date(closeDateRaw.getTime() + 24 * 60 * 60 * 1000)
      : closeDateRaw;

  return {openDate, closeDate};
};

const calculateTodayOrderWindow = (operationInfoDtos = [], now) => {
  if (!operationInfoDtos || operationInfoDtos.length === 0) {
    return null;
  }

  const todayIndex = now.getDay();
  const todayName = DAY_ORDER[todayIndex];
  const yesterdayName = DAY_ORDER[(todayIndex + 6) % 7];

  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  const findSchedule = dayName =>
    operationInfoDtos.find(info => info.dayOfWeek === dayName);

  const yesterdayWindow = buildScheduleWindow(
    findSchedule(yesterdayName),
    startOfYesterday,
  );

  if (yesterdayWindow && now <= yesterdayWindow.closeDate) {
    const start =
      now > yesterdayWindow.openDate ? now : yesterdayWindow.openDate;
    if (start < yesterdayWindow.closeDate) {
      return {start, end: yesterdayWindow.closeDate};
    }
  }

  const todayWindow = buildScheduleWindow(
    findSchedule(todayName),
    startOfToday,
  );

  if (todayWindow) {
    const start = now > todayWindow.openDate ? now : todayWindow.openDate;
    if (start < todayWindow.closeDate) {
      return {start, end: todayWindow.closeDate};
    }
  }

  return null;
};

const roundUpToNextHalfHour = date => {
  const result = new Date(date);
  const minutes = result.getMinutes();
  const remainder = minutes % 30;

  if (remainder !== 0) {
    result.setMinutes(minutes + (30 - remainder));
  }

  result.setSeconds(0, 0);
  return result;
};

const buildTimeSlotsBetween = (start, end) => {
  const slots = [];
  const cursor = new Date(start);

  while (cursor < end) {
    const hour = cursor.getHours().toString().padStart(2, '0');
    const minute = cursor.getMinutes().toString().padStart(2, '0');
    slots.push(`${hour}:${minute}`);
    cursor.setMinutes(cursor.getMinutes() + 30);
  }

  return slots;
};

const generateOrderTimeSlots = (
  operationInfoDtos = [],
  isAlwaysOpen = false,
) => {
  const now = new Date();

  if (isAlwaysOpen) {
    const start = roundUpToNextHalfHour(now);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    if (start >= endOfDay) {
      endOfDay.setDate(endOfDay.getDate() + 1);
      endOfDay.setHours(23, 59, 59, 999);
    }

    return buildTimeSlotsBetween(start, endOfDay);
  }

  const window = calculateTodayOrderWindow(operationInfoDtos, now);
  if (!window) {
    return [];
  }

  const start = roundUpToNextHalfHour(window.start);
  if (start >= window.end) {
    return [];
  }

  return buildTimeSlotsBetween(start, window.end);
};

const OrderForm = ({
  operationInfoDtos = [],
  isAlwaysOpen = false,
  onCancel,
  onSubmit,
}) => {
  const timeSlots = useMemo(
    () => generateOrderTimeSlots(operationInfoDtos, isAlwaysOpen),
    [operationInfoDtos, isAlwaysOpen],
  );
  const [selectedOrderTime, setSelectedOrderTime] = useState('');
  const [selectedOrderPeople, setSelectedOrderPeople] = useState('');

  useEffect(() => {
    setSelectedOrderTime(prev => (timeSlots.includes(prev) ? prev : ''));
  }, [timeSlots]);

  const handleSelectOrderTime = value => {
    setSelectedOrderTime(value);
  };

  const handlePeopleInputChange = value => {
    const sanitized = value.replace(/[^0-9]/g, '');
    if (!sanitized) {
      setSelectedOrderPeople('');
      return;
    }
    const numeric = Math.min(
      MAX_ORDER_PEOPLE,
      Math.max(MIN_ORDER_PEOPLE, parseInt(sanitized, 10)),
    );
    setSelectedOrderPeople(String(numeric));
  };

  const handlePeopleBlur = () => {
    if (!selectedOrderPeople) {
      return;
    }
    const numeric = parseInt(selectedOrderPeople, 10);
    if (Number.isNaN(numeric) || numeric < MIN_ORDER_PEOPLE) {
      setSelectedOrderPeople(String(MIN_ORDER_PEOPLE));
    } else if (numeric > MAX_ORDER_PEOPLE) {
      setSelectedOrderPeople(String(MAX_ORDER_PEOPLE));
    }
  };

  const adjustPeopleCount = delta => {
    setSelectedOrderPeople(prev => {
      const current = parseInt(prev, 10);
      if (Number.isNaN(current)) {
        return delta > 0 ? String(MIN_ORDER_PEOPLE) : '';
      }
      const next = Math.min(
        MAX_ORDER_PEOPLE,
        Math.max(MIN_ORDER_PEOPLE, current + delta),
      );
      return String(next);
    });
  };

  const handleIncreasePeople = () => adjustPeopleCount(1);
  const handleDecreasePeople = () => adjustPeopleCount(-1);

  const peopleCount = parseInt(selectedOrderPeople, 10);
  const canDecreasePeople =
    !Number.isNaN(peopleCount) && peopleCount > MIN_ORDER_PEOPLE;
  const canIncreasePeople =
    Number.isNaN(peopleCount) || peopleCount < MAX_ORDER_PEOPLE;

  const canSubmitOrder =
    !!selectedOrderTime &&
    !Number.isNaN(peopleCount) &&
    peopleCount >= MIN_ORDER_PEOPLE &&
    peopleCount <= MAX_ORDER_PEOPLE;

  const handleCancel = () => {
    Keyboard.dismiss();
    setSelectedOrderTime('');
    setSelectedOrderPeople('');
    onCancel?.();
  };

  const handleSubmit = () => {
    if (!canSubmitOrder) {
      return;
    }
    Keyboard.dismiss();
    onSubmit?.({
      visitTime: selectedOrderTime,
      peopleCount,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>방문 예정 시간</Text>
        {timeSlots.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeSlotList}>
            {timeSlots.map(time => {
              const isSelected = selectedOrderTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  onPress={() => handleSelectOrderTime(time)}
                  style={[
                    styles.timeChip,
                    isSelected && styles.timeChipSelected,
                  ]}>
                  <Text
                    style={[
                      styles.timeChipText,
                      isSelected && styles.timeChipTextSelected,
                    ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        ) : (
          <Text style={styles.emptyText}>
            오늘은 주문 가능한 시간이 없습니다.
          </Text>
        )}
      </View>

      <View style={[styles.section, styles.sectionSpacing]}>
        <Text style={styles.sectionLabel}>인원</Text>
        <View style={styles.peopleStepper}>
          <TouchableOpacity
            style={[
              styles.stepperButton,
              !canDecreasePeople && styles.stepperButtonDisabled,
            ]}
            onPress={handleDecreasePeople}
            disabled={!canDecreasePeople}>
            <Text style={styles.stepperButtonText}>-</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.peopleInput}
            value={selectedOrderPeople}
            onChangeText={handlePeopleInputChange}
            onBlur={handlePeopleBlur}
            keyboardType="number-pad"
            placeholder="0"
            maxLength={2}
            returnKeyType="done"
            textAlign="center"
          />
          <TouchableOpacity
            style={[
              styles.stepperButton,
              !canIncreasePeople && styles.stepperButtonDisabled,
            ]}
            onPress={handleIncreasePeople}
            disabled={!canIncreasePeople}>
            <Text style={styles.stepperButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.peopleHint}>
          최소 {MIN_ORDER_PEOPLE}명, 최대 {MAX_ORDER_PEOPLE}명 선택 가능
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.submitButton,
            !canSubmitOrder && styles.submitDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!canSubmitOrder}>
          <Text
            style={[
              styles.submitText,
              !canSubmitOrder && styles.submitTextDim,
            ]}>
            주문 진행하기
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  section: {
    marginBottom: 16,
  },
  sectionSpacing: {
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    marginBottom: 10,
  },
  timeSlotList: {
    paddingVertical: 4,
    paddingRight: 2,
  },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  timeChipSelected: {
    backgroundColor: '#E9F5FB',
    borderColor: '#45C9FF',
  },
  timeChipText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#555',
  },
  timeChipTextSelected: {
    color: '#45C9FF',
    fontFamily: 'Pretendard-SemiBold',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#999',
  },
  peopleStepper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  stepperButtonDisabled: {
    borderColor: '#EEE',
    backgroundColor: '#F5F5F5',
  },
  stepperButtonText: {
    fontSize: 20,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    lineHeight: 20,
  },
  peopleInput: {
    marginHorizontal: 12,
    width: 52,
    height: 38,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    paddingVertical: 4,
    paddingHorizontal: 0,
    textAlignVertical: 'center',
  },
  peopleHint: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#888',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#fff',
  },
  cancelText: {
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
    color: '#666',
  },
  submitButton: {
    flex: 1.2,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#45C9FF',
  },
  submitDisabled: {
    backgroundColor: '#B6E4F6',
  },
  submitText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Bold',
    color: '#fff',
  },
  submitTextDim: {
    color: '#F0F9FD',
  },
});

export default OrderForm;
