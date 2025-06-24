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

const ImageActionModal = ({visible, onClose, onEdit, onSort}) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.option} onPress={onSort}>
            <Text style={styles.optionText}>이미지 순서 변경</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.option} onPress={onEdit}>
            <Text style={styles.optionText}>이미지 편집</Text>
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
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
});

export default ImageActionModal;
