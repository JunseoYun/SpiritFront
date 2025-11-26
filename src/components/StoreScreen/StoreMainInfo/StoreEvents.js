import React, {useCallback, useMemo} from 'react';
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
import CustomText from '../../../utils/CustomText';

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

  if (s?.monthDay && e?.monthDay && s.monthDay !== e.monthDay) {
    return `${s.monthDay} ~ ${e.monthDay}`;
  }

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
const isEventActive = endAt => {
  if (!endAt) return true;
  const end = new Date(endAt);
  if (Number.isNaN(end.getTime())) return true;
  return end.getTime() >= Date.now();
};

const StoreEvents = ({
  events = [],
  navigation,
  storeName,
  fullView = false,
}) => {
  const activeEvents = useMemo(
    () =>
      (Array.isArray(events) ? events : []).filter(item =>
        isEventActive(item?.endAt),
      ),
    [events],
  );

  const sorted = useMemo(
    () =>
      [...activeEvents].sort(
        (a, b) => new Date(a.startAt) - new Date(b.startAt),
      ),
    [activeEvents],
  );

  const openViewer = uri => {
    if (!uri || !navigation) return;
    navigation.navigate('ImageViewerScreen', {
      images: [uri],
      index: 0,
    });
  };

  const handleCardPress = useCallback(() => {
    if (fullView) return;
    if (!navigation?.navigate) return;
    navigation.navigate('StoreEventsScreen', {
      events: sorted,
      storeName,
    });
  }, [fullView, navigation, sorted, storeName]);

  const renderEventItem = ({item}) => {
    const img = item?.eventImageUrl || item?.imageUrl || item?.imgUrl;

    return (
      <Pressable
        style={styles.card}
        onPress={fullView ? undefined : handleCardPress}>
        <View style={styles.row}>
          {img ? (
            <Pressable
              style={styles.imageBox}
              onPress={e => {
                e?.stopPropagation?.();
                openViewer(img);
              }}>
              <FastImage source={{uri: img}} style={styles.image} />
            </Pressable>
          ) : (
            <View style={styles.imageBox}>
              <FastImage
                source={require('../../../assets/default_event.png')}
                style={[styles.image, styles.defaultImage]}
              />
            </View>
          )}

          <View style={styles.infoView}>
            <CustomText numberOfLines={1} style={styles.title}>
              {item?.title || '이벤트'}
            </CustomText>

            {!!item?.content && (
              <CustomText numberOfLines={1} style={styles.content}>
                {item.content}
              </CustomText>
            )}

            <CustomText style={styles.dateTag}>
              {formatEventPeriod(item?.startAt, item?.endAt)}
            </CustomText>
          </View>
        </View>
      </Pressable>
    );
  };

  const listProps = fullView
    ? {
        horizontal: false,
        showsVerticalScrollIndicator: false,
      }
    : {
        horizontal: true,
        showsHorizontalScrollIndicator: false,
        pagingEnabled: true,
        snapToInterval: CARD_WIDTH + 5,
        decelerationRate: 'fast',
      };

  if (sorted.length === 0) {
    return null;
  }

  return (
    <FlatList
      data={sorted}
      keyExtractor={item =>
        item.id?.toString() || `${item.title}-${item.startAt}`
      }
      renderItem={renderEventItem}
      {...listProps}
      contentContainerStyle={[
        styles.carouselContent,
        fullView && styles.fullListContent,
      ]}
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
  fullListContent: {
    paddingBottom: 24,
  },

  card: {
    width: CARD_WIDTH,
    height: 72,
    // paddingHorizontal: 16,
    // paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: ColorUtil.border,
    justifyContent: 'center',

    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  imageBox: {
    width: 72,
    height: 72,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F7',
  },

  image: {
    width: '100%',
    height: '100%',
  },
  defaultImage: {
    width: '55%',
    height: '55%',
  },
  infoView: {
    flex: 1,
    justifyContent: 'center',

    marginLeft: 12,
    paddingVertical: 1,
  },

  title: {
    fontSize: 15,
    fontFamily: 'Pretendard-SemiBold',
    color: '#333',
    // marginBottom: 3.5,
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
    fontFamily: 'Pretendard-SemiBold',
    color: ColorUtil.subText,
  },
});

export default StoreEvents;
