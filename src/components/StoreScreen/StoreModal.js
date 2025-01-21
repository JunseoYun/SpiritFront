import React from 'react';
import {View, Text, Pressable, Modal, StyleSheet} from 'react-native';

const StoreModal = ({
  isModalVisible,
  onPressModalClose,
  storeId,
  navigation,
}) => {
  const handlePress = () => {
    navigation.navigate('UpdateStoreScreen', {
      storeId: storeId,
    });

    onPressModalClose();
  };

  return (
    <Modal visible={isModalVisible} animationType="fade" transparent={true}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Pressable style={styles.modalButton} onPress={() => handlePress()}>
              <Text style={styles.modalButtonText}>매장 수정</Text>
            </Pressable>
            <View style={styles.line}></View>
            <Pressable onPress={onPressModalClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // 어두운 반투명 배경
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    elevation: 10, // 안드로이드 그림자
    shadowColor: '#000', // iOS 그림자
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#16BBFF',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#E7E7E7',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  line: {
    height: 1,
    backgroundColor: '#E7E7E7',
    width: '100%',
    marginVertical: 10,
  },
});

export default StoreModal;
