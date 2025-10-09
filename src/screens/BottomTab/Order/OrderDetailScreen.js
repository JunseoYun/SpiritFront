import React, {useMemo, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Linking,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// 상태 문자열 정규화 (접수중/접수완료/방문완료/접수취소)
const normalizeStatus = status => {
  if (status == null) return 'unknown';
  const s = String(status).toLowerCase().replace(/\s+/g, '');
  const isPending = [
    '접수중',
    '대기',
    '대기중',
    '접수대기',
    '예약대기',
    'pending',
    'waiting',
  ].some(k => s.includes(k));
  const isAccepted = [
    '접수완료',
    '수락완료',
    '수락',
    '접수확정',
    'accepted',
    'approved',
  ].some(k => s.includes(k));
  const isVisited = ['방문완료', '이용완료', 'visited'].some(k =>
    s.includes(k),
  );
  const isCanceled = [
    '접수취소',
    '주문취소',
    '취소',
    'canceled',
    'cancelled',
    '거절',
    '반려',
  ].some(k => s.includes(k));
  if (isCanceled) return 'canceled';
  if (isVisited) return 'visited';
  if (isAccepted) return 'accepted';
  if (isPending) return 'pending';
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

const OrderDetailScreen = ({route}) => {
  const order = route.params?.order;
  if (!order) return null;

  const status = normalizeStatus(order.status);
  const isPending = status === 'pending';
  const isAccepted = status === 'accepted';
  const isVisited = status === 'visited';
  const isCanceled = status === 'canceled';

  const phone = order.phone || '010-0000-0000';
  const handleCall = () => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };
  const handleLocation = () => {
    // TODO: 위치 화면 연결
  };

  const statusLabelMap = {
    pending: '접수중',
    accepted: '접수완료',
    visited: '방문완료',
    canceled: '접수취소',
    unknown: '확인 필요',
  };

  const statusStyle = useMemo(() => {
    if (isCanceled) return {bg: '#FEF2F2', fg: '#DC2626'};
    if (isVisited) return {bg: '#ECFDF5', fg: '#059669'};
    if (isAccepted) return {bg: '#EEF2FF', fg: '#4F46E5'};
    return {bg: '#FFF7ED', fg: '#EA580C'};
  }, [isCanceled, isVisited, isAccepted]);

  const [openOrder, setOpenOrder] = useState(true);
  const [openInfo, setOpenInfo] = useState(true);
  const [openMyRequest, setOpenMyRequest] = useState(true);
  const [openStoreNotice, setOpenStoreNotice] = useState(false);
  const [openMenu, setOpenMenu] = useState(true);

  const menuItemsRaw =
    order.itemsDetailed && order.itemsDetailed.length > 0
      ? order.itemsDetailed
      : order.items && order.items.length > 0
      ? order.items
      : [];
  const menuItems = (
    menuItemsRaw.length > 0
      ? menuItemsRaw
      : order.itemsSummary
      ? [order.itemsSummary]
      : []
  ).map(it => (typeof it === 'string' ? {name: it} : it));

  const formatItemLine = it => {
    const name = it?.name || it?.title || '';
    const qty = it?.qty ?? it?.quantity;
    const options = Array.isArray(it?.options)
      ? it.options
          .map(o => (typeof o === 'string' ? o : o?.value || o?.name))
          .filter(Boolean)
          .join(', ')
      : typeof it?.options === 'string'
      ? it.options
      : it?.option || '';
    const price =
      typeof it?.price === 'number'
        ? `${it.price.toLocaleString('ko-KR')}원`
        : '';
    const segments = [
      name,
      qty ? `x${qty}` : null,
      options || null,
      price || null,
    ].filter(Boolean);
    return segments.join(' · ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollBody}>
        <View style={styles.headerWrap}>
          <View style={styles.headerLeft}>
            <View
              style={[styles.statusChip, {backgroundColor: statusStyle.bg}]}>
              <Text style={[styles.statusChipText, {color: statusStyle.fg}]}>
                {statusLabelMap[status] || order.status}
              </Text>
            </View>
            <Text style={styles.storeName}>{order.storeName}</Text>
            <Text style={styles.receivedText}>
              접수 시간 {order.receivedAt || '-'}
            </Text>
          </View>
          <Pressable onPress={() => {}} hitSlop={8}>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </Pressable>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.pillBtn} onPress={handleCall} hitSlop={8}>
            <Ionicons name="call-outline" size={16} color="#111827" />
            <Text style={styles.pillBtnText}>통화</Text>
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
                label="접수중"
                active={isPending}
                done={isAccepted || isVisited}
              />
              <View style={styles.stepBar} />
              <Step label="접수완료" active={isAccepted} done={isVisited} />
              <View style={styles.stepBar} />
              <Step label="방문완료" active={isVisited} done={false} />
            </View>
          ) : (
            <View style={[styles.centerBox, {paddingVertical: 6}]}>
              <Ionicons name="close-circle" size={18} color="#DC2626" />
              <Text
                style={[styles.centerText, {marginLeft: 6, color: '#DC2626'}]}>
                접수취소
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
            label="접수 시간"
            value={order.receivedAt || '-'}
          />
          <Row
            icon="time-outline"
            label="방문 시간"
            value={order.reservationTime || '-'}
          />
          <Row
            icon="people-outline"
            label="인원"
            value={`${order.people ?? '-'}명`}
          />
        </Section>

        <Section
          title="주문 상태"
          open={openOrder}
          onToggle={() => setOpenOrder(v => !v)}>
          <Text style={styles.orderStateTitle}>
            {isAccepted
              ? '접수완료'
              : isPending
              ? '접수중'
              : isVisited
              ? '방문완료'
              : '확인 필요'}
          </Text>
          {(isAccepted || order.receiptNo) && (
            <Text style={styles.orderStrong}>
              접수 번호 {order.receiptNo ?? '-'}
            </Text>
          )}
        </Section>

        <Section
          title="주문 메뉴"
          open={openMenu}
          onToggle={() => setOpenMenu(v => !v)}>
          <View style={{gap: 10}}>
            {menuItems.length > 0 ? (
              menuItems.map((it, idx) => (
                <View
                  key={idx}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <View style={styles.bullet} />
                  <Text style={styles.menuText} numberOfLines={2}>
                    {formatItemLine(it)}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={styles.requestText}>메뉴 정보가 없습니다.</Text>
            )}
          </View>
        </Section>

        <Section
          title="내 요청사항"
          open={openMyRequest}
          onToggle={() => setOpenMyRequest(v => !v)}>
          <View style={styles.noteBox}>
            <Text style={styles.noteText}>
              {order.userRequestNote ||
                order.requestNote ||
                '작성된 요청이 없습니다.'}
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
              취소 사유: {order.cancelReason || '-'}
            </Text>
          </View>
        )}

        {(isPending || isVisited) && <View style={{height: 96}} />}
      </ScrollView>

      {(isPending || isVisited) && (
        <View style={styles.footerBar}>
          {isPending && (
            <Pressable
              style={[styles.primaryBtn, {flex: 1}]}
              onPress={() => {
                /* TODO: 접수 취소 처리 */
              }}>
              <Text style={styles.primaryBtnText}>주문 취소</Text>
            </Pressable>
          )}
          {isVisited && (
            <Pressable
              style={[styles.secondaryBtn, {flex: 1}]}
              onPress={() => {
                /* TODO: 리뷰 작성으로 이동 */
              }}>
              <Text style={styles.secondaryBtnText}>리뷰 작성</Text>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  scrollBody: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28},
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  headerLeft: {flex: 1},
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
    backgroundColor: '#FFF1F2',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {color: '#EF4444', fontFamily: 'Pretendard-SemiBold'},
  secondaryBtn: {
    backgroundColor: '#E8F7FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {color: '#45C9FF', fontFamily: 'Pretendard-SemiBold'},
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

export default OrderDetailScreen;
