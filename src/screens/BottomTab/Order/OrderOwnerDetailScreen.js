import React, {useMemo, useLayoutEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  Pressable,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../../components/common/CustomText';

const normalizeStatus = status => {
  if (!status) return 'unknown';
  const s = String(status).toLowerCase().replace(/\s+/g, '');
  if (s.includes('pending')) return 'pending';
  if (s.includes('onhold') || s.includes('on_hold')) return 'on_hold';
  if (s.includes('waiting_payment') || s.includes('paymentwaiting'))
    return 'waiting_payment';
  if (s.includes('in_prepare') || s.includes('prepar')) return 'in_prepare';
  if (s.includes('completed')) return 'completed';
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
      <CustomText style={styles.infoLabel}>{label}</CustomText>
    </View>
    <CustomText style={styles.infoValue} numberOfLines={2}>
      {value ?? '-'}
    </CustomText>
  </View>
);

const Section = ({title, children}) => (
  <View style={{marginTop: 18}}>
    <CustomText style={styles.sectionHeader}>{title}</CustomText>
    <View style={styles.sectionBody}>{children}</View>
  </View>
);

export default function OrderOwnerDetailScreen({route, navigation}) {
  useLayoutEffect(() => {
    navigation?.setOptions?.({title: '주문 상세'});
  }, [navigation]);

  const order = route.params?.order;
  if (!order) return null;

  const status = normalizeStatus(order.status);
  const isPending = status === 'pending';
  const isInPrepare = status === 'in_prepare';
  const isWaitingPay = status === 'waiting_payment' || status === 'on_hold';
  const isCompleted = status === 'completed';
  const isCanceled = [
    'canceled',
    'rejected',
    'refunded',
    'payment_failed',
  ].includes(status);

  const statusStyle = useMemo(() => {
    if (isCanceled)
      return {bg: '#FEF2F2', fg: '#DC2626', label: '취소/거절/환불'};
    if (isCompleted) return {bg: '#ECFDF5', fg: '#065F46', label: '이용 완료'};
    if (isInPrepare) return {bg: '#EFF6FF', fg: '#1D4ED8', label: '준비 중'};
    if (isWaitingPay)
      return {bg: '#FFFBEB', fg: '#92400E', label: '결제 요청/진행'};
    if (isPending) return {bg: '#F3F4F6', fg: '#111827', label: '신규 요청'};
    return {bg: '#F3F4F6', fg: '#6B7280', label: '알 수 없음'};
  }, [isCanceled, isCompleted, isInPrepare, isWaitingPay, isPending]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollBody}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerWrap}>
          <View style={[styles.statusChip, {backgroundColor: statusStyle.bg}]}>
            <CustomText
              style={[styles.statusChipText, {color: statusStyle.fg}]}>
              {statusStyle.label}
            </CustomText>
          </View>
          <CustomText style={styles.storeName}>{order.storeName}</CustomText>
        </View>

        <Section title="기본 정보">
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

        {isCanceled && (
          <Section title="사유">
            <CustomText style={styles.infoValue}>
              {order.cancelReason || '-'}
            </CustomText>
          </Section>
        )}

        {(isPending || isInPrepare) && <View style={{height: 96}} />}
      </ScrollView>

      {(isPending || isInPrepare) && (
        <View style={styles.footerBar}>
          {isPending && (
            <>
              <Pressable
                style={[styles.secondaryBtn, {flex: 1}]}
                onPress={() => {}}>
                <CustomText style={styles.secondaryBtnText}>거절</CustomText>
              </Pressable>
              <Pressable
                style={[styles.primaryBtn, {flex: 1}]}
                onPress={() => {}}>
                <CustomText style={styles.primaryBtnText}>승인</CustomText>
              </Pressable>
            </>
          )}
          {isInPrepare && (
            <Pressable
              style={[styles.primaryBtn, {flex: 1}]}
              onPress={() => {}}>
              <CustomText style={styles.primaryBtnText}>이용 완료</CustomText>
            </Pressable>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  scrollBody: {paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28},
  headerWrap: {marginBottom: 8},
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  statusChipText: {fontFamily: 'Pretendard-SemiBold', fontSize: 12},
  storeName: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 20,
    color: '#111827',
    marginTop: 6,
  },
  sectionHeader: {
    fontFamily: 'Pretendard-Bold',
    color: '#111827',
    fontSize: 16,
    marginBottom: 8,
  },
  sectionBody: {paddingVertical: 2},
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  infoLabel: {fontFamily: 'Pretendard-Medium', color: '#6B7280'},
  infoValue: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#111827',
    maxWidth: '60%',
    textAlign: 'right',
  },
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
  primaryBtn: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {color: '#fff', fontFamily: 'Pretendard-SemiBold'},
  secondaryBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {color: '#111827', fontFamily: 'Pretendard-SemiBold'},
});
