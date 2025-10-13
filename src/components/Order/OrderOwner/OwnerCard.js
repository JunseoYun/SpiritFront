import React from 'react';
import {StyleSheet, Text, View, Pressable, Image} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

const OwnerCard = ({order, onApprove, onReject, onMarkDone, onPressDetail}) => {
  const isPending = order.status === 'pending';
  const isWaiting =
    order.status === 'waiting_payment' || order.status === 'on_hold';
  const isInPrepare = order.status === 'in_prepare';
  const isCompleted = order.status === 'completed';
  const isCanceled = [
    'canceled',
    'rejected',
    'refunded',
    'payment_failed',
  ].includes(order.status);

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
            <Text style={styles.inlineBadgeText}>신규 요청</Text>
          </View>
          <View style={{flexDirection: 'row', gap: 8}}>
            <Pressable style={styles.ghostBtn} hitSlop={8} onPress={onReject}>
              <Text style={[styles.ghostBtnText, {color: '#EF4444'}]}>
                거절
              </Text>
            </Pressable>
            <Pressable style={styles.ghostBtn} hitSlop={8} onPress={onApprove}>
              <Text style={[styles.ghostBtnText, {color: '#10B981'}]}>
                승인
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {isWaiting && (
        <View style={styles.rowbillBetween}>
          <View style={styles.inlineBadge}>
            <Ionicons name="card-outline" size={14} color="#6B7280" />
            <Text style={styles.inlineBadgeText}>결제 요청/대기</Text>
          </View>
        </View>
      )}

      {isInPrepare && (
        <View style={styles.receiptBox}>
          <Text style={styles.receiptText}>
            준비 중 · 영수번호 {order.receiptNo ?? '-'}
          </Text>
          <View style={{height: 8}} />
          <Pressable style={styles.ghostBtn} hitSlop={8} onPress={onMarkDone}>
            <Text style={[styles.ghostBtnText, {color: '#111827'}]}>
              이용 완료
            </Text>
          </Pressable>
        </View>
      )}

      {isCompleted && (
        <View style={styles.reviewBox}>
          <Text style={styles.reviewTitle}>이용 완료</Text>
          <View style={styles.starsRow}>
            <Ionicons name="checkmark-circle" size={18} color="#10B981" />
            <Text style={styles.inlineBadgeText}>처리 완료</Text>
          </View>
        </View>
      )}

      {isCanceled && (
        <View style={styles.cancelBox}>
          <Ionicons name="close-circle" size={16} color="#EF4444" />
          <Text style={styles.cancelText} numberOfLines={2}>
            취소/거절/환불 사유 · {order.cancelReason || '-'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 3},
    elevation: 2,
    marginTop: 12,
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
  rowbillBetween: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
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
  ghostBtnText: {fontFamily: 'Pretendard-SemiBold', fontSize: 12},
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

export default OwnerCard;
