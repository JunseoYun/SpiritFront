import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

const OperatingHoursInput = ({
  sameOpenTime,
  sameCloseTime,
  isOpenTime,
  isCloseTime,
  wrongBreak,
  isSameOperating,
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
            isOpenTime && {color: '#45C9FF'},
            isOpenTime && wrongBreak && {color: '#FF4816'},
            isOpenTime && isSameOperating && {color: '#FF4816'},
          ]}>
          {`${sameOpenTime.openHour}:${sameOpenTime.openMinute}`}
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
        {sameCloseTime.closedHour >= 24 && (
          <Text
            style={[
              styles.nextText,

              isCloseTime &&
                wrongBreak && {color: '#FF4816', borderColor: '#FF4816'},
              isCloseTime &&
                isSameOperating && {color: '#FF4816', borderColor: '#FF4816'},
            ]}>
            {'다음날'}
          </Text>
        )}

        <Text
          style={[
            styles.timeText,
            isCloseTime && {color: '#45C9FF'},
            isCloseTime && wrongBreak && {color: '#FF4816'},
            isCloseTime && isSameOperating && {color: '#FF4816'},
          ]}>
          {`${
            sameCloseTime.closedHour >= 24
              ? (sameCloseTime.closedHour - 24).toString().padStart(2, '0')
              : sameCloseTime.closedHour.toString().padStart(2, '0')
          }:${sameCloseTime.closedMinute.toString().padStart(2, '0')}`}
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
  nextText: {
    fontSize: 12,
    color: '#45C9FF',
    fontFamily: 'Pretendard-SemiBold',
    borderWidth: 1,
    borderColor: '#45C9FF',
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
    color: '#333',
    marginHorizontal: 15,
  },
});

export default OperatingHoursInput;
