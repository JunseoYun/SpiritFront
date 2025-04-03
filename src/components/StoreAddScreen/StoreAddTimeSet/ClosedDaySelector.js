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

  setIs24,

  handleBottomClose,
  setIsAllClosed,
  isBottomOpen,
}) => {
  const handleClosedToggle = () => {
    if (isBottomOpen) {
      return;
    }
    let isInvalid = !isClosed;
    setIsClosed(prev => !prev);

    // 🚨 여기서 'isClosed === true'일 때만 초기화
    if (isInvalid === true) {
      setIs24(false); // 🚨 24시간 설정 해제
    }

    handleBottomClose();
  };

  useEffect(() => {
    if (!isClosed) {
      setLocalClosedDay([]);

      setIsAllClosed(false); // 🚨 모든 요일 해제 시 isAllClosed도 false로 초기화
    }
  }, [isClosed, setLocalClosedDay, setIsAllClosed]);

  const toggleDay = dayValue => {
    if (isBottomOpen) {
      return;
    }
    setLocalClosedDay(prev => {
      const newSet = new Set(prev);
      if (newSet.has(dayValue)) {
        newSet.delete(dayValue);
      } else {
        newSet.add(dayValue);
      }
      const newDays = Array.from(newSet);
      setIsAllClosed(newDays.length === days.length);

      return newDays;
    });

    handleBottomClose();
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
      {isClosed && localClosedDay.length === days.length && (
        <Text style={styles.wrongText}>
          모든 요일을 휴일로 설정할 수 없어요
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
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
    backgroundColor: '#45C9FF',
    borderColor: '#45C9FF',
  },
  selectedText: {
    color: '#fff',
    fontFamily: 'Pretendard-SemiBold',
  },
  unselectedText: {
    color: '#aaa',
    fontFamily: 'Pretendard-SemiBold',
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
    backgroundColor: '#45C9FF',
  },
  dayText: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
  },
  selectedDayText: {
    color: '#FFF',
  },
  wrongText: {
    marginHorizontal: 18,
    marginTop: 5,
    fontSize: 15,
    fontFamily: 'Pretendard-Regular',
    color: '#FF4816',
  },
});

export default ClosedDaySelector;
