import React, {useEffect, useRef} from 'react';
import {View, Text, Pressable, Modal, StyleSheet, Animated} from 'react-native';
import CustomText from '../../utils/CustomText';

const StoreReportModal = ({
  isModalVisible,
  onPressModalClose,
  startUpdate,
  isPropose,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;

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
      }).start(() => {
        onPressModalClose(); // 🔥 애니메이션이 끝난 후 실행
      });
    }
  }, [isModalVisible]);

  const handleClose = callback => {
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onPressModalClose();
      if (callback) callback();
    });
  };

  return (
    <Modal visible={isModalVisible} animationType="none" transparent={true}>
      <Pressable style={styles.modalBackground} onPress={() => handleClose()}>
        <Animated.View
          style={[styles.modalContainer, {opacity}]}
          onStartShouldSetResponder={() => true}>
          <CustomText style={styles.modalTitle}>
            {isPropose ? '제보 확인' : '신고 확인'}
          </CustomText>
          <CustomText style={styles.modalMessage}>
            정말로 {isPropose ? '제보' : '신고'}하시겠습니까?
          </CustomText>

          <View style={styles.buttonContainer}>
            <Pressable style={styles.button} onPress={() => handleClose()}>
              <CustomText style={styles.cancelText}>취소</CustomText>
            </Pressable>

            <View style={styles.divider} />
            <Pressable
              style={styles.button}
              onPress={() => handleClose(startUpdate)}>
              <CustomText
                style={[styles.confirmText, isPropose && styles.proposeText]}>
                {isPropose ? '제보' : '신고'}
              </CustomText>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

export default StoreReportModal;

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
    alignItems: 'center',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 20,
    marginTop: 30,
    color: '#333',
  },
  proposeTitle: {
    color: '#FFA500', // 주황색으로 변경
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: -15,
    marginBottom: 20,
    fontWeight: '400',
    marginHorizontal: 18,
    flexWrap: 'wrap',
    color: '#333',
    height: 'auto',
    lineHeight: 22,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    height: 55,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cancelText: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 16,
  },
  confirmText: {
    color: '#f44336', // 기존 신고 버튼 색상 (빨간색)
    fontWeight: '600',
    fontSize: 16,
  },
  proposeText: {
    color: '#FFA500', // 제보일 경우 주황색 적용
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#E0E0E0',
  },
});
