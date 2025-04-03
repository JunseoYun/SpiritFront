import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import TimePicker from '../../../hooks/TimePicker';
import CloseTimePicker from '../../../hooks/CloseTimePicker';
const BreakTimePicker = ({
  isStartTime,
  sameStartTime,
  sameEndTime,
  wrongBreak,
  handleTimeChange,
  breakErrorMessage,
}) => {
  return (
    <>
      <View style={styles.pickerTopView}>
        <View style={styles.pickerWrapper}>
          {isStartTime ? (
            <TimePicker
              selectedHour={sameStartTime.startHour}
              selectedMinute={sameStartTime.startMinute}
              onHourChange={value =>
                handleTimeChange('sameStartTime', 'startHour', value)
              }
              onMinuteChange={value =>
                handleTimeChange('sameStartTime', 'startMinute', value)
              }
            />
          ) : (
            <CloseTimePicker
              selectedHour={sameEndTime.endHour}
              selectedMinute={sameEndTime.endMinute}
              onHourChange={value =>
                handleTimeChange('sameEndTime', 'endHour', value)
              }
              onMinuteChange={value =>
                handleTimeChange('sameEndTime', 'endMinute', value)
              }
            />
          )}
        </View>
      </View>
      {wrongBreak && <Text style={styles.wrongText}>{breakErrorMessage}</Text>}
    </>
  );
};

const styles = StyleSheet.create({
  pickerTopView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: 8,
  },
  wrongText: {
    alignSelf: 'center',
    marginTop: 5,
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#FF4816',
  },
});

export default BreakTimePicker;
