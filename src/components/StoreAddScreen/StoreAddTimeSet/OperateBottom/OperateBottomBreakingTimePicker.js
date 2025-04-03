import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import TimePicker from '../../../../hooks/TimePicker';
import CloseTimePicker from '../../../../hooks/CloseTimePicker';

const OperateBottomBreakingTimePicker = ({
  isStartTime,
  breakStartHour,
  breakStartMinute,
  breakEndHour,
  breakEndMinute,
  handleDiffBreaking,
  formattedDay,
  breakError,
  breakErrorMessage,
}) => {
  return (
    <View style={styles.pickerTopView}>
      <View style={styles.pickerWrapper}>
        {isStartTime ? (
          <TimePicker
            selectedHour={breakStartHour}
            selectedMinute={breakStartMinute}
            onHourChange={value =>
              handleDiffBreaking(formattedDay, 'startHour', value)
            }
            onMinuteChange={value =>
              handleDiffBreaking(formattedDay, 'startMinute', value)
            }
          />
        ) : (
          <CloseTimePicker
            selectedHour={breakEndHour}
            selectedMinute={breakEndMinute}
            onHourChange={value =>
              handleDiffBreaking(formattedDay, 'endHour', value)
            }
            onMinuteChange={value =>
              handleDiffBreaking(formattedDay, 'endMinute', value)
            }
          />
        )}

        {breakError && (
          <Text style={styles.wrongText}>{breakErrorMessage}</Text>
        )}
      </View>
    </View>
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

export default OperateBottomBreakingTimePicker;
