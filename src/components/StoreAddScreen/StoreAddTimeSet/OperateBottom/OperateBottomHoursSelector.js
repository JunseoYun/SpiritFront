import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

const OperateBottomHoursSelector = ({
  openHour,
  openMinute,
  closeHour,
  closeMinute,
  isOpenTime,
  isCloseTime,
  breakError,
  operateError,
  handleTimePickerToggle,
}) => {
  return (
    <View>
      <Text style={styles.boldText}>영업 시간</Text>
      <View style={styles.timeInputContainer}>
        <Pressable
          style={[
            styles.timeInput,
            isOpenTime && {backgroundColor: 'rgba(22, 187, 255, 0.2)'},
            isOpenTime &&
              breakError && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
            isOpenTime &&
              operateError && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
          ]}
          onPress={() => handleTimePickerToggle('open')}>
          <Text
            style={[
              styles.timeText,
              isOpenTime && {color: '#45C9FF'},
              isOpenTime && breakError && {color: '#FF4816'},
              isOpenTime && operateError && {color: '#FF4816'},
            ]}>
            {`${openHour}:${openMinute}`}
          </Text>
        </Pressable>
        <Text style={styles.separator}>~</Text>
        <Pressable
          style={[
            styles.timeInput,
            isCloseTime && {backgroundColor: 'rgba(22, 187, 255, 0.2)'},
            isCloseTime &&
              breakError && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
            isCloseTime &&
              operateError && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
            {flexDirection: 'row'},
          ]}
          onPress={() => handleTimePickerToggle('close')}>
          {closeHour >= 24 && (
            <Text
              style={[
                styles.nextText,
                isCloseTime && {color: '#45C9FF'},
                isCloseTime &&
                  breakError && {color: '#FF4816', borderColor: '#FF4816'},
                isCloseTime &&
                  operateError && {color: '#FF4816', borderColor: '#FF4816'},
              ]}>
              다음날
            </Text>
          )}
          <Text
            style={[
              styles.timeText,
              isCloseTime && {color: '#45C9FF'},
              isCloseTime && breakError && {color: '#FF4816'},
              isCloseTime && operateError && {color: '#FF4816'},
            ]}>
            {closeHour >= 24
              ? `${String(closeHour - 24).padStart(2, '0')}:${closeMinute}`
              : `${String(closeHour).padStart(2, '0')}:${closeMinute}`}
          </Text>
        </Pressable>
      </View>
    </View>
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
    justifyContent: 'center',
    fontFamily: 'Pretendard-Medium',
    flex: 1,
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
    color: '#181A1A',
    fontSize: 15,
  },
  separator: {
    fontSize: 18,
    color: '#181A1A',
    marginHorizontal: 15,
  },
});

export default OperateBottomHoursSelector;
