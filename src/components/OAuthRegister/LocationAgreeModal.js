import React from 'react';
import {Modal, View, Text, Pressable, StyleSheet} from 'react-native';
import CustomText from '../common/CustomText';

const LocationAgreeModal = ({visible, onPressClose}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <Pressable style={styles.modalBackground} onPress={onPressClose}>
        <View
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}>
          <CustomText style={styles.topText}>locationAgreeModal</CustomText>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '90%',
    paddingVertical: 5,
    paddingTop: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  topText: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default LocationAgreeModal;
