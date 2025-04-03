import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import TimePicker from '../../../hooks/TimePicker';
import CloseTimePicker from '../../../hooks/CloseTimePicker';

const OperatingHoursTimePicker = ({
  isOpenTime,
  sameOpenTime,
  sameCloseTime,
  wrongBreak,
  isSameOperating,
  handleTimeChange,
  operateErrorMessage,
}) => {
  return (
    <>
      <View style={styles.pickerTopView}>
        <View style={styles.pickerWrapper}>
          {isOpenTime ? (
            <TimePicker
              selectedHour={sameOpenTime.openHour}
              selectedMinute={sameOpenTime.openMinute}
              onHourChange={value =>
                handleTimeChange('sameOpenTime', 'openHour', value)
              }
              onMinuteChange={value =>
                handleTimeChange('sameOpenTime', 'openMinute', value)
              }
            />
          ) : (
            <CloseTimePicker
              selectedHour={sameCloseTime.closedHour}
              selectedMinute={sameCloseTime.closedMinute}
              onHourChange={value =>
                handleTimeChange('sameCloseTime', 'closedHour', value)
              }
              onMinuteChange={value =>
                handleTimeChange('sameCloseTime', 'closedMinute', value)
              }
            />
          )}
        </View>
      </View>
      {isSameOperating ? (
        <Text style={styles.wrongText}>{operateErrorMessage}</Text>
      ) : wrongBreak ? (
        <Text style={styles.wrongText}>
          영업 시간은 브레이크타임을 포함하도록 설정해주세요.
        </Text>
      ) : null}
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

  pickerOkText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
  },
});

export default OperatingHoursTimePicker;
