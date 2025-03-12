import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import TimePicker from '../../../hooks/TimePicker';

const BreakTimePicker = ({
  isStartTime,
  sameStartTime,
  sameEndTime,
  wrongBreak,
  handleSameBreaking,
  handleTimePickerToggle,
}) => {
  return (
    <View style={styles.pickerTopView}>
      <View style={styles.pickerWrapper}>
        <TimePicker
          selectedHour={isStartTime ? sameStartTime.hour : sameEndTime.hour}
          selectedMinute={
            isStartTime ? sameStartTime.minute : sameEndTime.minute
          }
          onHourChange={value =>
            isStartTime
              ? handleSameBreaking('startHour', value)
              : handleSameBreaking('endHour', value)
          }
          onMinuteChange={value =>
            isStartTime
              ? handleSameBreaking('startMinute', value)
              : handleSameBreaking('endMinute', value)
          }
        />
        {wrongBreak && (
          <Text style={styles.wrongText}>
            브레이크타임은 영업 시간에 포함되도록 설정해주세요.
          </Text>
        )}
        <Pressable
          style={[
            styles.pickerOkView,
            wrongBreak && {backgroundColor: '#F2F2F2'},
          ]}
          onPress={() => handleTimePickerToggle(isStartTime ? 'start' : 'end')}>
          <Text style={styles.pickerOkText}>확인</Text>
        </Pressable>
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
    fontWeight: '500',
    color: '#FF4816',
  },
  pickerOkView: {
    width: '100%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    backgroundColor: '#16BBFF',
    borderRadius: 7,
  },
  pickerOkText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
  },
});

export default BreakTimePicker;
