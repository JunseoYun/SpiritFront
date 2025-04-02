import React from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';

const ImagePickermodal = ({
  isBottomSheetVisible,
  setBottomSheetVisible,
  handleCameraPick,
  handleGalleryPick,
}) => {
  return (
    <Modal
      visible={isBottomSheetVisible}
      transparent
      animationType="none"
      onRequestClose={() => setBottomSheetVisible(false)}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={() => setBottomSheetVisible(false)}>
        <View style={styles.bottomSheet}>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => {
              setBottomSheetVisible(false);
              setTimeout(() => {
                handleCameraPick();
              }, 100); // 모달 닫히는 애니메이션 시간만큼 지연
            }}>
            <Text style={styles.sheetButtonText}>카메라로 촬영</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => {
              setBottomSheetVisible(false);
              setTimeout(() => {
                handleGalleryPick();
              }, 100); // 모달 닫히는 애니메이션 시간만큼 지연
            }}>
            <Text style={styles.sheetButtonText}>앨범에서 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sheetButton,
              {borderTopWidth: 1, borderColor: '#ddd'},
            ]}
            onPress={() => setBottomSheetVisible(false)}>
            <Text style={[styles.sheetButtonText]}>닫기</Text>
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
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },

  bottomSheet: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  sheetButton: {
    backgroundColor: '#fff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  sheetButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
});

export default ImagePickermodal;
