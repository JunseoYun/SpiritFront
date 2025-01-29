import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트

const UpdateStoreClosedDays = ({
  days,
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
}) => {
  const toggleDay = dayValue => {
    setUpdatedValue(prev => {
      if (dayValue === null) {
        // "없음" 선택 시 다른 항목 해제
        return [];
      } else {
        const newDays = prev.filter(d => d !== null);
        if (newDays.includes(dayValue)) {
          // 이미 선택된 경우 제거
          return newDays.filter(d => d !== dayValue);
        } else {
          // 새로운 항목 추가
          return [...newDays, dayValue];
        }
      }
    });
  };

  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>매장 휴무일</Text>
      {/* 선택 가능한 휴무일 */}
      <View style={styles.daysContainer}>
        {days.map((day, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              updatedValue.includes(day.value) && styles.selectedDayButton,
            ]}
            onPress={() => toggleDay(day.value)}>
            <Text
              style={[
                styles.dayText,
                updatedValue.includes(day.value) && styles.selectedDayText,
              ]}>
              {day.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreClosedDays;

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
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
});
