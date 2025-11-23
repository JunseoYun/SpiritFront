import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Dimensions,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import ColorUtil from '../../../utils/ColorUtil';

const {width: SCREEN_WIDTH} = Dimensions.get('window');

/* ===============================================
   날짜 포맷 동일
=============================================== */
const formatEventPeriod = (start, end) => {
  const fmt = v => {
    if (!v) return '';
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;

    const mm = `${d.getMonth() + 1}`.padStart(2, '0');
    const dd = `${d.getDate()}`.padStart(2, '0');
    const hh = `${d.getHours()}`.padStart(2, '0');
    const mi = `${d.getMinutes()}`.padStart(2, '0');

    return {
      monthDay: `${mm}.${dd}`,
      label: `${mm}.${dd} ${hh}:${mi}`,
      hh,
      mi,
    };
  };

  const s = fmt(start);
  const e = fmt(end);

  if (!s.label && !e.label) return '일정 미정';

  if (s.monthDay === e.monthDay && s.label && e.label) {
    const full =
      s.hh === '00' && s.mi === '00' && e.hh === '23' && e.mi === '59';
    if (full) return s.monthDay;
    return `${s.label} ~ ${e.hh}:${e.mi}`;
  }

  return `${s.label || ''} ~ ${e.label || ''}`;
};

const CARD_WIDTH = SCREEN_WIDTH - 32;

/* ===============================================
   메인 컴포넌트
=============================================== */
const StoreEvents = ({events = [], navigation}) => {
  const sorted = [...events].sort(
    (a, b) => new Date(a.startAt) - new Date(b.startAt),
  );

  const openViewer = uri => {
    if (!uri || !navigation) return;
    navigation.navigate('ImageViewerScreen', {
      images: [uri],
      index: 0,
    });
  };

  const renderEventItem = ({item}) => {
    const img = item?.eventImageUrl || item?.imageUrl || item?.imgUrl;

    return (
      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.infoView}>
            <Text numberOfLines={1} style={styles.title}>
              {item?.title || '이벤트'}
            </Text>

            {!!item?.content && (
              <Text numberOfLines={2} style={styles.content}>
                {item.content}
              </Text>
            )}

            <Text style={styles.dateTag}>
              {formatEventPeriod(item?.startAt, item?.endAt)}
            </Text>
          </View>
          {img && (
            <Pressable style={styles.imageBox} onPress={() => openViewer(img)}>
              <FastImage source={{uri: img}} style={styles.image} />
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <FlatList
      data={sorted}
      keyExtractor={item =>
        item.id?.toString() || `${item.title}-${item.startAt}`
      }
      renderItem={renderEventItem}
      horizontal
      showsHorizontalScrollIndicator={false}
      pagingEnabled
      snapToInterval={CARD_WIDTH + 5}
      decelerationRate="fast"
      contentContainerStyle={styles.carouselContent}
    />
  );
};

/* ===============================================
   STYLE
=============================================== */
const styles = StyleSheet.create({
  carouselContent: {
    paddingHorizontal: 16,
    gap: 5,
    marginTop: 7,
    marginBottom: 12,
  },

  card: {
    width: CARD_WIDTH,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: '#F7FBFF',
    borderWidth: 1,
    borderColor: 'rgba(60,187,255,0.22)',
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageBox: {
    width: 72,
    height: 72,
    marginLeft: 12,
    borderRadius: 9,
    overflow: 'hidden',
    borderWidth: 0.6,
    borderColor: ColorUtil.border,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  infoView: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#007AD9',
    marginBottom: 3.5,
  },

  content: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: 'Pretendard-Regular',
    color: '#333',
    marginBottom: 6,
  },

  dateTag: {
    fontSize: 12,
    fontFamily: 'Pretendard-Bold',
    color: '#0A7DD7',
  },
});

export default StoreEvents;
