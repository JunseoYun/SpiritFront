import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import ColorUtil from '../../utils/ColorUtil';
import {calculateRangeFromEntry} from '../../utils/parseOperatingHours';
import CustomText from '../../utils/CustomText';
const OperatingHoursPreview = ({
  is24Hours,
  operatingHours,
  breakingHours,
  closedDay,
  storeTimeHandle,
  error,
  index,
  type = 'default',
}) => {
  const isRegistration = type === 'registration';
  const dayMapping = {
    Monday: '월',
    Tuesday: '화',
    Wednesday: '수',
    Thursday: '목',
    Friday: '금',
    Saturday: '토',
    Sunday: '일',
  };

  // ⏳ 영업 시간이 하나라도 비어있으면 표시 안 함
  const hasValidOperatingHours = Object.values(operatingHours).some(
    ({openHour, openMinute, closedHour, closedMinute}) =>
      openHour && openMinute && closedHour && closedMinute,
  );

  return (
    <>
      {!isRegistration && (
        <View style={styles.storeinputview}>
          <CustomText style={styles.label}>영업 시간</CustomText>
          <Pressable onPress={storeTimeHandle}>
            <CustomText style={[styles.storeinputtext, {color: '#333'}]}>
              편집
            </CustomText>
          </Pressable>
        </View>
      )}

      {/* 영업 시간 설정 전 */}
      {!hasValidOperatingHours && !is24Hours && (
        <Pressable
          style={[
            styles.emptyContainer,
            isRegistration && styles.registrationSpacing,
          ]}
          onPress={storeTimeHandle}>
          <CustomText style={styles.emptyText}>등록</CustomText>
        </Pressable>
      )}

      {/* ⏳ 유효한 영업 시간이 있을 때만 표시 */}
      {is24Hours && (
        <Pressable
          style={[
            styles.emptyContainer,
            isRegistration && styles.registrationSpacing,
          ]}
          onPress={storeTimeHandle}>
          <CustomText style={styles.emptyText}>24시간 영업</CustomText>
        </Pressable>
      )}
      {hasValidOperatingHours && !is24Hours && (
        <Pressable
          onPress={storeTimeHandle}
          style={[
            styles.operatingHoursContainer,
            isRegistration && styles.registrationSpacing,
          ]}>
          {Object.entries(operatingHours).map(
            (
              [day, {openHour, openMinute, closedHour, closedMinute}],
              index,
            ) => {
              const koreanDay = dayMapping[day];
              const isClosed = closedDay.includes(day.toUpperCase());
              const breakTime = breakingHours[day];
              const {isNextDay, openTime, closeTime} = calculateRangeFromEntry({
                openHour,
                openMinute,
                closedHour,
                closedMinute,
              });

              let breakDisplay = null;
              if (breakTime?.startHour && breakTime?.endHour) {
                const breakRange = calculateRangeFromEntry(
                  {
                    openHour: breakTime.startHour,
                    openMinute: breakTime.startMinute,
                    closedHour: breakTime.endHour,
                    closedMinute: breakTime.endMinute,
                  },
                  {
                    referenceHour: openHour,
                    referenceMinute: openMinute,
                  },
                );

                const breakStartLabel = breakRange.startDayOffset
                  ? `다음날 ${breakRange.openTime}`
                  : breakRange.openTime;
                const breakEndLabel = breakRange.endDayOffset
                  ? `다음날 ${breakRange.closeTime}`
                  : breakRange.closeTime;

                breakDisplay = (
                  <CustomText style={styles.breakTimeText}>
                    {`브레이크타임 ${breakStartLabel} ~ `}
                    <CustomText>{breakEndLabel}</CustomText>
                  </CustomText>
                );
              }

              return (
                <View key={day} style={styles.dayRow}>
                  <View
                    style={[styles.dayChip, isClosed && styles.closedDayChip]}>
                    <CustomText
                      style={[
                        styles.dayText,
                        isClosed && {color: ColorUtil.chipText},
                      ]}>
                      {koreanDay}
                    </CustomText>
                  </View>
                  {isClosed ? (
                    <CustomText style={styles.closedText}>휴무</CustomText>
                  ) : (
                    <View style={styles.timeContainer}>
                      <CustomText style={styles.operatingHoursText}>
                        {`${openTime} ~ `}
                        <CustomText>
                          {isNextDay ? `다음날 ${closeTime}` : closeTime}
                        </CustomText>
                      </CustomText>
                      {breakDisplay}
                    </View>
                  )}
                </View>
              );
            },
          )}
        </Pressable>
      )}
      {!hasValidOperatingHours && !is24Hours && error === 'StoreOperate' && (
        <CustomText style={styles.errorMessage}>
          매장 영업 시간을 등록해 주세요.
        </CustomText>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 50,
    marginHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  registrationSpacing: {
    marginTop: 0,
  },
  label: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    fontSize: 15,
    marginRight: 6,
  },
  editButton: {
    fontSize: 15,
    color: '#3CBBFF',
    fontFamily: 'Pretendard-Medium',
  },
  emptyContainer: {
    backgroundColor: '#F1F2F3',
    padding: 15,
    marginHorizontal: 18,
    borderRadius: 9,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
  },
  operatingHoursContainer: {
    marginHorizontal: 18,
    paddingVertical: 5,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#E5E5E5',
  },
  dayChip: {
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
    borderWidth: 1,
    backgroundColor: ColorUtil.mainChip,

    borderColor: ColorUtil.main,
  },
  closedDayChip: {
    borderColor: ColorUtil.border,
    backgroundColor: '#FFF',
  },
  dayText: {
    fontSize: 14,
    color: ColorUtil.main,
    fontFamily: 'Pretendard-SemiBold',
  },

  timeContainer: {
    flex: 1,
  },
  operatingHoursText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
  },
  breakTimeText: {
    fontSize: 14,
    color: '#999',
    marginTop: 3,
  },
  closedText: {
    fontSize: 16,
    color: ColorUtil.chipText,
    fontFamily: 'Pretendard-Medium',
    flex: 1,
  },
  toggleButton: {
    alignSelf: 'flex-end',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
    marginTop: 5,
    marginHorizontal: 18,
  },
});

export default OperatingHoursPreview;
