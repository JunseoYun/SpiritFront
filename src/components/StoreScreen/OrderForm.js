import React, {useEffect, useMemo, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
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
const MAX_ORDER_PEOPLE = 40;
const DEFAULT_ORDER_PEOPLE = 2;

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
  const peopleOptions = useMemo(
    () =>
      Array.from(
        {length: MAX_ORDER_PEOPLE - MIN_ORDER_PEOPLE + 1},
        (_, index) => MIN_ORDER_PEOPLE + index,
      ),
    [],
  );
  const [selectedOrderTime, setSelectedOrderTime] = useState('');
  const [selectedOrderPeople, setSelectedOrderPeople] = useState(
    String(DEFAULT_ORDER_PEOPLE),
  );

  useEffect(() => {
    setSelectedOrderTime(prev =>
      timeSlots.includes(prev) ? prev : timeSlots[0] ?? '',
    );
  }, [timeSlots]);

  const handleSelectOrderTime = value => {
    setSelectedOrderTime(value);
  };

  const handleSelectPeople = value => {
    setSelectedOrderPeople(String(value));
  };

  const peopleCount = parseInt(selectedOrderPeople, 10);

  const canSubmitOrder =
    !!selectedOrderTime &&
    !Number.isNaN(peopleCount) &&
    peopleCount >= MIN_ORDER_PEOPLE &&
    peopleCount <= MAX_ORDER_PEOPLE;

  const handleCancel = () => {
    Keyboard.dismiss();
    setSelectedOrderTime(timeSlots[0] ?? '');
    setSelectedOrderPeople(String(DEFAULT_ORDER_PEOPLE));
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.peopleChipList}>
          {peopleOptions.map(number => {
            const isSelected = peopleCount === number;
            return (
              <TouchableOpacity
                key={number}
                onPress={() => handleSelectPeople(number)}
                style={[
                  styles.peopleChip,
                  isSelected && styles.peopleChipSelected,
                ]}>
                <Text
                  style={[
                    styles.peopleChipText,
                    isSelected && styles.peopleChipTextSelected,
                  ]}>
                  {number}명
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
        <Text style={styles.peopleHint}>
          최소 {MIN_ORDER_PEOPLE}명, 최대 {MAX_ORDER_PEOPLE}명 선택 가능
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.applyButton, !canSubmitOrder && styles.applyDisabled]}
          onPress={handleSubmit}
          disabled={!canSubmitOrder}>
          <Text
            style={[styles.applyText, !canSubmitOrder && styles.applyTextDim]}>
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
    paddingVertical: 14,
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
    marginHorizontal: 16,
  },
  timeSlotList: {
    paddingVertical: 4,
    paddingRight: 2,
    paddingHorizontal: 16,
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
    borderColor: '#3CBBFF',
  },
  timeChipText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#555',
  },
  timeChipTextSelected: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-SemiBold',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#999',
    marginHorizontal: 18,
  },
  peopleChipList: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  peopleChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  peopleChipSelected: {
    backgroundColor: '#E9F5FB',
    borderColor: '#3CBBFF',
  },
  peopleChipText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#555',
  },
  peopleChipTextSelected: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-SemiBold',
  },
  peopleHint: {
    marginTop: 8,
    fontSize: 12,
    fontFamily: 'Pretendard-Regular',
    color: '#888',
    marginHorizontal: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  applyButton: {
    flex: 1.2,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3CBBFF',
  },

  footer: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
    paddingHorizontal: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    height: 44,
  },
  cancelText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Pretendard-Medium',
  },
  applyButton: {
    flex: 2,
    backgroundColor: '#3CBBFF',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    height: 44,
  },
  applyText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Pretendard-SemiBold',
  },
  applyDisabled: {
    backgroundColor: '#B6E4F6',
  },

  applyTextDim: {
    color: '#F0F9FD',
  },
});

export default OrderForm;
