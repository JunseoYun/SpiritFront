import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

const OperatingHoursInput = ({
  sameOpenTime,
  sameCloseTime,
  isOpenTime,
  isCloseTime,
  wrongBreak,
  isSameOperating,
  isNextOperating,
  handleTimePickerToggle,
}) => {
  return (
    <View style={styles.timeInputContainer}>
      <Pressable
        style={[
          styles.timeInput,
          isOpenTime && {backgroundColor: 'rgba(22, 187, 255, 0.2)'},
          isOpenTime &&
            wrongBreak && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
          isOpenTime &&
            isSameOperating && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
        ]}
        onPress={() => handleTimePickerToggle('open')}>
        <Text
          style={[
            styles.timeText,
            isOpenTime && {color: '#16BBFF'},
            isOpenTime && wrongBreak && {color: '#FF4816'},
            isOpenTime && isSameOperating && {color: '#FF4816'},
          ]}>
          {`${sameOpenTime.hour}:${sameOpenTime.minute}`}
        </Text>
      </Pressable>
      <Text style={styles.separator}>~</Text>
      <Pressable
        style={[
          styles.timeInput,
          isCloseTime && {backgroundColor: 'rgba(22, 187, 255, 0.2)'},
          isCloseTime &&
            wrongBreak && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
          isCloseTime &&
            isSameOperating && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
        ]}
        onPress={() => handleTimePickerToggle('close')}>
        <Text
          style={[
            styles.timeText,
            isCloseTime && {color: '#16BBFF'},
            isCloseTime && wrongBreak && {color: '#FF4816'},
            isCloseTime && isSameOperating && {color: '#FF4816'},
          ]}>
          {isNextOperating && '다음날'}{' '}
          {`${sameCloseTime.hour}:${sameCloseTime.minute}`}
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
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
  },
  timeText: {
    fontWeight: '600',
    color: '#333',
    fontSize: 15,
  },
  separator: {
    fontSize: 18,
    color: '#333',
    marginHorizontal: 15,
  },
});

export default OperatingHoursInput;
