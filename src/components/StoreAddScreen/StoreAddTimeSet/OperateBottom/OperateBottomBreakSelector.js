import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

const OperateBottomBreakSelector = ({
  isStartTime,
  isEndTime,
  breakStartHour,
  breakStartMinute,
  breakEndHour,
  breakEndMinute,
  breakError,
  handleTimePickerToggle,
}) => {
  return (
    <>
      <Text style={[styles.boldText, {marginTop: 20}]}>브레이크타임</Text>
      <View style={styles.timeInputContainer}>
        <Pressable
          style={[
            styles.timeInput,
            isStartTime && {backgroundColor: 'rgba(22, 187, 255, 0.2)'},
            isStartTime &&
              breakError && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
          ]}
          onPress={() => handleTimePickerToggle('start')}>
          <Text
            style={[
              styles.timeText,
              isStartTime && {color: '#3CBBFF'},
              breakError && {color: '#FF4816'},
            ]}>
            {`${breakStartHour}:${breakStartMinute}`}
          </Text>
        </Pressable>
        <Text style={styles.separator}>~</Text>
        <Pressable
          style={[
            styles.timeInput,
            isEndTime && {backgroundColor: 'rgba(22, 187, 255, 0.2)'},
            isEndTime &&
              breakError && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
          ]}
          onPress={() => handleTimePickerToggle('end')}>
          {breakEndHour >= 24 && (
            <Text
              style={[
                styles.nextText,
                isEndTime && {color: '#3CBBFF'},
                breakError && {color: '#FF4816', borderColor: '#FF4816'},
              ]}>
              다음날
            </Text>
          )}
          <Text
            style={[
              styles.timeText,
              isEndTime && {color: '#3CBBFF'},
              breakError && {color: '#FF4816'},
            ]}>
            {breakEndHour >= 24
              ? `${String(breakEndHour - 24).padStart(
                  2,
                  '0',
                )}:${breakEndMinute}`
              : `${String(breakEndHour).padStart(2, '0')}:${breakEndMinute}`}
          </Text>
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  boldText: {
    marginHorizontal: 18,
    marginVertical: 10,
    fontFamily: 'Pretendard-Medium',
    fontSize: 16,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginBottom: 12,
  },
  timeInput: {
    backgroundColor: '#F2F2F2',
    color: '#181A1A',
    padding: 10,
    borderRadius: 5,
    width: 80,
    textAlign: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    flex: 1,
  },
  nextText: {
    fontSize: 12,
    color: '#3CBBFF',
    fontFamily: 'Pretendard-SemiBold',
    borderWidth: 1,
    borderColor: '#3CBBFF',
    padding: 3,
    marginRight: 5,
    borderRadius: 3,
  },
  timeText: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#181A1A',
    fontSize: 15,
  },
  separator: {
    fontSize: 18,
    color: '#181A1A',
    marginHorizontal: 15,
  },
});

export default OperateBottomBreakSelector;
