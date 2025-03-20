import React, {useState} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

import Entypo from 'react-native-vector-icons/Entypo';

const OperatingHoursPreview = ({
  is24Hours,
  operatingHours,
  breakingHours,
  closedDay,
  storeTimeHandle,
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

  const [isExpanded, setIsExpanded] = useState(true);

  // ⏳ 영업 시간이 하나라도 비어있으면 표시 안 함
  const hasValidOperatingHours = Object.values(operatingHours).some(
    ({openHour, openMinute, closedHour, closedMinute}) =>
      openHour && openMinute && closedHour && closedMinute,
  );

  return (
    <>
      <View style={styles.storeinputview}>
        <Text style={styles.storeinputtext}>영업 시간</Text>
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
          {Object.entries(operatingHours)
            .filter(([day]) => isExpanded || day === 'Monday') // 펼친 경우 전체, 접힌 경우 월요일만
            .map(
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
                      style={[
                        styles.dayChip,
                        isClosed && styles.closedDayChip,
                      ]}>
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
                    {index === 0 && (
                      <Pressable
                        onPress={() => setIsExpanded(!isExpanded)}
                        style={styles.toggleButton}>
                        <Entypo
                          name={
                            isExpanded
                              ? 'chevron-small-up'
                              : 'chevron-small-down'
                          }
                          size={25}
                          color="#5F5F5F"
                        />
                      </Pressable>
                    )}
                  </View>
                );
              },
            )}
        </Pressable>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  storeinputtext: {
    fontWeight: '500',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  editButton: {
    fontSize: 15,
    color: '#16BBFF',
    fontWeight: '500',
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
    backgroundColor: '#16BBFF',
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
    fontWeight: '600',
  },

  timeContainer: {
    flex: 1,
  },
  operatingHoursText: {
    fontSize: 16,
    fontWeight: '500',
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
    fontWeight: '500',
    flex: 1,
  },
  nextDayHighlight: {
    color: '#FF5733', // 강조 색상
    fontWeight: '600',
  },
  allDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16BBFF',
    textAlign: 'center',
    paddingVertical: 10,
  },
  toggleButton: {
    alignSelf: 'flex-end',
  },
});

export default OperatingHoursPreview;
