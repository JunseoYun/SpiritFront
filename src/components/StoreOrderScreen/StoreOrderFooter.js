import React, {useEffect, useMemo, useRef} from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../common/CustomText';

const StoreOrderFooter = ({
  visible,
  safeAreaBottom = 0,
  visitTime,
  peopleIconName,
  peopleCountLabel,
  totalPrice,
  perPersonPrice,
  canSubmit,
  onSubmit,
  totalMenuCount = 0,
  totalAlcoholCount = 0,
}) => {
  const visibility = useRef(new Animated.Value(visible ? 1 : 0)).current;
  const translateY = useMemo(
    () =>
      visibility.interpolate({
        inputRange: [0, 1],
        outputRange: [120, 0],
      }),
    [visibility],
  );
  const totalCount = totalMenuCount + totalAlcoholCount;

  useEffect(() => {
    Animated.timing(visibility, {
      toValue: visible ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [visible, visibility]);

  return (
    <Animated.View
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.container,
        {
          opacity: visibility,
          transform: [{translateY}],
          paddingBottom:
            Platform.OS === 'android'
              ? safeAreaBottom + 20
              : safeAreaBottom + 10,
        },
      ]}>
      <View style={styles.metaRow}>
        <View style={styles.metaChip}>
          <View style={styles.metaIconWrapper}>
            <Ionicons name="time-outline" size={20} color="#1F2937" />
          </View>
          <View style={styles.metaChipText}>
            <CustomText style={styles.metaChipValue}>
              {visitTime || '미지정'}
            </CustomText>
          </View>
        </View>
        <View style={styles.metaChip}>
          <View style={styles.metaIconWrapper}>
            <Ionicons name={peopleIconName} size={20} color="#1F2937" />
          </View>
          <View style={styles.metaChipText}>
            <CustomText style={styles.metaChipValue}>
              {peopleCountLabel}
              {perPersonPrice !== undefined && perPersonPrice < 10000000 && (
                <CustomText style={styles.metaChipSubValue}>
                  {` 인당 ${perPersonPrice.toLocaleString()}원`}
                </CustomText>
              )}
            </CustomText>
          </View>
        </View>
      </View>
      <View style={styles.totalRow}>
        <CustomText style={styles.totalLabel}>예상 결제 금액</CustomText>
        <CustomText
          style={[styles.totalValue, totalPrice < 1 && {color: '#F0F9FD'}]}>
          {totalPrice > 0 ? `${totalPrice.toLocaleString()}원` : '-'}
        </CustomText>
      </View>
      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={onSubmit}
        disabled={!canSubmit}>
        <View style={styles.buttonContent}>
          <CustomText
            style={[
              styles.submitButtonText,
              !canSubmit && styles.submitButtonTextDim,
            ]}>
            주문 요청하기
          </CustomText>
          {totalCount > 0 && (
            <View style={[styles.badge, !canSubmit && styles.badgeDisabled]}>
              <CustomText
                style={[styles.badgeText, !canSubmit && styles.badgeTextDim]}>
                {totalCount}
              </CustomText>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -1},
    shadowOpacity: 0.13,
    shadowRadius: 4,
    elevation: 10,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 3,
  },
  metaChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaIconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
    marginLeft: 1,
  },
  metaChipText: {
    flex: 1,
  },
  metaChipValue: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#1F2937',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#222',
  },
  totalValue: {
    fontSize: 20,
    fontFamily: 'Pretendard-Bold',
    color: '#3CBBFF',
  },
  metaChipSubValue: {
    fontSize: 13,
    fontFamily: 'Pretendard-Regular',
    color: '#6B7280',
  },
  submitButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#3CBBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#B6E4F6',
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
    color: '#fff',
  },
  submitButtonTextDim: {
    color: '#F0F9FD',
  },
  badge: {
    marginLeft: 10,
    minWidth: 24,
    paddingHorizontal: 8,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeDisabled: {
    backgroundColor: 'rgba(255,255,255,0.7)',
  },
  badgeText: {
    fontSize: 13,
    fontFamily: 'Pretendard-Bold',
    color: '#3CBBFF',
  },
  badgeTextDim: {
    color: '#6AB6CF',
  },
});

export default StoreOrderFooter;
