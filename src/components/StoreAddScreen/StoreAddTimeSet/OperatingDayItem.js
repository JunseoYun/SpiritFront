import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';

const OperatingDayItem = ({
  day,
  isClosedDay,
  openHour,
  openMinute,
  closeHour,
  closeMinute,
  breakStartHour,
  breakStartMinute,
  breakEndHour,
  breakEndMinute,
  handleBottomOpen,
  isLastItem,
}) => {
  return (
    <Pressable
      onPress={() => !isClosedDay && handleBottomOpen(day)}
      style={[
        styles.dayContainer,
        isClosedDay && styles.disabled,
        !isClosedDay && breakStartHour && {paddingVertical: 15},
        isLastItem && {borderBottomWidth: 0},
      ]}>
      <Text style={styles.operateDayText}>{day.label}요일</Text>
      <View style={[styles.timeContainer]}>
        <View>
          <View style={styles.timeInputView}>
            {isClosedDay ? (
              <Text style={styles.holidayText}>휴무</Text>
            ) : (
              <>
                <Text style={styles.timeInputTitle}>영업 시간</Text>
                <Text style={styles.timeInputText}>
                  {openHour
                    ? `${openHour}:${openMinute} ~ ${
                        closeHour >= 24
                          ? `다음날 ${String(closeHour - 24).padStart(2, '0')}`
                          : String(closeHour).padStart(2, '0')
                      }:${closeMinute}`
                    : '미설정'}
                </Text>
              </>
            )}
          </View>
          {isClosedDay
            ? null
            : breakStartHour && (
                <View style={styles.timeInputView}>
                  <Text style={styles.timeInputTitle}>브레이크타임</Text>
                  <Text style={styles.timeInputText}>
                    {breakStartHour
                      ? `${breakStartHour}:${breakStartMinute} ~ ${
                          breakEndHour >= 24
                            ? `다음날 ${String(breakEndHour - 24).padStart(
                                2,
                                '0',
                              )}`
                            : String(breakEndHour).padStart(2, '0')
                        }:${breakEndMinute}`
                      : '미설정'}
                  </Text>
                </View>
              )}
        </View>
        {!isClosedDay && (
          <Octicons
            name="chevron-right"
            size={20}
            color="#4B4B4B"
            style={styles.icons}
          />
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  dayContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#EAEAEA',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 20,
  },
  operateDayText: {
    color: '#4B4B4B',
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'center',
  },
  timeContainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  disabled: {
    backgroundColor: '#EFEFEF',
  },
  timeInputView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  timeInputTitle: {
    lineHeight: 30,
    color: '#999',
    fontWeight: '500',
    fontSize: 15,
    marginRight: 7,
  },
  timeInputText: {
    lineHeight: 30,
    fontWeight: '400',
    fontSize: 15,
    color: '#4B4B4B',
  },
  holidayText: {
    lineHeight: 30,
    fontWeight: '500',
    fontSize: 15,
    color: '#4B4B4B',
    marginRight: 18,
  },
  icons: {
    marginLeft: 15,
    alignSelf: 'center',
  },
});

export default OperatingDayItem;
