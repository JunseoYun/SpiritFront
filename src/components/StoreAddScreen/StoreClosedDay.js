import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// 표시될 값과 실제 저장될 값을 객체로 정의
const days = [
  { label: '월', value: 'MONDAY' },
  { label: '화', value: 'TUESDAY' },
  { label: '수', value: 'WEDNESDAY' },
  { label: '목', value: 'THURSDAY' },
  { label: '금', value: 'FRIDAY' },
  { label: '토', value: 'SATURDAY' },
  { label: '일', value: 'SUNDAY' },
  { label: '없음', value: null },
];

const StoreClosedDay = ({ closedDay, setClosedDay }) => {

  const toggleDay = (dayValue) => {
    setClosedDay((prev) => {
      if (dayValue === null) {
        // "없음"이 선택된 경우 다른 항목 모두 해제하고 "없음"만 선택
        return [];
      } else {
        // 다른 항목이 선택된 경우 "없음" 해제
        const newDays = prev.filter((d) => d !== null);
        if (newDays.includes(dayValue)) {
          // 이미 선택된 경우 제거
          return newDays.filter((d) => d !== dayValue);
        } else {
          // 선택되지 않은 경우 추가
          return [...newDays, dayValue];
        }
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>휴무일</Text>
      <View style={styles.daysContainer}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              closedDay.includes(day.value) && styles.selectedDayButton,
            ]}
            onPress={() => toggleDay(day.value)}
          >
            <Text
              style={[
                styles.dayText,
                closedDay.includes(day.value) && styles.selectedDayText,
              ]}
            >
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  title: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    margin: 7,
  },
  selectedDayButton: {
    backgroundColor: '#16BBFF',
  },
  dayText: {
    fontSize: 18,
    color: '#333',
  },
  selectedDayText: {
    color: '#FFF',
  },
  selectedDaysText: {
    marginTop: 20,
    fontSize: 14,
    color: '#333',
  },
});

export default StoreClosedDay;
