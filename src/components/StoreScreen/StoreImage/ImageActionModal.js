// components/ImageActionModal.js
import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import CustomText from '../../../utils/CustomText';

const ImageActionModal = ({visible, onClose, onEdit, onSort}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent={true}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.option} onPress={onSort}>
            <CustomText style={styles.optionText}>이미지 순서 변경</CustomText>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={onEdit}>
            <CustomText style={styles.optionText}>이미지 편집</CustomText>
          </TouchableOpacity>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: 260,
  },
  option: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
  },
});

export default ImageActionModal;
