import React, {useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const ClosedDaySelector = ({
  days,
  isClosed,
  setIsClosed,
  localClosedDay,
  setLocalClosedDay,
  setClosedDay,
  setIs24,
  setIs24Hours,
}) => {
  const handleClosedToggle = () => {
    setIsClosed(prev => !prev);

    // 🚨 여기서 'isClosed === true'일 때만 초기화
    if (!isClosed) {
      setIs24(false); // 🚨 24시간 설정 해제
      setIs24Hours(false);
    }
  };

  useEffect(() => {
    if (!isClosed) {
      setLocalClosedDay([]);
      setClosedDay([]);
    }
  }, [isClosed, setLocalClosedDay, setClosedDay]);

  const toggleDay = dayValue => {
    setLocalClosedDay(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayValue)) {
        newSet.delete(dayValue);
      } else {
        newSet.add(dayValue);
      }
      const newDays = Array.from(newSet);
      setClosedDay(newDays);
      return newDays;
    });
  };

  return (
    <View>
      <Text style={styles.sectionTitle}>휴무일이 있나요?</Text>
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, isClosed && styles.selectedToggle]}
          onPress={handleClosedToggle}>
          <Text style={isClosed ? styles.selectedText : styles.unselectedText}>
            있음
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, !isClosed && styles.selectedToggle]}
          onPress={handleClosedToggle}>
          <Text style={!isClosed ? styles.selectedText : styles.unselectedText}>
            없음
          </Text>
        </Pressable>
      </View>
      {isClosed && (
        <View style={styles.daysContainer}>
          {days.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayButton,
                localClosedDay.includes(day.value) && styles.selectedDayButton,
              ]}
              onPress={() => toggleDay(day.value)}>
              <Text
                style={[
                  styles.dayText,
                  localClosedDay.includes(day.value) && styles.selectedDayText,
                ]}>
                {day.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 25,
    marginHorizontal: 18,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    marginHorizontal: 18,
  },
  toggleButton: {
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#aaa',
    paddingHorizontal: 15,
    borderRadius: 100,
    marginRight: 7,
  },
  selectedToggle: {
    backgroundColor: '#16BBFF',
    borderColor: '#16BBFF',
  },
  selectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  unselectedText: {
    color: '#aaa',
    fontWeight: '600',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 12,
    marginHorizontal: 18,
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#F2F2F2',
    marginTop: -10,
  },
  selectedDayButton: {
    backgroundColor: '#16BBFF',
  },
  dayText: {
    fontSize: 15,
    color: '#333',
  },
  selectedDayText: {
    color: '#FFF',
  },
});

export default ClosedDaySelector;
