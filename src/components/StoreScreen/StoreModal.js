import React, {useEffect, useRef} from 'react';
import {View, Text, Pressable, Modal, StyleSheet, Animated} from 'react-native';
import {Portal} from 'react-native-paper';

const StoreModal = ({
  isModalVisible,
  onPressModalClose,
  startUpdate,
  handleReport,
}) => {
  const opacity = useRef(new Animated.Value(0)).current; // opacity 애니메이션 값

  useEffect(() => {
    if (isModalVisible) {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isModalVisible]);

  const handleClose = callback => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onPressModalClose();
      if (callback) callback(); // 애니메이션 종료 후 실행
    });
  };

  return (
    <Portal>
      <Modal visible={isModalVisible} animationType="none" transparent={true}>
        <Pressable style={styles.modalBackground} onPress={() => handleClose()}>
          <Animated.View
            style={[styles.modalContainer, {opacity}]}
            onStartShouldSetResponder={() => true}>
            <View style={styles.modalContent}>
              <Pressable
                style={styles.modalButton}
                onPress={() => handleClose(startUpdate)}>
                <Text style={styles.modalButtonText}>매장 수정</Text>
              </Pressable>
              <Pressable
                style={styles.reportButton}
                onPress={() => handleClose(handleReport)}>
                <Text style={styles.modalButtonText}>매장 제보·신고</Text>
              </Pressable>
              <View style={styles.line}></View>
              <Pressable
                onPress={() => handleClose()}
                style={styles.closeButton}>
                <Text style={styles.closeButtonText}>닫기</Text>
              </Pressable>
            </View>
          </Animated.View>
        </Pressable>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalContent: {
    alignItems: 'center',
  },
  modalButton: {
    backgroundColor: '#45C9FF',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  reportButton: {
    backgroundColor: '#FF6F61',
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
    fontFamily: 'Pretendard-SemiBold',
  },
  closeButton: {
    backgroundColor: '#E7E7E7',
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#333',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },
  line: {
    height: 1,
    backgroundColor: '#E7E7E7',
    width: '100%',
    marginVertical: 10,
  },
});

export default StoreModal;
