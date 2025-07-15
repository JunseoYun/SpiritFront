import React from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';

const ManagerPickerModal = ({
  isVisible,
  setVisible,
  handleMoveStore,
  handleMoveStoreInfo,
}) => {
  const close = () => setVisible(false);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={() => setVisible(false)}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={close}>
        <View style={styles.bottomSheet}>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => {
              setVisible(false);
              handleMoveStore();
            }}>
            <Entypo
              name="shop"
              size={23}
              color="#333"
              style={{paddingRight: 7}}
            />
            <Text style={styles.sheetButtonText}>매장으로 이동</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => {
              setVisible(false);
              handleMoveStoreInfo();
            }}>
            <Entypo
              name="bar-graph"
              size={23}
              color="#333"
              style={{paddingRight: 7}}
            />
            <Text style={styles.sheetButtonText}>매장 통계 보기</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sheetButton, styles.cancelButton]}
            onPress={close}>
            <Text style={[styles.sheetButtonText, styles.cancelText]}>
              닫기
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  sheetButton: {
    backgroundColor: '#F8F8F8',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    flexDirection: 'row',
  },
  sheetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    backgroundColor: '#fff',
  },
  cancelText: {
    color: '#007AFF',
  },
});

export default ManagerPickerModal;
