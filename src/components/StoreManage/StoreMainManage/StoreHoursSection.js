import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import CustomText from '../../common/CustomText';

const daysKor = {
  MONDAY: '월요일',
  TUESDAY: '화요일',
  WEDNESDAY: '수요일',
  THURSDAY: '목요일',
  FRIDAY: '금요일',
  SATURDAY: '토요일',
  SUNDAY: '일요일',
};

const getOperationDisplay = item => {
  if (item.isClosed) {
    return {isClosed: true, mainRange: '휴무', breakRange: null};
  }

  const formatTime = time => (time ? time.slice(0, 5) : '-');
  const open = formatTime(item.openTime);
  const close = formatTime(item.closeTime);
  const breakStart = formatTime(item.breakStartTime);
  const breakEnd = formatTime(item.breakEndTime);

  const toHour = t => {
    if (!t) return 0;
    const [h, m] = t.split(':').map(Number);
    return h + m / 60;
  };

  const openHour = toHour(item.openTime);
  const closeHour = toHour(item.closeTime);
  const breakStartHour = toHour(item.breakStartTime);
  const breakEndHour = toHour(item.breakEndTime);

  const closeNextDay = closeHour < openHour && item.closeTime;
  const breakNextDay = item.breakEndTime && breakEndHour < breakStartHour;

  const closeLabel = closeNextDay ? `다음날 ${close}` : close;
  const breakEndLabel = breakNextDay ? `다음날 ${breakEnd}` : breakEnd;

  return {
    isClosed: false,
    mainRange: `${open} ~ ${closeLabel}`,
    breakRange:
      item.breakStartTime && item.breakEndTime
        ? `${breakStart} ~ ${breakEndLabel}`
        : null,
  };
};

const StoreHoursSection = ({title, operationInfo = [], isAlwaysOpen}) => {
  return (
    <>
      <View style={styles.divider} />
      <CustomText style={styles.label}>{title}</CustomText>
      {isAlwaysOpen ? (
        <View style={styles.hoursBadge}>
          <CustomText style={styles.hoursBadgeText}>24시간 영업</CustomText>
        </View>
      ) : (
        <View style={styles.card}>
          {operationInfo.length > 0 ? (
            operationInfo.map((item, index) => {
              const {isClosed, mainRange, breakRange} =
                getOperationDisplay(item);
              return (
                <View
                  key={item.dayOfWeek}
                  style={[styles.row, index !== 0 && styles.rowDivider]}>
                  <CustomText
                    maxScale={1.25}
                    style={[styles.dayText, isClosed && styles.dayClosedText]}>
                    {daysKor[item.dayOfWeek]}
                  </CustomText>
                  <View style={styles.content}>
                    {isClosed ? (
                      <View style={styles.tag}>
                        <CustomText
                          style={[styles.tagText, styles.tagClosedText]}>
                          휴무
                        </CustomText>
                      </View>
                    ) : (
                      <>
                        <View
                          style={[
                            styles.timeLine,
                            !breakRange && styles.timeLineCompact,
                          ]}>
                          <CustomText style={styles.timeText}>
                            {mainRange}
                          </CustomText>
                        </View>
                        {breakRange && (
                          <View style={[styles.timeLine, styles.timeLineLast]}>
                            <View style={styles.tag}>
                              <CustomText style={styles.tagText}>
                                브레이크
                              </CustomText>
                            </View>
                            <CustomText style={styles.timeText}>
                              {breakRange}
                            </CustomText>
                          </View>
                        )}
                      </>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <CustomText style={styles.emptyText}>
              등록된 정보가 없습니다.
            </CustomText>
          )}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: '#EFEFEF',
    height: 1,
    marginHorizontal: 16,
    marginVertical: 30,
  },
  label: {
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    fontSize: 18,
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginHorizontal: 18,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#E6EBF2',
    marginBottom: 20,
  },
  hoursBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0FAFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    marginBottom: 20,
    marginHorizontal: 18,
  },
  hoursBadgeText: {
    fontSize: 12,
    fontFamily: 'Pretendard-SemiBold',
    color: '#2C8ACF',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  rowDivider: {
    borderTopWidth: 1,
    borderTopColor: '#F2F4F6',
  },
  dayText: {
    width: 50,
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#2C2C2C',
  },
  dayClosedText: {
    color: '#B4BCC6',
  },
  content: {
    flex: 1,
    marginLeft: 24,
    alignItems: 'flex-end',
  },
  timeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  timeLineCompact: {
    marginBottom: 0,
  },
  timeLineLast: {
    marginBottom: 0,
  },
  tag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F4F7FB',
    marginRight: 10,
  },
  tagText: {
    fontSize: 12,
    fontFamily: 'Pretendard-SemiBold',
    color: '#4C6071',
  },
  tagClosedText: {
    color: '#B4BCC6',
  },
  timeText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#1F2329',
  },
  emptyText: {
    textAlign: 'center',
    color: '#A2ABB6',
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    paddingVertical: 20,
  },
});

export default StoreHoursSection;
