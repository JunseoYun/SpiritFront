import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import TimePicker from '../../../hooks/TimePicker';

const OperatingHoursTimePicker = ({
  isOpenTime,
  sameOpenTime,
  sameCloseTime,
  wrongBreak,
  isSameOperating,
  handleSameOperating,
  handleTimePickerToggle,
}) => {
  return (
    <View style={styles.pickerTopView}>
      <View style={styles.pickerWrapper}>
        <TimePicker
          selectedHour={isOpenTime ? sameOpenTime.hour : sameCloseTime.hour}
          selectedMinute={
            isOpenTime ? sameOpenTime.minute : sameCloseTime.minute
          }
          onHourChange={value =>
            isOpenTime
              ? handleSameOperating('openHour', value)
              : handleSameOperating('closedHour', value)
          }
          onMinuteChange={value =>
            isOpenTime
              ? handleSameOperating('openMinute', value)
              : handleSameOperating('closedMinute', value)
          }
        />
        {wrongBreak && (
          <Text style={styles.wrongText}>
            영업 시간은 브레이크타임을 포함하도록 설정해주세요.
          </Text>
        )}
        {isSameOperating && (
          <Text style={styles.wrongText}>
            영업 시작 시간과 종료 시간을 다르게 설정해주세요.
          </Text>
        )}

        <Pressable
          style={[
            styles.pickerOkView,
            wrongBreak && {backgroundColor: '#F2F2F2'},
            isSameOperating && {backgroundColor: '#F2F2F2'},
          ]}
          onPress={() => handleTimePickerToggle(isOpenTime ? 'open' : 'close')}>
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

export default OperatingHoursTimePicker;
