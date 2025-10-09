import React, {useMemo, useState, useLayoutEffect, useEffect} from 'react';
import {
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
    id: 'o-1',
    status: '신규접수',
    storeName: '친구포차 본점',
    reservationTime: '오늘 19:30',
    people: 2,
    itemsSummary: '모둠꼬치 외 2개',
    receivedAt: '19:05',
    thumbnail:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'o-2',
    status: '접수완료',
    storeName: '친구포차 2호점',
    reservationTime: '오늘 18:00',
    people: 4,
    itemsSummary: '모둠튀김 외 3개',
    receiptNo: 37,
    thumbnail:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'o-3',
    status: '결제 완료',
    storeName: '친구포차 본점',
    reservationTime: '2025-09-24 12:30',
    people: 2,
    itemsSummary: '떡볶이 외 1개',
    receiptNo: 12,
    thumbnail:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'o-4',
    status: '접수 취소',
    storeName: '친구포차 2호점',
    reservationTime: '2025-09-20 18:30',
    people: 1,
    itemsSummary: '돈코츠라멘',
    cancelReason: '사용자 요청으로 취소',
    thumbnail:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
  },
];

const OWNER_STORES = [
  {id: 's-1', name: '친구포차 본점'},
  {id: 's-2', name: '친구포차 2호점'},
  {id: 's-3', name: '친구포차 3호점'},
];

const TABS = ['신규접수', '접수완료', '결제 완료', '접수 취소'];

const OrderOwnerScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    if (!selectedStore && OWNER_STORES.length > 0)
      setSelectedStore(OWNER_STORES[0]);
  }, [selectedStore]);

  useLayoutEffect(() => {
    if (selectedStore)
      navigation?.setOptions?.({title: `${selectedStore.name} 주문`});
  }, [navigation, selectedStore]);

  const filtered = useMemo(() => {
    const key = TABS[activeTab];
    let list = DUMMY_ORDERS.filter(o => o.status === key);
    if (selectedStore)
      list = list.filter(o => o.storeName === selectedStore.name);
    return list;
  }, [activeTab, selectedStore]);

  const renderItem = ({item}) => <OrderCard order={item} />;

  const Header = () => (
    <View>
      <View style={styles.storesHeaderRow}>
        <Text style={styles.storesHeaderText}>나의 매장</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storesScroll}>
        {OWNER_STORES.map(s => {
          const selected = selectedStore?.id === s.id;
          return (
            <Pressable
              key={s.id}
              onPress={() => setSelectedStore(s)}
              style={[styles.storeChip, selected && styles.storeChipActive]}
              hitSlop={8}>
              <Ionicons
                name="business-outline"
                size={14}
                color={selected ? '#fff' : '#6B7280'}
                style={{marginRight: 6}}
              />
              <Text
                style={[
                  styles.storeChipText,
                  selected && styles.storeChipTextActive,
                ]}>
                {s.name}
              </Text>
              {selected && (
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#10B981"
                  style={{marginLeft: 6}}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

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
                <Text
                  style={[styles.tabText, selected && styles.tabTextActive]}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );

  return (
    <FlatList
      data={filtered}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={Header}
      ListEmptyComponent={() => (
        <Text style={styles.emptyText}>표시할 주문이 없습니다</Text>
      )}
      contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 32}}
    />
  );
};

const OrderCard = ({order}) => {
  const isPending = order.status === '신규접수';
  const isAccepted = order.status === '접수완료';
  const isPaid = order.status === '결제 완료';
  const isCanceled = order.status === '접수 취소';

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.reservationText} numberOfLines={1}>
          예약 {order.reservationTime} · 인원 {order.people}명
        </Text>
        <Pressable hitSlop={8} style={styles.detailBtn}>
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

      {isPaid && (
        <View style={styles.reviewBox}>
          <Text style={styles.reviewTitle}>결제 완료</Text>
          <View style={styles.starsRow}>
            <Ionicons name="card" size={18} color="#9CA3AF" />
            <Text style={styles.inlineBadgeText}>
              주문이 정상적으로 결제되었습니다
            </Text>
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
  storesHeaderRow: {paddingHorizontal: 16, paddingTop: 6},
  storesHeaderText: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#374151',
    fontSize: 13,
  },
  storesScroll: {paddingHorizontal: 16, paddingTop: 8},
  storeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    backgroundColor: '#fff',
  },
  storeChipActive: {backgroundColor: '#111827', borderColor: '#111827'},
  storeChipText: {
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
    fontSize: 13,
  },
  storeChipTextActive: {color: '#fff', fontFamily: 'Pretendard-SemiBold'},
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

export default OrderOwnerScreen;
