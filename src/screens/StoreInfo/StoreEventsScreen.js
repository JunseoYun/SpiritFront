import React from 'react';
import {View, Text, StyleSheet, ScrollView, Pressable} from 'react-native';
import FastImage from 'react-native-fast-image';
import ColorUtil from '../../utils/ColorUtil';
import CustomText from '../../utils/CustomText';

const StoreEventsScreen = ({route, navigation}) => {
  const events = route?.params?.events ?? [];

  if (events.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <CustomText style={styles.emptyText}>
          등록된 이벤트가 없어요.
        </CustomText>
      </View>
    );
  }

  const openViewer = uri => {
    if (!uri) return;
    navigation?.navigate?.('ImageViewerScreen', {
      images: [uri],
      index: 0,
    });
  };

  const renderEventCard = event => {
    const img = event?.eventImageUrl || event?.imageUrl || event?.imgUrl;
    return (
      <View
        key={event.id?.toString() || `${event.title}-${event.startAt}`}
        style={styles.card}>
        <Pressable
          style={styles.thumbBox}
          onPress={() => {
            if (!img) return;
            openViewer(img);
          }}>
          {img ? (
            <FastImage source={{uri: img}} style={styles.thumbImage} />
          ) : (
            <FastImage
              source={require('../../assets/default_event.png')}
              style={styles.thumbPlaceholder}
              resizeMode="contain"
            />
          )}
        </Pressable>
        <View style={styles.infoBox}>
          <CustomText style={styles.title}>{event.title}</CustomText>
          {!!event?.content && (
            <CustomText style={styles.content}>{event.content}</CustomText>
          )}
          <CustomText style={styles.date}>
            {formatEventPeriod(event.startAt, event.endAt)}
          </CustomText>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {events.map(renderEventCard)}
      </ScrollView>
    </View>
  );
};

const formatEventPeriod = (start, end) => {
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s) || isNaN(e)) return '';

  const sm = String(s.getMonth() + 1).padStart(2, '0');
  const sd = String(s.getDate()).padStart(2, '0');
  const em = String(e.getMonth() + 1).padStart(2, '0');
  const ed = String(e.getDate()).padStart(2, '0');

  if (sm === em && sd === ed) return `${sm}.${sd}`;
  return `${sm}.${sd} ~ ${em}.${ed}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },

  scroll: {
    padding: 16,
    paddingBottom: 40,
  },

  /* 카드 */
  card: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 0.8,
    borderColor: '#E5E7EB',
    // 텍스트가 길어져도 자연스럽게 카드 높이가 늘어남
    alignItems: 'flex-start',
  },

  thumbBox: {
    width: 86,
    height: 86,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F2F4F7',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  thumbPlaceholder: {
    width: '60%',
    height: '60%',
  },

  /* 텍스트 영역 확장 */
  infoBox: {
    flex: 1,
  },

  title: {
    fontSize: 16,
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    marginBottom: 4,
  },

  date: {
    fontSize: 13,
    color: ColorUtil.subText,
    marginTop: 6,
    fontFamily: 'Pretendard-SemiBold',
  },

  content: {
    fontSize: 14,
    color: '#333',
    lineHeight: 19,
    fontFamily: 'Pretendard-Regular',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },

  emptyText: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: ColorUtil.subText,
  },
});

export default StoreEventsScreen;
