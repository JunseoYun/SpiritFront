import React from 'react';
import {View, StyleSheet, TouchableOpacity} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import CustomText from '../../utils/CustomText';

const SetLocationHeader = ({
  address,
  noticeMessage,
  onGetCurrentLocation,
  onSearch,
}) => {
  return (
    <View style={styles.container}>
      {/* Location Card */}
      <View style={styles.card}>
        <Ionicons
          name="location-outline"
          size={18}
          color="#64748B"
          style={styles.cardIcon}
        />

        <View style={styles.cardTextContainer}>
          <CustomText style={styles.cardLabel}>현재 설정된 위치</CustomText>
          <CustomText numberOfLines={2} style={styles.cardText}>
            {address || '저장된 주소가 없습니다.'}
          </CustomText>
        </View>
      </View>

      {/* Notice */}
      {!!noticeMessage && (
        <View style={styles.notice}>
          <Ionicons
            name="information-circle-outline"
            size={14}
            color="#9CA3AF"
            style={styles.noticeIcon}
          />
          <CustomText style={styles.noticeText}>{noticeMessage}</CustomText>
        </View>
      )}

      {/* Buttons */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={onGetCurrentLocation}>
          <Feather name="crosshair" size={15} color="#111827" />
          <CustomText style={styles.buttonText}>현재 위치로 설정</CustomText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          activeOpacity={0.85}
          onPress={onSearch}>
          <Feather name="search" size={15} color="#111827" />
          <CustomText style={styles.buttonText}>주소 검색하기</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
  },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardIcon: {
    marginRight: 10,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 15,
    color: '#111827',
    fontFamily: 'Pretendard-SemiBold',
    lineHeight: 20,
  },

  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  noticeIcon: {
    marginRight: 4,
  },
  noticeText: {
    fontSize: 12.5,
    color: '#9CA3AF',
    fontFamily: 'Pretendard-Regular',
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },

  button: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

  buttonText: {
    fontSize: 14,
    color: '#111827',
    fontFamily: 'Pretendard-Medium',
  },
});

export default SetLocationHeader;
