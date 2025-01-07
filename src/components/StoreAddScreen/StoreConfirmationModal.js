import React from 'react';
import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import useCategoryTranslation from '../../hooks/useCategoryTranslation ';
import useDayTranslation from '../../hooks/useDayTranslation';

const StoreConfirmationModal = ({
  visible,
  onClose,
  onConfirm,
  storeData,
  selectedCategory,
  address,
  detailedAddress,
  operatingHours,
  closedDay,
  alcohol,
  selectedOption,
  selectedscreenOption,
}) => {

  const { translateCategory } = useCategoryTranslation();
  const { translateDay } = useDayTranslation();
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>등록 전 매장 정보 확인</Text>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
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
                {selectedCategory && selectedCategory.length > 0
                  ? selectedCategory.map((category) => translateCategory(category)).join(', ')
                  : '카테고리가 없습니다'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>영업시간</Text>
              {operatingHours.openHour && operatingHours.closedHour ? (
                <Text style={styles.infoValue}>
                  {operatingHours.openHour}:{operatingHours.openMinute || '00'} ~ {operatingHours.closedHour}:{operatingHours.closedMinute || '00'}
                </Text>
              ) : (
                <Text style={styles.infoValue}>미정</Text>
              )}
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>휴무일</Text>
              <Text style={styles.infoValue}>
                {closedDay && closedDay.length > 0
                  ? closedDay.map((day) => translateDay(day)).join(', ')
                  : '없음'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>대표 주종</Text>
              {alcohol ? (
                  <Text style={styles.infoValue}>{alcohol}</Text>
                ) : (
                  <Text style={styles.infoValue}>미정</Text>
                )
              }
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>8인 이상 단체 가능 여부</Text>
              <Text style={styles.infoValue}>{selectedOption ? '가능' : '불가능'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>매장 내 스크린(TV) 설치 여부</Text>
              <Text style={styles.infoValue}>{selectedscreenOption ? '설치' : '미설치'}</Text>
            </View>
          </ScrollView>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.modalCancelButtonText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={onConfirm}>
              <Text style={styles.modalButtonText}>완료</Text>
            </TouchableOpacity>
          </View>
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
  scrollContainer: {
    paddingBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#555',
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  cancelButton: {
    backgroundColor: '#F2F2F2',
  },
  confirmButton: {
    backgroundColor: '#16BBFF',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  modalCancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#16BBFF',
  },
});

export default StoreConfirmationModal;
