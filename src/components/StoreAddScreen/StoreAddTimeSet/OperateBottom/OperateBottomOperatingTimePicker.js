import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import TimePicker from '../../../../hooks/TimePicker';
import CloseTimePicker from '../../../../hooks/CloseTimePicker';
import CustomText from '../../../../utils/CustomText';

const OperateBottomOperatingTimePicker = ({
  isOpenTime,
  openHour,
  openMinute,
  closeHour,
  closeMinute,
  handleDiffOperating,
  formattedDay,
  breakError,
  operateError,
  operateErrorMessage,
}) => {
  return (
    <>
      <View style={styles.pickerTopView}>
        <View style={styles.pickerWrapper}>
          {isOpenTime ? (
            <TimePicker
              selectedHour={openHour}
              selectedMinute={openMinute}
              onHourChange={value =>
                handleDiffOperating(formattedDay, 'openHour', value)
              }
              onMinuteChange={value =>
                handleDiffOperating(formattedDay, 'openMinute', value)
              }
            />
          ) : (
            <CloseTimePicker
              selectedHour={closeHour}
              selectedMinute={closeMinute}
              onHourChange={value =>
                handleDiffOperating(formattedDay, 'closedHour', value)
              }
              onMinuteChange={value =>
                handleDiffOperating(formattedDay, 'closedMinute', value)
              }
            />
          )}
        </View>
      </View>
      {breakError && (
        <CustomText style={styles.wrongText}>
          영업 시간은 브레이크타임을 포함하도록 설정해주세요.
        </CustomText>
      )}
      {operateError && (
        <CustomText style={styles.wrongText}>{operateErrorMessage}</CustomText>
      )}
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

export default OperateBottomOperatingTimePicker;
