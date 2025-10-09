import React, {useMemo, useState, useLayoutEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Image,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

const DUMMY_ORDERS = [
  {
    id: 'u-1',
    status: '접수중',
    storeName: '친구포차 본점',
    reservationTime: '오늘 20:00',
    people: 2,
    itemsSummary: '모듬꼬치 외 1개',
    receivedAt: '19:45',
    thumbnail:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'u-2',
    status: '접수완료',
    storeName: '친구포차 2호점',
    reservationTime: '오늘 18:30',
    people: 3,
    itemsSummary: '튀김 모듬',
    receivedAt: '21:30',
    receiptNo: 12,
    thumbnail:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'u-3',
    status: '방문완료',
    storeName: '분식당 미소',
    reservationTime: '2025-09-25 18:30',
    people: 2,
    itemsSummary: '라면 외 1개',
    receiptNo: 9,
    receivedAt: '18:00',
    thumbnail:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'u-4',
    status: '접수 취소',
    storeName: '친구포차 본점',
    reservationTime: '2025-09-20 18:30',
    people: 1,
    itemsSummary: '돈코츠라멘',
    cancelReason: '사용자 요청으로 취소',
    receivedAt: '15:00',
    thumbnail:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
  },
];

const TABS = ['접수중', '접수완료', '방문완료', '접수 취소'];

const OrderUserScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState(0);

  useLayoutEffect(() => {
    navigation?.setOptions?.({title: '나의 주문내역'});
  }, [navigation]);

  const filtered = useMemo(() => {
    const key = TABS[activeTab];
    return DUMMY_ORDERS.filter(o => o.status === key);
  }, [activeTab]);

  const renderItem = ({item}) => (
    <OrderCard
      order={item}
      onPressDetail={() =>
        navigation.navigate('OrderDetailScreen', {order: item})
      }
    />
  );

  const HeaderTabs = () => (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsScroll}>
      <View style={styles.tabsRow}>
        {TABS.map((label, idx) => {
          const selected = idx === activeTab;
          return (
            <Pressable
              key={label}
              onPress={() => setActiveTab(idx)}
              style={[styles.tab, selected && styles.tabActive]}
              hitSlop={8}>
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={HeaderTabs}
      ListEmptyComponent={() => (
        <Text style={styles.emptyText}>표시할 주문이 없습니다</Text>
      )}
      contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 32}}
    />
  );
};

const OrderCard = ({order, onPressDetail}) => {
  const isPending = order.status === '접수중';
  const isAccepted = order.status === '접수완료';
  const isVisited = order.status === '방문완료';
  const isCanceled = order.status === '접수 취소';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.reservationText} numberOfLines={1}>
          예약 {order.reservationTime} · 인원 {order.people}명
        </Text>
        <Pressable hitSlop={8} style={styles.detailBtn} onPress={onPressDetail}>
          <Text style={styles.detailBtnText}>주문 상세</Text>
          <Feather name={'chevron-right'} size={15} color="#333" />
        </Pressable>
      </View>

      <View style={styles.cardHeader}>
        <Image source={{uri: order.thumbnail}} style={styles.thumb} />
        <View style={{flex: 1}}>
          <Text style={styles.storeName}>{order.storeName}</Text>
          <Text style={styles.subText} numberOfLines={1}>
            {order.itemsSummary}
          </Text>
        </View>
      </View>

      {isPending && (
        <View style={styles.rowBetween}>
          <View style={styles.inlineBadge}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.inlineBadgeText}>접수 {order.receivedAt}</Text>
          </View>
          <Pressable style={styles.ghostBtn} hitSlop={8}>
            <Text style={styles.ghostBtnText}>주문 취소</Text>
          </Pressable>
        </View>
      )}

      {isAccepted && (
        <View style={styles.receiptBox}>
          <Text style={styles.receiptText}>접수번호 {order.receiptNo}</Text>
        </View>
      )}

      {isVisited && (
        <View style={styles.reviewBox}>
          <Text style={styles.reviewTitle}>별점으로 평가해주세요</Text>
          <View style={styles.starsRow}>
            {[0, 1, 2, 3, 4].map(i => (
              <Ionicons key={i} name="star" size={18} color="#D1D5DB" />
            ))}
          </View>
        </View>
      )}

      {isCanceled && (
        <View style={styles.cancelBox}>
          <Ionicons name="close-circle" size={16} color="#EF4444" />
          <Text style={styles.cancelText} numberOfLines={2}>
            취소 사유 · {order.cancelReason}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  tabsScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tabsRow: {flexDirection: 'row', gap: 8},
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  tabActive: {backgroundColor: '#111827', borderColor: '#111827'},
  tabText: {fontFamily: 'Pretendard-Medium', color: '#6B7280', fontSize: 13},
  tabTextActive: {color: '#fff'},
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    color: '#c0c0c0',
    fontFamily: 'Pretendard-Medium',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
  },
  topRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 8},
  reservationText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    color: '#6B7280',
    flex: 1,
    marginRight: 8,
  },
  detailBtn: {
    flexDirection: 'row',
    paddingHorizontal: 4,
    paddingVertical: 4,
    alignItems: 'center',
  },
  detailBtnText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 12,
    color: '#374151',
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  thumb: {width: 56, height: 56, borderRadius: 10, backgroundColor: '#F3F4F6'},
  storeName: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  subText: {fontFamily: 'Pretendard-Medium', fontSize: 12, color: '#6B7280'},
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineBadge: {flexDirection: 'row', alignItems: 'center', gap: 6},
  inlineBadgeText: {
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
    fontSize: 12,
  },
  ghostBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  ghostBtnText: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#EF4444',
    fontSize: 12,
  },
  reviewBox: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginTop: 4,
    alignItems: 'center',
  },
  reviewTitle: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 14,
    color: '#111827',
    marginBottom: 8,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  receiptBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 10,
    marginTop: 8,
  },
  receiptText: {fontFamily: 'Pretendard-Bold', color: '#111827', fontSize: 13},
  cancelBox: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
    marginTop: 4,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    color: '#9CA3AF',
    flex: 1,
  },
});

export default OrderUserScreen;
