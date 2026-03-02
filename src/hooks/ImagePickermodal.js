import React from 'react';
import {View, Text, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';

import useSafeAndroidInsets from './useSafeAndroidInsets';
import CustomText from '../utils/CustomText';

const ImagePickermodal = ({
  isBottomSheetVisible,
  setBottomSheetVisible,
  handleCameraPick,
  handleGalleryPick,
  handleDelete,
  deleteLabel = '프로필 삭제',
}) => {
  const close = () => setBottomSheetVisible(false);
  const {bottom} = useSafeAndroidInsets();
  return (
    <Modal
      visible={isBottomSheetVisible}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={() => setBottomSheetVisible(false)}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPressOut={close}>
        <View style={[styles.bottomSheet, {paddingBottom: bottom}]}>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => {
              setBottomSheetVisible(false);
              setTimeout(() => {
                handleCameraPick();
              }, 100); // 모달 닫히는 애니메이션 시간만큼 지연
            }}>
            <Entypo name="camera" size={23} color="#333" />
            <CustomText style={styles.sheetButtonText}>
              카메라로 촬영
            </CustomText>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.sheetButton}
            onPress={() => {
              setBottomSheetVisible(false);
              setTimeout(() => {
                handleGalleryPick();
              }, 100); // 모달 닫히는 애니메이션 시간만큼 지연
            }}>
            <Entypo name="image" size={23} color="#333" />
            <CustomText style={styles.sheetButtonText}>
              앨범에서 선택
            </CustomText>
          </TouchableOpacity>
          {typeof handleDelete === 'function' && (
            <TouchableOpacity
              style={styles.sheetButton}
              onPress={() => {
                setBottomSheetVisible(false);
                setTimeout(() => {
                  handleDelete();
                }, 100); // 모달 닫히는 애니메이션 시간만큼 지연
              }}>
              <Ionicons name="trash-outline" size={23} color="#F05650" />
              <CustomText style={[styles.sheetButtonText, styles.deleteText]}>
                {deleteLabel}
              </CustomText>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.sheetButton, styles.cancelButton]}
            onPress={close}>
            <CustomText style={[styles.sheetButtonText, styles.cancelText]}>
              닫기
            </CustomText>
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
    gap: 7,
  },
  sheetButtonText: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
  },
  cancelButton: {
    marginTop: -5,
    backgroundColor: '#fff',
  },
  cancelText: {
    color: '#007AFF',
  },
  deleteText: {
    color: '#F05650',
  },
});

export default ImagePickermodal;
