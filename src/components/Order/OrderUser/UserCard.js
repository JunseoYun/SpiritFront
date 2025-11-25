import React from 'react';
import {StyleSheet, Text, View, Pressable, Image, Alert} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import CustomText from '../../common/CustomText';

const UserCard = ({order, onPressDetail}) => {
  const isPending = order.status === 'pending';
  const isOnHold = order.status === 'on_hold';
  const isWaitingPay = order.status === 'waiting_payment';
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
        <CustomText style={styles.reservationText} numberOfLines={1}>
          예약 {order.reservationTime} · 인원 {order.people}명
        </CustomText>
        <Pressable hitSlop={8} style={styles.detailBtn} onPress={onPressDetail}>
          <CustomText style={styles.detailBtnText}>주문 상세</CustomText>
          <Feather name={'chevron-right'} size={15} color="#333" />
        </Pressable>
      </View>

      <View style={styles.cardHeader}>
        <Image source={{uri: order.thumbnail}} style={styles.thumb} />
        <View style={{flex: 1}}>
          <CustomText style={styles.storeName}>{order.storeName}</CustomText>
          <CustomText style={styles.subText} numberOfLines={1}>
            {order.itemsSummary}
          </CustomText>
        </View>
      </View>

      {(isPending || isOnHold || isWaitingPay) && (
        <View style={styles.rowBetween}>
          <View style={styles.inlineBadge}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <CustomText style={styles.inlineBadgeText}>
              {isPending && `접수 대기 · 수령 ${order.receivedAt || '-'}`}
              {isOnHold && '매장 결제 진행 중(on hold)'}
              {isWaitingPay && '결제 요청'}
            </CustomText>
          </View>
          {isPending && (
            <Pressable
              style={styles.ghostBtn}
              hitSlop={8}
              onPress={() =>
                Alert.alert(
                  '주문 취소',
                  '접수 단계에서만 사유 없이 취소가 가능합니다.',
                  [{text: '닫기'}],
                )
              }>
              <CustomText style={styles.ghostBtnText}>주문 취소</CustomText>
            </Pressable>
          )}
        </View>
      )}

      {(isInPrepare || isWaitingPay) && (
        <View style={styles.receiptBox}>
          {isWaitingPay ? null : (
            <CustomText style={styles.receiptText}>
              {isInPrepare && `준비 중 · 접수번호 ${order.receiptNo ?? '-'}`}
            </CustomText>
          )}
          {isWaitingPay && (
            <Pressable
              style={[styles.primaryBtn]}
              onPress={() => Alert.alert('결제', '결제를 진행할까요?')}
              hitSlop={8}>
              <CustomText style={styles.primaryBtnText}>결제하기</CustomText>
            </Pressable>
          )}
        </View>
      )}

      {isCompleted && (
        <View style={styles.reviewBox}>
          <CustomText style={styles.reviewTitle}>방문 완료</CustomText>
          <View style={styles.starsRow}>
            <View style={{flexDirection: 'row', gap: 4}}>
              <Ionicons name="star-outline" size={18} color="#9CA3AF" />
              <Ionicons name="star-outline" size={18} color="#9CA3AF" />
              <Ionicons name="star-outline" size={18} color="#9CA3AF" />
              <Ionicons name="star-outline" size={18} color="#9CA3AF" />
              <Ionicons name="star-outline" size={18} color="#9CA3AF" />
            </View>
            <CustomText style={styles.inlineBadgeText}>
              리뷰를 남겨보세요
            </CustomText>
          </View>
        </View>
      )}

      {isCanceled && (
        <View style={styles.cancelBox}>
          <Ionicons name="close-circle" size={16} color="#EF4444" />
          <CustomText style={styles.cancelText} numberOfLines={2}>
            {order.status === 'refunded' ? '환불 사유' : '취소/거절 사유'} ·{' '}
            {order.cancelReason || '-'}
          </CustomText>
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
    marginBottom: 12,
    marginTop: 5,
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
    flexDirection: 'column',
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
  primaryBtn: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#E8F7FF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#3CBBFF',
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
  },
});

export default UserCard;
