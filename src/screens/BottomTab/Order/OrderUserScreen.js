import React, {useMemo, useState, useLayoutEffect, useRef} from 'react';
import {StyleSheet, Text, View, FlatList} from 'react-native';
import UserCard from '../../../components/Order/OrderUser/UserCard';
import UserSortSummary from '../../../components/Order/OrderUser/UserSortSummary';
import UserHeaderTabs from '../../../components/Order/OrderUser/UserHeaderTabs';
import CustomText from '../../../utils/CustomText';

const OrderUserScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState(0);
  // 정렬: 최근순(true) / 오래된순(false)
  const [sortDesc, setSortDesc] = useState(true);

  useLayoutEffect(() => {
    navigation?.setOptions?.({title: '나의 주문내역'});
  }, [navigation]);

  const filtered = useMemo(() => {
    switch (activeTab) {
      case 0:
        return SAMPLE_ORDERS.filter(o =>
          ['pending', 'on_hold'].includes(o.status),
        );
      case 1:
        return SAMPLE_ORDERS.filter(o => o.status === 'waiting_payment');
      case 2:
        return SAMPLE_ORDERS.filter(o => o.status === 'in_prepare');
      case 3:
        return SAMPLE_ORDERS.filter(o => o.status === 'completed');
      default:
        return SAMPLE_ORDERS.filter(o =>
          ['canceled', 'rejected', 'refunded', 'payment_failed'].includes(
            o.status,
          ),
        );
    }
  }, [activeTab]);

  const isCompletedTab = activeTab === 3;

  const listData = useMemo(() => {
    // 완료 탭에서만 정렬 제공
    if (!isCompletedTab) return filtered;
    const toTime = t =>
      /\d{4}-\d{2}-\d{2}/.test(t)
        ? new Date(t).getTime()
        : Number.NEGATIVE_INFINITY;
    const sorted = [...filtered].sort((a, b) => {
      const ta = toTime(a?.reservationTime || '');
      const tb = toTime(b?.reservationTime || '');
      if (sortDesc) return tb - ta;
      return ta - tb;
    });
    return sorted;
  }, [filtered, isCompletedTab, sortDesc]);

  const listRef = useRef(null);
  const tabsRef = useRef(null);
  const scrollYRef = useRef(0);
  const tabsScrollXRef = useRef(0);
  const onScroll = e => {
    scrollYRef.current = e?.nativeEvent?.contentOffset?.y || 0;
  };
  const onTabsScroll = e => {
    tabsScrollXRef.current = e?.nativeEvent?.contentOffset?.x || 0;
  };
  const handleTabPress = idx => {
    const y = scrollYRef.current;
    setActiveTab(idx);
    setTimeout(() => {
      listRef.current?.scrollToOffset?.({offset: y, animated: false});
      tabsRef.current?.scrollTo?.({x: tabsScrollXRef.current, animated: false});
    }, 0);
  };

  const renderItem = ({item}) => {
    if (item && item.__type === 'header') {
      return (
        <View style={styles.sectionHeaderRow}>
          <CustomText style={styles.sectionHeaderText}>{item.title}</CustomText>
        </View>
      );
    }
    return (
      <UserCard
        order={item}
        onPressDetail={() =>
          navigation.navigate('OrderDetailScreen', {order: item, owner: false})
        }
      />
    );
  };

  const keyExtractor = item =>
    item && item.__type === 'header' ? item.id : item.id;

  return (
    <View>
      <UserHeaderTabs
        activeTab={activeTab}
        tabsRef={tabsRef}
        onTabsScroll={onTabsScroll}
        handleTabPress={handleTabPress}
      />
      <UserSortSummary
        isCompletedTab={isCompletedTab}
        filtered={filtered}
        sortDesc={sortDesc}
        setSortDesc={setSortDesc}
      />
      <FlatList
        ref={listRef}
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        ListEmptyComponent={() => (
          <CustomText style={styles.emptyText}>
            표시할 주문이 없습니다
          </CustomText>
        )}
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 24}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    color: '#c0c0c0',
    fontFamily: 'Pretendard-Medium',
  },
  sectionHeaderRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F9FAFB',
  },
  sectionHeaderText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 13,
    color: '#6B7280',
  },
});

const SAMPLE_ORDERS = [
  {
    id: 'u-1',
    status: 'pending',
    storeName: '친구네 1호점',
    reservationTime: '오늘 20:00',
    people: 2,
    itemsSummary: '모둠꼬치 x1, 생맥주 x2',
    receivedAt: '19:45',
    requestGroupId: 'grp-1',
    thumbnail:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'u-2',
    status: 'waiting_payment',
    storeName: '친구네 2호점',
    reservationTime: '오늘 18:30',
    people: 3,
    itemsSummary: '모둠튀김 x1, 소주 x3',
    receivedAt: '18:10',
    requestGroupId: 'grp-2',
    thumbnail:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'u-3',
    status: 'in_prepare',
    storeName: '분식 미소',
    reservationTime: '2025-09-25 18:30',
    people: 2,
    itemsSummary: '우동 x1, 김밥 x1',
    receiptNo: 9,
    receivedAt: '18:00',
    requestGroupId: 'grp-3',
    requestNote: '진짜 맛나게 해주세요 그리고 좀 늦을꺼 같습니다',
    thumbnail:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'u-4',
    status: 'completed',
    storeName: '친구네 1호점',
    reservationTime: '2025-09-20 18:30',
    people: 1,
    itemsSummary: '가츠라 x1',
    receiptNo: 12,
    receivedAt: '19:00',
    requestGroupId: 'grp-4',
    thumbnail:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'u-5',
    status: 'payment_failed',
    storeName: '친구네 2호점',
    reservationTime: '2025-09-21 19:30',
    people: 2,
    itemsSummary: '소주 x2',
    cancelReason: '결제 실패(금액 불일치)',
    receivedAt: '19:20',
    requestGroupId: 'grp-5',
    thumbnail:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'u-6',
    status: 'refunded',
    storeName: '분식 미소',
    reservationTime: '2025-09-22 12:30',
    people: 2,
    itemsSummary: '볶음밥 x1',
    cancelReason: '상품 문제로 환불 처리',
    receivedAt: '12:05',
    requestGroupId: 'grp-6',

    thumbnail:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop',
  },
];

export default OrderUserScreen;
