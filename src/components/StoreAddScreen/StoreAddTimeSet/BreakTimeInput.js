import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import CustomText from '../../../utils/CustomText';

const BreakTimeInput = ({
  sameStartTime,
  sameEndTime,
  isStartTime,
  isEndTime,
  wrongBreak,
  handleTimePickerToggle,
  isStartNextDay = false,
  isEndNextDay = false,
}) => {
  const startHourNumber = Number(sameStartTime.startHour || 0);
  const endHourNumber = Number(sameEndTime.endHour || 0);
  const shouldShowStartNext = isStartNextDay || startHourNumber >= 24;
  const shouldShowEndNext = isEndNextDay || endHourNumber >= 24;

  const formatHour = (value, showNext) =>
    (showNext ? value % 24 : value).toString().padStart(2, '0');
  const formatMinute = value =>
    Number(value || 0)
      .toString()
      .padStart(2, '0');

  return (
    <View>
      <View style={styles.checkboxHeader}>
        <CustomText style={styles.checkboxLabel}>브레이크타임</CustomText>
      </View>
      <View style={styles.timeInputContainer}>
        <Pressable
          style={[
            styles.timeInput,
            isStartTime && {backgroundColor: 'rgba(22, 187, 255, 0.2)'},
            isStartTime &&
              wrongBreak && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
          ]}
          onPress={() => handleTimePickerToggle('start')}>
          {shouldShowStartNext && (
            <CustomText
              style={[
                styles.nextText,
                isStartTime &&
                  wrongBreak && {color: '#FF4816', borderColor: '#FF4816'},
              ]}>
              {'다음날'}
            </CustomText>
          )}
          <CustomText
            style={[
              styles.timeText,
              isStartTime && {color: '#3CBBFF'},
              isStartTime && wrongBreak && {color: '#FF4816'},
            ]}>
            {`${formatHour(
              startHourNumber,
              shouldShowStartNext,
            )}:${formatMinute(sameStartTime.startMinute)}`}
          </CustomText>
        </Pressable>
        <CustomText style={styles.separator}>~</CustomText>
        <Pressable
          style={[
            styles.timeInput,
            isEndTime && {backgroundColor: 'rgba(22, 187, 255, 0.2)'},
            isEndTime &&
              wrongBreak && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
          ]}
          onPress={() => handleTimePickerToggle('end')}>
          {shouldShowEndNext && (
            <CustomText
              style={[
                styles.nextText,
                isEndTime &&
                  wrongBreak && {color: '#FF4816', borderColor: '#FF4816'},
              ]}>
              {'다음날'}
            </CustomText>
          )}

          <CustomText
            style={[
              styles.timeText,
              isEndTime && {color: '#3CBBFF'},
              isEndTime && wrongBreak && {color: '#FF4816'},
            ]}>
            {`${formatHour(endHourNumber, shouldShowEndNext)}:${formatMinute(
              sameEndTime.endMinute,
            )}`}
          </CustomText>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  checkboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    justifyContent: 'space-between',
    marginTop: 30,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 12,
  },
  timeInput: {
    backgroundColor: '#F2F2F2',
    color: '#333',
    padding: 10,
    borderRadius: 5,
    width: 80,
    textAlign: 'center',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
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
    color: '#333',
    fontSize: 15,
  },
  separator: {
    fontSize: 18,
    color: '#181A1A',
    marginHorizontal: 15,
  },
});

export default BreakTimeInput;
