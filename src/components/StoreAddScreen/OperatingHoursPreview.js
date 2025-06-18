import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

const OperatingHoursPreview = ({
  is24Hours,
  operatingHours,
  breakingHours,
  closedDay,
  storeTimeHandle,
  error,
  index,
}) => {
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
      <View style={styles.storeinputview}>
        <Text style={styles.storeinputtext}>
          {index ? '영업시간*' : '영업시간'}
        </Text>
        <Pressable onPress={storeTimeHandle}>
          <Text style={[styles.storeinputtext, {color: '#16BBFF'}]}>편집</Text>
        </Pressable>
      </View>

      {/* 영업 시간 설정 전 */}
      {!hasValidOperatingHours && (
        <Pressable style={styles.emptyContainer} onPress={storeTimeHandle}>
          <Text style={styles.emptyText}>영업 시간을 설정하세요</Text>
        </Pressable>
      )}

      {/* ⏳ 유효한 영업 시간이 있을 때만 표시 */}
      {hasValidOperatingHours && is24Hours && (
        <Pressable style={styles.emptyContainer} onPress={storeTimeHandle}>
          <Text style={styles.allDayText}>24시간 영업</Text>
        </Pressable>
      )}
      {hasValidOperatingHours && !is24Hours && (
        <Pressable
          onPress={storeTimeHandle}
          style={styles.operatingHoursContainer}>
          {Object.entries(operatingHours).map(
            (
              [day, {openHour, openMinute, closedHour, closedMinute}],
              index,
            ) => {
              const koreanDay = dayMapping[day];
              const isClosed = closedDay.includes(day.toUpperCase());
              const breakTime = breakingHours[day];

              return (
                <View key={day} style={styles.dayRow}>
                  <View
                    style={[styles.dayChip, isClosed && styles.closedDayChip]}>
                    <Text style={[styles.dayText]}>{koreanDay}</Text>
                  </View>
                  {isClosed ? (
                    <Text style={styles.closedText}>휴무</Text>
                  ) : (
                    <View style={styles.timeContainer}>
                      <Text style={styles.operatingHoursText}>
                        {`${openHour.padStart(2, '0')}:${openMinute.padStart(
                          2,
                          '0',
                        )} ~ `}
                        <Text>
                          {closedHour >= 24
                            ? `다음날 ${String(closedHour - 24).padStart(
                                2,
                                '0',
                              )}`
                            : String(closedHour).padStart(2, '0')}
                        </Text>
                        :{closedMinute.padStart(2, '0')}
                      </Text>
                      {breakTime?.startHour && breakTime?.endHour && (
                        <Text style={styles.breakTimeText}>
                          {`브레이크타임 ${breakTime.startHour.padStart(
                            2,
                            '0',
                          )}:${breakTime.startMinute.padStart(2, '0')} ~ `}
                          <Text>
                            {breakTime.endHour >= 24
                              ? `다음날 ${String(
                                  breakTime.endHour - 24,
                                ).padStart(2, '0')}`
                              : String(breakTime.endHour).padStart(2, '0')}
                          </Text>
                          :{breakTime.endMinute.padStart(2, '0')}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              );
            },
          )}
        </Pressable>
      )}
      {!hasValidOperatingHours && !is24Hours && error === 'StoreOperate' && (
        <Text style={styles.errorMessage}>매장 영업 시간을 등록해 주세요.</Text>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 50,
    marginHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  storeinputtext: {
    fontFamily: 'Pretendard-Medium',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  editButton: {
    fontSize: 15,
    color: '#45C9FF',
    fontFamily: 'Pretendard-Medium',
  },
  emptyContainer: {
    backgroundColor: '#F7F8FA',
    padding: 15,
    marginHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
    fontFamily: 'Pretendard-Medium',
  },
  operatingHoursContainer: {
    marginHorizontal: 20,
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
    backgroundColor: '#45C9FF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
    marginRight: 10,
  },
  closedDayChip: {
    backgroundColor: '#D0D0D0', // 휴무일 배경 색상 변경
  },
  dayText: {
    fontSize: 14,
    color: '#fff',
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
    fontSize: 15,
    color: '#4b4b4b',
    fontFamily: 'Pretendard-SemiBold',
    flex: 1,
  },

  allDayText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#45C9FF',
    textAlign: 'center',
    paddingVertical: 10,
  },
  toggleButton: {
    alignSelf: 'flex-end',
  },
  errorMessage: {
    color: '#FF4816',
    fontSize: 15,
    marginTop: 5,
    marginHorizontal: 18,
  },
});

export default OperatingHoursPreview;
