import React from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation';
import useDayTranslation from '../../hooks/useDayTranslation';
import useTranslateAlcohol from '../../hooks/useTranslateAlcohol';

const StoreConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  storeData,
  selectedCategory,
  address,
  detailedAddress,
  operatingHours,
  breakingHours,
  closedDay,
  alcohol,
  selectedOption,
  selectedscreenOption,
  is24Hours,
}) => {
  const {translateCategory} = useCategoryTranslation();
  const {translateDays} = useDayTranslation();
  const {translateAlcohol} = useTranslateAlcohol();

  const dayMapping = {
    Monday: '월',
    Tuesday: '화',
    Wednesday: '수',
    Thursday: '목',
    Friday: '금',
    Saturday: '토',
    Sunday: '일',
  };

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>등록 전 매장 정보 확인</Text>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>매장 이름</Text>
              <Text style={styles.infoValue}>{storeData.storeName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>매장 번호</Text>
              <Text style={styles.infoValue}>{storeData.storeNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주소</Text>
              <Text style={styles.infoValue}>{address}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>상세 주소</Text>
              <Text style={styles.infoValue}>{detailedAddress}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>카테고리</Text>
              <Text style={styles.infoValue}>
                {selectedCategory.length > 0
                  ? selectedCategory
                      .map(category => translateCategory(category))
                      .join(', ')
                  : '카테고리가 없습니다'}
              </Text>
            </View>

            {/* ✅ 영업 시간 미리보기 개선 */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>영업 시간</Text>
            </View>
            <View style={styles.operatingHoursContainer}>
              {is24Hours ? (
                <Text style={styles.allDayText}>24시간 영업</Text>
              ) : (
                Object.entries(operatingHours).map(
                  ([day, {openHour, openMinute, closedHour, closedMinute}]) => {
                    const koreanDay = dayMapping[day];
                    const isClosed = closedDay.includes(day.toUpperCase());
                    const breakTime = breakingHours[day];

                    return (
                      <View key={day} style={styles.dayRow}>
                        <View
                          style={[
                            styles.dayChip,
                            isClosed && styles.closedDayChip,
                          ]}>
                          <Text style={styles.dayText}>{koreanDay}</Text>
                        </View>
                        {isClosed ? (
                          <Text style={styles.closedText}>휴무</Text>
                        ) : (
                          <View style={styles.timeContainer}>
                            <Text style={styles.operatingHoursText}>
                              {`${openHour.padStart(
                                2,
                                '0',
                              )}:${openMinute.padStart(2, '0')} ~ `}
                              {closedHour >= 24
                                ? `다음날 ${String(closedHour - 24).padStart(
                                    2,
                                    '0',
                                  )}`
                                : String(closedHour).padStart(2, '0')}
                              :{closedMinute.padStart(2, '0')}
                            </Text>
                            {breakTime?.startHour && breakTime?.endHour && (
                              <Text style={styles.breakTimeText}>
                                브레이크타임{' '}
                                {breakTime.startHour.padStart(2, '0')}:
                                {breakTime.startMinute.padStart(2, '0')} ~{' '}
                                {breakTime.endHour >= 24
                                  ? `다음날 ${String(
                                      breakTime.endHour - 24,
                                    ).padStart(2, '0')}`
                                  : String(breakTime.endHour).padStart(2, '0')}
                                :{breakTime.endMinute.padStart(2, '0')}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    );
                  },
                )
              )}
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}>
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={onConfirm}>
                <Text style={styles.modalButtonText}>완료</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  operatingHoursContainer: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#E0E0E0',
  },
  dayChip: {
    backgroundColor: '#16BBFF',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 10,
  },
  closedDayChip: {
    backgroundColor: '#B0B0B0',
  },
  dayText: {
    fontSize: 14,
    color: '#FFF',
    fontWeight: '600',
  },
  timeContainer: {
    flex: 1,
  },
  operatingHoursText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  breakTimeText: {
    fontSize: 13,
    color: '#999',
    marginTop: 3,
  },
  closedText: {
    fontSize: 15,
    color: '#444',
    fontWeight: '500',
    flex: 1,
  },
  allDayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#16BBFF',
    textAlign: 'center',
    paddingVertical: 10,
  },
});

export default StoreConfirmationModal;
