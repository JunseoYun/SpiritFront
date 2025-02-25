import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';

const StoreAuthorityModal = ({visible, onClose, onSubmit, data}) => {
  const {
    storeData,
    owners,
    hasCoRepresentative,
    businessData,
    business_certificate,
    storeAddressData,
  } = data;

  // 대표자 정보 처리 (공동 대표: 전체 표시, 단일 대표: 첫 번째만 표시)
  const displayedOwners = hasCoRepresentative ? owners : [owners[0]];

  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          {/* 매장 정보 */}

          <Text style={styles.modalTitle}>신청 정보 확인</Text>
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>매장명(상호명)</Text>
              <Text style={styles.infoValue}>{storeData.storeName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>매장 연락처</Text>
              <Text style={styles.infoValue}>{storeData.storeNumber}</Text>
            </View>

            {/* 신청자 정보 */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>신청자 성명</Text>
              <Text style={styles.infoValue}>{storeData.userName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>신청자 연락처</Text>
              <Text style={styles.infoValue}>{storeData.userContact}</Text>
            </View>

            {/* 대표자 정보 */}
            <Text style={styles.sectionTitle}>대표자 정보</Text>
            {displayedOwners.map((owner, index) => (
              <View key={index} style={styles.infoRow}>
                <Text style={styles.infoLabel}>
                  {hasCoRepresentative ? `대표자 ${index + 1}` : '성명'}
                </Text>
                <Text style={styles.infoValue}>{owner.name}</Text>
              </View>
            ))}

            {/* 사업자 정보 */}
            <Text style={styles.sectionTitle}>사업자 정보</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>사업자등록번호</Text>
              <Text style={styles.infoValue}>
                {businessData.businessNumber}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>개업연월일</Text>
              <Text style={styles.infoValue}>{businessData.openDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주류판매신고번호</Text>
              <Text style={styles.infoValue}>
                {businessData.drink_sales_number}
              </Text>
            </View>

            {/* 매장 주소 */}
            <Text style={styles.sectionTitle}>사업장 소재지</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>주소</Text>
              <Text style={styles.infoValue}>
                {storeAddressData.storeAddress}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>상세주소</Text>
              <Text style={styles.infoValue}>
                {storeAddressData.storeAddressDetail}
              </Text>
            </View>

            {/* 사업자등록증 이미지 */}
            {business_certificate && (
              <>
                <Text style={styles.sectionTitle}>사업자등록증</Text>
                <View style={styles.imageContainer}>
                  <Image
                    source={{uri: business_certificate}}
                    style={styles.certificateImage}
                    resizeMode="contain"
                  />
                </View>
              </>
            )}

            {/* 버튼 영역 */}
            <View style={styles.modalButtonContainer}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={onClose}>
                <Text style={styles.modalCancelButtonText}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.confirmButton]}
                onPress={onSubmit}>
                <Text style={styles.modalButtonText}>제출</Text>
              </Pressable>
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
    height: '80%',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#16BBFF',
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
    fontWeight: '500',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
  certificateImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
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

export default StoreAuthorityModal;
