import React, {
  useMemo,
  useState,
  useLayoutEffect,
  useEffect,
  useRef,
} from 'react';
import {StyleSheet, Text, View, FlatList, Alert} from 'react-native';
import OwnerStoreList from '../../../components/Order/OrderOwner/OwnerStoreList';
import OwnerModeBtn from '../../../components/Order/OrderOwner/OwnerModeBtn';
import OwnerHeaderTabs from '../../../components/Order/OrderOwner/OwnerHeaderTabs';
import OwnerCard from '../../../components/Order/OrderOwner/OwnerCard';

const OrderOwnerScreen = ({navigation}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedStore, setSelectedStore] = useState(null);
  const [manualMode, setManualMode] = useState(true); // true: 수동 확인, false: 자동 확인
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  const tabsRef = useRef(null);
  const tabsScrollXRef = useRef(0);
  const onTabsScroll = e =>
    (tabsScrollXRef.current = e?.nativeEvent?.contentOffset?.x || 0);
  const storesRef = useRef(null);
  const storesScrollXRef = useRef(0);
  const onStoresScroll = e =>
    (storesScrollXRef.current = e?.nativeEvent?.contentOffset?.x || 0);

  useEffect(() => {
    if (!selectedStore && OWNER_STORES.length > 0)
      setSelectedStore(OWNER_STORES[0]);
  }, [selectedStore]);

  useLayoutEffect(() => {
    if (selectedStore)
      navigation?.setOptions?.({title: `${selectedStore.name} 주문`});
  }, [navigation, selectedStore]);

  const filtered = useMemo(() => {
    let list = orders;
    if (selectedStore)
      list = list.filter(o => o.storeName === selectedStore.name);
    switch (activeTab) {
      case 0:
        return list.filter(o => o.status === 'pending');
      case 1:
        return list.filter(o =>
          ['on_hold', 'waiting_payment'].includes(o.status),
        );
      case 2:
        return list.filter(o => o.status === 'in_prepare');
      case 3:
        return list.filter(o => o.status === 'completed');
      default:
        return list.filter(o =>
          ['canceled', 'rejected', 'refunded', 'payment_failed'].includes(
            o.status,
          ),
        );
    }
  }, [orders, activeTab, selectedStore]);

  const updateOrder = (id, patch) =>
    setOrders(prev => prev.map(o => (o.id === id ? {...o, ...patch} : o)));

  const cancelOthersInGroup = (groupId, keepId) =>
    setOrders(prev =>
      prev.map(o =>
        o.requestGroupId && o.requestGroupId === groupId && o.id !== keepId
          ? {...o, status: 'canceled', cancelReason: '다른 요청으로 처리 완료'}
          : o,
      ),
    );

  const onApprove = order => {
    if (manualMode) {
      updateOrder(order.id, {status: 'waiting_payment'});
      Alert.alert('보류', '매장결제 진행을 요청합니다(on hold).');
    } else {
      updateOrder(order.id, {
        status: 'in_prepare',
        receiptNo: order.receiptNo ?? 1,
      });
      cancelOthersInGroup(order.requestGroupId, order.id);
      Alert.alert('자동 확인', '주문 승인, 준비 중으로 전환되었습니다.');
    }
  };

  const onReject = order => {
    updateOrder(order.id, {
      status: 'rejected',
      cancelReason: '주문 불가 시간대',
    });
  };

  const onMarkDone = order => updateOrder(order.id, {status: 'completed'});

  const renderItem = ({item}) => (
    <OwnerCard
      order={item}
      onApprove={() => onApprove(item)}
      onReject={() => onReject(item)}
      onMarkDone={() => onMarkDone(item)}
      onPressDetail={() =>
        navigation.navigate('OrderDetailScreen', {order: item, owner: true})
      }
    />
  );

  const handleTabPress = idx => {
    setActiveTab(idx);
    setTimeout(() => {
      tabsRef.current?.scrollTo?.({x: tabsScrollXRef.current, animated: false});
    }, 0);
  };

  const handleStorePress = s => {
    setSelectedStore(s);
    setTimeout(() => {
      storesRef.current?.scrollTo?.({
        x: storesScrollXRef.current,
        animated: false,
      });
    }, 0);
  };

  return (
    <View>
      <View>
        <OwnerStoreList
          OWNER_STORES={OWNER_STORES}
          storesRef={storesRef}
          onStoresScroll={onStoresScroll}
          selectedStore={selectedStore}
          handleStorePress={handleStorePress}
        />
        <OwnerModeBtn setManualMode={setManualMode} manualMode={manualMode} />
        <OwnerHeaderTabs
          tabsRef={tabsRef}
          onTabsScroll={onTabsScroll}
          activeTab={activeTab}
          handleTabPress={handleTabPress}
        />
      </View>
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 24}}
        ListEmptyComponent={() => (
          <Text style={styles.emptyText}>표시할 주문이 없습니다</Text>
        )}
      />
    </View>
  );
};

// 상태: pending | on_hold | waiting_payment | in_prepare | completed | canceled | rejected | refunded | payment_failed
const INITIAL_ORDERS = [
  {
    id: 'o-1',
    status: 'pending',
    storeName: '친구네 1호점',
    reservationTime: '오늘 19:30',
    people: 2,
    itemsSummary: '모둠꼬치 x2',
    receivedAt: '19:05',
    requestGroupId: 'grp-a',
    thumbnail:
      'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'o-2',
    status: 'waiting_payment',
    storeName: '친구네 2호점',
    reservationTime: '오늘 18:00',
    people: 4,
    itemsSummary: '해물파전 x3',
    receiptNo: 37,
    requestGroupId: 'grp-b',
    thumbnail:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'o-3',
    status: 'in_prepare',
    storeName: '친구네 1호점',
    reservationTime: '2025-09-24 12:30',
    people: 2,
    itemsSummary: '우동 x1',
    receiptNo: 12,
    requestGroupId: 'grp-c',
    thumbnail:
      'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'o-4',
    status: 'canceled',
    storeName: '친구네 2호점',
    reservationTime: '2025-09-20 18:30',
    people: 1,
    itemsSummary: '돈가스',
    cancelReason: '손님 요청으로 취소',
    requestGroupId: 'grp-d',
    thumbnail:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
  },
  {
    id: 'o-5',
    status: 'completed',
    storeName: '친구네 1호점',
    reservationTime: '2025-09-20 19:30',
    people: 2,
    itemsSummary: '라면 2',
    receiptNo: 88,
    requestGroupId: 'grp-e',
    thumbnail:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=400&auto=format&fit=crop',
  },
];

const OWNER_STORES = [
  {id: 's-1', name: '친구네 1호점'},
  {id: 's-2', name: '친구네 2호점'},
  {id: 's-3', name: '친구네 3호점'},
];

const styles = StyleSheet.create({
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    color: '#c0c0c0',
    fontFamily: 'Pretendard-Medium',
  },
});
export default OrderOwnerScreen;
