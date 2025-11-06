import React from 'react';
import {View, Text, Pressable, StyleSheet, PixelRatio} from 'react-native';
import Octicons from 'react-native-vector-icons/Octicons';
import {normalizeFont} from '../../../hooks/normalizeFont';
const fontScale = PixelRatio.getFontScale();
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
        fontScale >= 1.5 &&
          !isClosedDay && {
            flexDirection: 'column',
            alignItems: 'center',
          },
      ]}>
      <Text style={[styles.operateDayText, isClosedDay && {color: '#6b7280'}]}>
        {day.label}요일
      </Text>
      <View style={[styles.timeContainer]}>
        <View>
          <View style={styles.timeInputView}>
            {isClosedDay ? (
              <Text style={styles.holidayText}>휴무</Text>
            ) : (
              <>
                <Text style={styles.timeInputTitle} allowFontScaling={false}>
                  영업 시간
                </Text>
                <Text style={styles.timeInputText} allowFontScaling={false}>
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
                  <Text style={styles.timeInputTitle} allowFontScaling={false}>
                    브레이크타임
                  </Text>
                  <Text style={styles.timeInputText} allowFontScaling={false}>
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
    color: '#333',
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    alignSelf: 'center',
  },
  timeContainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row',
  },
  disabled: {
    backgroundColor: '#f7f7f7ff',
  },
  timeInputView: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  timeInputTitle: {
    lineHeight: 30,
    color: '#999',
    fontFamily: 'Pretendard-Regular',
    fontSize: normalizeFont(15, 1.7),
    marginRight: 7,
  },
  timeInputText: {
    lineHeight: 30,
    fontFamily: 'Pretendard-Medium',
    fontSize: normalizeFont(15, 1.7),
    color: '#333',
  },
  holidayText: {
    lineHeight: 30,
    fontFamily: 'Pretendard-Medium',
    fontSize: 15,
    color: '#6b7280',
    marginRight: 18,
  },
  icons: {
    marginLeft: 15,
    alignSelf: 'center',
  },
});

export default OperatingDayItem;
