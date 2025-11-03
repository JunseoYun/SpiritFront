import React, {useMemo, useState, useLayoutEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Linking,
  ScrollView,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const normalizeStatus = status => {
  if (!status) return 'unknown';
  const s = String(status).toLowerCase().replace(/\s+/g, '');
  if (s.includes('pending')) return 'pending';
  if (s.includes('on_hold') || s.includes('onhold')) return 'on_hold';
  if (
    s.includes('waiting_payment') ||
    s.includes('paymentwaiting') ||
    s === 'waiting'
  )
    return 'waiting_payment';
  if (s.includes('in_prepare') || s.includes('prepar')) return 'in_prepare';
  if (s.includes('completed') || s.includes('done')) return 'completed';
  if (s.includes('payment_failed')) return 'payment_failed';
  if (s.includes('rejected')) return 'rejected';
  if (s.includes('refunded')) return 'refunded';
  if (s.includes('canceled') || s.includes('cancelled')) return 'canceled';
  return 'unknown';
};

const Row = ({icon, label, value}) => (
  <View style={styles.infoRow}>
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      {!!icon && (
        <Ionicons
          name={icon}
          size={18}
          color="#6B7280"
          style={{marginRight: 8}}
        />
      )}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue} numberOfLines={2}>
      {value ?? '-'}
    </Text>
  </View>
);

const Section = ({title, open, onToggle, children}) => (
  <View style={{marginTop: 18}}>
    <Pressable
      style={styles.sectionHeaderBtn}
      onPress={onToggle}
      hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}>
      <Text style={styles.sectionHeader}>{title}</Text>
      <Ionicons
        name={open ? 'chevron-up' : 'chevron-down'}
        size={18}
        color="#9CA3AF"
      />
    </Pressable>
    {open && <View style={styles.sectionBody}>{children}</View>}
  </View>
);

const Step = ({active, done, label}) => {
  const dotColor = done ? '#111827' : active ? '#111827' : '#D1D5DB';
  const textColor = active || done ? '#111827' : '#9CA3AF';
  return (
    <View style={styles.stepItem}>
      <View style={[styles.stepDot, {backgroundColor: dotColor}]} />
      <Text style={[styles.stepLabel, {color: textColor}]}>{label}</Text>
    </View>
  );
};

