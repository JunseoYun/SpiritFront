import React from 'react';
import {StyleSheet, View, Text, Image, Pressable} from 'react-native';
import FastImage from 'react-native-fast-image';
import CustomText from '../../../utils/CustomText';

const formatEventPeriod = (start, end) => {
  const normalize = value => {
    if (!value) {
      return null;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    const mm = `${date.getMonth() + 1}`.padStart(2, '0');
    const dd = `${date.getDate()}`.padStart(2, '0');
    const hh = `${date.getHours()}`.padStart(2, '0');
    const mi = `${date.getMinutes()}`.padStart(2, '0');
    return {
      full: `${mm}.${dd} ${hh}:${mi}`,
      monthDay: `${mm}.${dd}`,
      hh,
      mi,
    };
  };

  const startInfo = normalize(start);
  const endInfo = normalize(end);

  if (!startInfo && !endInfo) {
    return '일정 미정';
  }

  if (startInfo && endInfo && startInfo.monthDay === endInfo.monthDay) {
    const fullDay =
      startInfo.hh === '00' &&
      startInfo.mi === '00' &&
      endInfo.hh === '23' &&
      endInfo.mi === '59';
    if (fullDay) {
      return startInfo.monthDay;
    }
    return `${startInfo.full} ~ ${endInfo.hh}:${endInfo.mi}`;
  }

  if (startInfo && endInfo && startInfo.monthDay !== endInfo.monthDay) {
    return `${startInfo.monthDay} ~ ${endInfo.monthDay}`;
  }

  if (startInfo && endInfo) {
    return `${startInfo.full} ~ ${endInfo.full}`;
  }
  if (startInfo) {
    return `${startInfo.full} ~`;
  }
  return `~ ${endInfo.full}`;
};

const isEventEnded = endAt => {
  if (!endAt) {
    return false;
  }
  const end = new Date(endAt);
  if (Number.isNaN(end.getTime())) {
    return false;
  }
  return end.getTime() < Date.now();
};

const StoreEventSection = ({
  title,
  events = [],
  loading = false,
  type,
  onEditEvent,
  onDeleteEvent,
  navigation,
}) => {
  const hasEvents = Array.isArray(events) && events.length > 0;
  const sortedEvents = hasEvents
    ? [...events].sort((a, b) => {
        const parseStart = value => {
          if (!value) {
            return null;
          }
          const date = new Date(value);
          return Number.isNaN(date.getTime()) ? null : date.getTime();
        };
        const aStart = parseStart(a?.startAt);
        const bStart = parseStart(b?.startAt);

        if (aStart === null && bStart === null) {
          return 0;
        }
        if (aStart === null) {
          return 1;
        }
        if (bStart === null) {
          return -1;
        }

        return aStart - bStart;
      })
    : [];

  const openViewer = uri => {
    if (!uri || !navigation?.navigate) return;
    navigation.navigate('ImageViewerScreen', {
      images: [uri],
      index: 0,
    });
  };

  return (
    <>
      {type !== 'update' && (
        <>
          <CustomText style={styles.label}>{title}</CustomText>
        </>
      )}
      {!loading && hasEvents && (
        <View
          style={[
            styles.eventList,
            type === 'update' && styles.updateEventList,
          ]}>
          {sortedEvents.map(item => {
            const imageUri =
              item?.eventImageUrl || item?.imageUrl || item?.imgUrl || '';
            const showActions = type === 'update';
            const ended = isEventEnded(item?.endAt);
            return (
              <View
                key={item?.id?.toString() || `${item?.title}-${item?.startAt}`}
                style={styles.eventCard}>
                <View style={styles.eventRow}>
                  <View style={styles.eventInfo}>
                    <CustomText
                      style={[
                        styles.eventTitle,
                        ended && styles.eventEndedText,
                      ]}>
                      {item?.title || '이벤트'}
                    </CustomText>
                    {!!item?.content && (
                      <CustomText
                        style={[
                          styles.eventContent,
                          ended && styles.eventEndedText,
                        ]}>
                        {item.content}
                      </CustomText>
                    )}
                    <View style={styles.eventPeriodRow}>
                      <CustomText
                        style={[
                          styles.eventPeriod,
                          ended && styles.eventEndedText,
                        ]}>
                        {formatEventPeriod(item?.startAt, item?.endAt)}
                      </CustomText>
                      {ended ? (
                        <CustomText
                          style={[styles.eventPeriod, styles.eventEndedLabel]}>
                          종료된 이벤트
                        </CustomText>
                      ) : null}
                    </View>
                  </View>
                  {imageUri ? (
                    <Pressable onPress={() => openViewer(imageUri)}>
                      <FastImage
                        source={{uri: imageUri}}
                        style={[
                          styles.eventImage,
                          ended && styles.eventImageEnded,
                        ]}
                      />
                    </Pressable>
                  ) : null}
                </View>
                {showActions && (
                  <View style={styles.actionRow}>
                    <Pressable
                      style={[styles.actionButton]}
                      onPress={() => onEditEvent?.(item)}>
                      <CustomText style={styles.actionText}>수정</CustomText>
                    </Pressable>
                    <Pressable
                      style={[styles.actionButton]}
                      onPress={() => onDeleteEvent?.(item)}>
                      <CustomText
                        style={[styles.actionText, styles.deleteText]}>
                        삭제
                      </CustomText>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {!loading && !hasEvents && (
        <CustomText style={styles.text}>등록된 정보가 없습니다.</CustomText>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  label: {
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    fontSize: 18,
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 10,
  },
  text: {
    marginHorizontal: 18,
    color: '#333',
    fontSize: 15,
    marginBottom: 10,
  },

  eventList: {
    marginHorizontal: 18,
    gap: 12,
    marginBottom: 20,
  },
  updateEventList: {
    marginHorizontal: 18,
    gap: 12,
    marginTop: 30,
    marginBottom: 0,
  },
  eventCard: {
    borderWidth: 1,
    borderColor: '#E6EBF2',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FFF',
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventImage: {
    width: 68,
    height: 68,
    borderRadius: 10,
    marginLeft: 14,
    backgroundColor: '#E9EEF5',
  },
  eventImageEnded: {
    opacity: 0.45,
  },

  placeholderText: {
    fontSize: 11,
    color: '#7B8A9B',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    color: '#333',
  },
  eventContent: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#1F2933',
    lineHeight: 20,
    marginTop: 5,
  },
  eventPeriod: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 12,
    color: '#4B5563',
    marginTop: 0,
  },
  eventPeriodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
    marginHorizontal: 0.1,
  },
  eventEndedLabel: {
    color: '#CCC',
    marginTop: 0,
  },
  eventEndedText: {
    color: '#CCC',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 15,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 18,
    marginRight: 8,

    backgroundColor: '#F5F6F7',
    borderWidth: 1,
    borderColor: '#ECECEC',
  },
  actionText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Medium',
    color: '#444',
  },
});

export default StoreEventSection;
