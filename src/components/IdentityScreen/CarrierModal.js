import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  FlatList,
  Modal,
} from 'react-native';
import CustomText from '../../utils/CustomText';

const CarrierModal = ({
  isCarrierModalVisible,
  setIsCarrierModalVisible,
  CARRIER_OPTIONS,
  setSelectedCarrier,
}) => {
  return (
    <Modal
      visible={isCarrierModalVisible}
      transparent
      animationType="fade"
      onRequestClose={() => setIsCarrierModalVisible(false)}>
      <TouchableWithoutFeedback onPress={() => setIsCarrierModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <CustomText
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  marginBottom: 10,
                }}>
                통신사를 선택해주세요
              </CustomText>
              <FlatList
                data={CARRIER_OPTIONS}
                keyExtractor={item => item}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={{paddingVertical: 15}}
                    onPress={() => {
                      setSelectedCarrier(item);
                      setIsCarrierModalVisible(false);
                    }}>
                    <CustomText style={{fontSize: 17}}>{item}</CustomText>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(34, 34, 34, 0.4)', // 전체 어두운 배경
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end', // 여기서만 모달 내용 슬라이드
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingBottom: 40,
    padding: 20,
    maxHeight: '60%',
  },
});
export default CarrierModal;
