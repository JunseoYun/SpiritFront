import React, {useEffect} from 'react';
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import ColorUtil from '../../../utils/ColorUtil';
import CustomText from '../../../utils/CustomText';
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
      <CustomText style={styles.sectionTitle}>휴무일이 있나요?</CustomText>
      <View style={styles.toggleContainer}>
        <Pressable
          style={[styles.toggleButton, isClosed && styles.selectedToggle]}
          onPress={handleClosedToggle}>
          <CustomText
            style={isClosed ? styles.selectedText : styles.unselectedText}>
            있음
          </CustomText>
        </Pressable>
        <Pressable
          style={[styles.toggleButton, !isClosed && styles.selectedToggle]}
          onPress={handleClosedToggle}>
          <CustomText
            style={!isClosed ? styles.selectedText : styles.unselectedText}>
            없음
          </CustomText>
        </Pressable>
      </View>
      {isClosed && (
        <View style={styles.daysContainer}>
          <ScrollView
            horizontal
            // nestedScrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            // onStartShouldSetResponder={() => true}
            contentContainerStyle={{
              paddingHorizontal: 18,
              gap: 10,
            }}>
            {days.map((day, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayButton,
                  localClosedDay.includes(day.value) &&
                    styles.selectedDayButton,
                ]}
                onPress={() => toggleDay(day.value)}>
                <CustomText
                  style={[
                    styles.dayText,
                    localClosedDay.includes(day.value) &&
                      styles.selectedDayText,
                  ]}>
                  {day.label}
                </CustomText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      {isClosed && localClosedDay.length === days.length && (
        <CustomText style={styles.wrongText}>
          모든 요일을 휴일로 설정할 수 없어요
        </CustomText>
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
    borderColor: ColorUtil.border,
    paddingHorizontal: 15,
    borderRadius: 100,
    marginRight: 7,
  },
  selectedToggle: {
    backgroundColor: ColorUtil.main,
    borderColor: ColorUtil.main,
  },
  selectedText: {
    color: '#FFF',
    fontFamily: 'Pretendard-Medium',
  },
  unselectedText: {
    color: ColorUtil.chipText,
    fontFamily: 'Pretendard-Medium',
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 5,
  },
  dayButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: ColorUtil.border,
  },
  selectedDayButton: {
    backgroundColor: ColorUtil.mainChip,
    borderColor: ColorUtil.main,
    borderWidth: 1,
  },
  dayText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',

    color: ColorUtil.chipText,
  },
  selectedDayText: {
    color: ColorUtil.main,
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
