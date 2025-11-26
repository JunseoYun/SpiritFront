import React from 'react';
import {
  Modal,
  View,
  Pressable,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';
import {requestPhotoPermission} from '../../hooks/usePhotopermis';
import {
  IMAGE_CROPPER_TEXTS,
  IMAGE_PICKER_TEXTS,
} from '../../constants/imagePickerLabels';
import CustomText from '../../utils/CustomText';

const CFModal = ({isVisible, onClose, onUpdate, onDelete}) => {
  const handleImagePick = async () => {
    const hasCamera = await requestPhotoPermission();
    if (!hasCamera) {
      onClose();
      return;
    }
    if (Platform.OS === 'android') {
      StatusBar.setTranslucent(false); // StatusBar 아래로 UI가 안 겹치게
    }
    try {
      const image = await ImagePicker.openPicker({
        compressImageQuality: 0.95, // 품질
        compressImageMaxWidth: 2160, // 최대 너비
        compressImageMaxHeight: 2160, // 최대 높이
        cropping: true,
        mediaType: 'photo',
        ...IMAGE_PICKER_TEXTS,
        ...IMAGE_CROPPER_TEXTS,
      });
      onUpdate(image);
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Pressable style={styles.button} onPress={handleImagePick}>
            <CustomText style={styles.text}>프로필 수정</CustomText>
          </Pressable>
          <View style={styles.separator} />
          <Pressable style={styles.button} onPress={onDelete}>
            <CustomText style={[styles.text, styles.deleteText]}>
              프로필 삭제
            </CustomText>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  button: {
    padding: 10,
  },
  text: {
    fontSize: 17,
    fontFamily: 'Pretendard-SemiBold',
  },
  deleteText: {
    color: '#F05650',
    fontFamily: 'Pretendard-Medium',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#E7E7E7',
    marginVertical: 10,
  },
});

export default CFModal;