export default function OrderUserDetailScreen({route, navigation}) {
  const order = route.params?.order;
  useLayoutEffect(() => {
    navigation?.setOptions?.({title: '주문 상세'});
  }, [navigation]);
  if (!order) return null;

  const status = normalizeStatus(order.status);
  const isPending = status === 'pending';
  const isOnHold = status === 'on_hold';
  const isWaitingPay = status === 'waiting_payment';
  const isInPrepare = status === 'in_prepare';
  const isCompleted = status === 'completed';
  const isCanceled = [
    'canceled',
    'rejected',
    'refunded',
    'payment_failed',
  ].includes(status);

  const phone = order.phone || '010-0000-0000';
  const handleCall = () => Linking.openURL(`tel:${phone}`);
  const handleLocation = () => {};
  const handleDeleteHistory = () => {
    Alert.alert('이용내역 삭제', '삭제하면 복구할 수 없습니다. 삭제할까요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          try {
            navigation?.goBack?.();
          } catch (e) {}
        },
      },
    ]);
  };

  const statusLabelMap = {
    pending: '예약 진행중',
    on_hold: '매장 결제 진행 중(on hold)',
    waiting_payment: '결제 요청',
    in_prepare: '준비 중',
    completed: '이용 완료',
    canceled: '취소',
    rejected: '거절',
    refunded: '환불',
    payment_failed: '결제 실패',
    unknown: '알 수 없음',
  };

  const statusStyle = useMemo(() => {
    if (isCanceled) return {bg: '#FEF2F2', fg: '#DC2626'};
    if (isCompleted) return {bg: '#ECFDF5', fg: '#065F46'};
    if (isInPrepare) return {bg: '#EFF6FF', fg: '#1D4ED8'};
    if (isWaitingPay || isOnHold) return {bg: '#FFFBEB', fg: '#92400E'};
    if (isPending) return {bg: '#F3F4F6', fg: '#111827'};
    return {bg: '#F3F4F6', fg: '#6B7280'};
  }, [isCanceled, isCompleted, isInPrepare, isWaitingPay, isOnHold, isPending]);

  const [openInfo, setOpenInfo] = useState(true);
  const [openOrder, setOpenOrder] = useState(true);
  const [openMenu, setOpenMenu] = useState(true);
  const [openMyRequest, setOpenMyRequest] = useState(true);
  const [openStoreNotice, setOpenStoreNotice] = useState(false);

  const menuItems = Array.isArray(order.items)
    ? order.items
    : (order.itemsSummary || '')
        .split(',')
        .map(t => t.trim())
        .filter(Boolean)
        .map((name, idx) => ({name, qty: 1, price: undefined, idx}));

  const formatItemLine = it => {
    const qty = it.qty ? ` x${it.qty}` : '';
    const price = it.price ? ` · ${it.price.toLocaleString()}원` : '';
    return `${it.name}${price}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollBody}
        contentContainerStyle={{paddingBottom: 28}}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrap}>
          <View style={[styles.statusChip, {backgroundColor: statusStyle.bg}]}>
            <Text style={[styles.statusChipText, {color: statusStyle.fg}]}>
              {statusLabelMap[status]}
            </Text>
          </View>
          <Text style={styles.receivedText}>
            접수 시간 {order.receivedAt || '-'}
          </Text>
          <Text style={styles.storeName}>{order.storeName}</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.pillBtn} onPress={handleCall} hitSlop={8}>
            <Ionicons name="call-outline" size={16} color="#111827" />
            <Text style={styles.pillBtnText}>전화</Text>
          </Pressable>
          <Pressable
            style={styles.pillBtn}
            onPress={handleLocation}
            hitSlop={8}>
            <Ionicons name="location-outline" size={16} color="#111827" />
            <Text style={styles.pillBtnText}>위치</Text>
          </Pressable>
        </View>

        <View style={styles.timelineWrap}>
          {!isCanceled ? (
            <View style={styles.stepRow}>
              <Step
                label="요청 접수"
                active={isPending}
                done={isWaitingPay || isOnHold || isInPrepare || isCompleted}
              />
              <View style={styles.stepBar} />
              <Step
                label="결제 진행"
                active={isWaitingPay || isOnHold}
                done={isInPrepare || isCompleted}
              />
              <View style={styles.stepBar} />
              <Step label="준비 중" active={isInPrepare} done={isCompleted} />
              <View style={styles.stepBar} />
              <Step label="이용 완료" active={isCompleted} done={false} />
            </View>
          ) : (
            <View style={[styles.centerBox, {paddingVertical: 6}]}>
              <Ionicons name="close-circle" size={18} color="#DC2626" />
              <Text
                style={[styles.centerText, {marginLeft: 6, color: '#DC2626'}]}>
                취소/거절/환불
              </Text>
            </View>
          )}
        </View>

        <Section
          title="기본 정보"
          open={openInfo}
          onToggle={() => setOpenInfo(v => !v)}>
          <Row
            icon="time-outline"
            label="예약 시간"
            value={order.reservationTime || '-'}
          />
          <Row
            icon="people-outline"
            label="인원"
            value={`${order.people ?? '-'}명`}
          />
          <Row
            icon="reader-outline"
            label="주문"
            value={order.itemsSummary || '-'}
          />
        </Section>
        {!!order.receiptNo && (
          <Section
            title="접수 정보"
            open={openOrder}
            onToggle={() => setOpenOrder(v => !v)}>
            <Row
              icon="receipt-outline"
              label="접수 번호"
              value={String(order.receiptNo)}
            />

            {!!order.phone && (
              <Row icon="call-outline" label="연락처" value={order.phone} />
            )}
          </Section>
        )}

        {!!menuItems?.length && (
          <Section
            title="메뉴"
            open={openMenu}
            onToggle={() => setOpenMenu(v => !v)}>
            {menuItems.map((it, idx) => (
              <View
                key={idx}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 6,
                }}>
                <View style={styles.bullet} />
                <Text style={styles.menuText}>{formatItemLine(it)}</Text>
              </View>
            ))}
          </Section>
        )}

        <Section
          title="요청 사항"
          open={openMyRequest}
          onToggle={() => setOpenMyRequest(v => !v)}>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              {order.userRequestNote ||
                order.requestNote ||
                '작성된 요청사항이 없습니다.'}
            </Text>
          </View>
        </Section>

        {(order.storeNotice || order.notice || order.storeNote) && (
          <Section
            title="매장 안내"
            open={openStoreNotice}
            onToggle={() => setOpenStoreNotice(v => !v)}>
            <View style={styles.noteBox}>
              <Text style={styles.noteText}>
                {order.storeNotice || order.notice || order.storeNote}
              </Text>
            </View>
          </Section>
        )}

        {isCanceled && (
          <View style={[styles.centerBox, {marginTop: 8}]}>
            <Text style={styles.centerText}>
              사유: {order.cancelReason || '-'}
            </Text>
          </View>
        )}

        {isCompleted && (
          <View style={{marginTop: 10}}>
            <Pressable
              style={[styles.primaryBtn]}
              onPress={handleDeleteHistory}
              hitSlop={8}>
              <Text style={styles.primaryBtnText}>이용내역 삭제</Text>
            </Pressable>
          </View>
        )}

        {(isPending || isCompleted || isWaitingPay) && (
          <View style={{height: 96}} />
        )}
      </ScrollView>

      {(isPending || isCompleted || isWaitingPay) && (
        <View style={styles.footerBar}>
          {isPending && (
            <Pressable
              style={[styles.primaryBtn, {flex: 1}]}
              onPress={() => {}}>
              <Text style={styles.primaryBtnText}>주문 취소</Text>
            </Pressable>
          )}
          {isWaitingPay && (
            <Pressable
              style={[styles.secondaryBtn, {flex: 1}]}
              onPress={() => {}}>
              <Text style={styles.secondaryBtnText}>결제하기</Text>
            </Pressable>
          )}
          {isCompleted && (
            <Pressable
              style={[styles.secondaryBtn, {flex: 1}]}
              onPress={() => {}}>
              <Text style={styles.secondaryBtnText}>리뷰 작성</Text>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  scrollBody: {paddingHorizontal: 16, paddingTop: 12},
  headerWrap: {marginBottom: 6},
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  statusChipText: {fontFamily: 'Pretendard-SemiBold', fontSize: 12},
  receivedText: {
    fontFamily: 'Pretendard-Medium',
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  storeName: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 20,
    color: '#111827',
    marginTop: 6,
  },
  actionsRow: {flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 8},
  pillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#F3F4F6',
  },
  pillBtnText: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#111827',
    fontSize: 13,
  },
  timelineWrap: {paddingVertical: 8, marginTop: 2, marginBottom: 6},
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {flexDirection: 'row', alignItems: 'center'},
  stepDot: {width: 8, height: 8, borderRadius: 8, backgroundColor: '#D1D5DB'},
  stepLabel: {marginLeft: 6, fontFamily: 'Pretendard-SemiBold', fontSize: 12},
  stepBar: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 8,
  },
  sectionHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#EEE',
  },
  sectionHeader: {
    fontFamily: 'Pretendard-Bold',
    color: '#111827',
    fontSize: 16,
  },
  sectionBody: {paddingVertical: 6},
  orderStateTitle: {
    fontFamily: 'Pretendard-Bold',
    color: '#111827',
    fontSize: 16,
    marginBottom: 6,
  },
  orderStrong: {fontFamily: 'Pretendard-Bold', color: '#111827'},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoLabel: {fontFamily: 'Pretendard-Medium', color: '#6B7280'},
  infoValue: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#111827',
    maxWidth: '60%',
    textAlign: 'right',
  },
  requestText: {fontFamily: 'Pretendard-Medium', color: '#6B7280'},
  noteBox: {backgroundColor: '#F9FAFB', borderRadius: 10, padding: 12},
  noteText: {fontFamily: 'Pretendard-Medium', color: '#374151', lineHeight: 20},
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#D1D5DB',
    marginRight: 8,
  },
  menuText: {fontFamily: 'Pretendard-SemiBold', color: '#111827', flex: 1},
  primaryBtn: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#999',
  },
  primaryBtnText: {color: '#1a1a1a', fontFamily: 'Pretendard-SemiBold'},
  secondaryBtn: {
    backgroundColor: '#E8F7FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {color: '#3CBBFF', fontFamily: 'Pretendard-SemiBold'},
  centerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerText: {fontFamily: 'Pretendard-Bold', color: '#111827'},
  footerBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 10,
  },
});
