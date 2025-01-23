import React from 'react';
import {Modal, View, Pressable, Text, StyleSheet} from 'react-native';
import ImagePicker from 'react-native-image-crop-picker';

const CFModal = ({isVisible, onClose, onUpdate, onDelete}) => {
  const handleImagePick = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 500,
        height: 500,
        cropping: true,
        mediaType: 'photo',
      });
      onUpdate(image);
    } catch (error) {
      console.error('Image picker error:', error);
    }
  };

  return (
    <Modal visible={isVisible} transparent={true} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.container}>
          <Pressable style={styles.button} onPress={handleImagePick}>
            <Text style={styles.text}>프로필 수정</Text>
          </Pressable>
          <View style={styles.separator} />
          <Pressable style={styles.button} onPress={onDelete}>
            <Text style={[styles.text, styles.deleteText]}>프로필 삭제</Text>
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
    fontWeight: '600',
  },
  deleteText: {
    color: '#F05650',
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#E7E7E7',
    marginVertical: 10,
  },
});

export default CFModal;
