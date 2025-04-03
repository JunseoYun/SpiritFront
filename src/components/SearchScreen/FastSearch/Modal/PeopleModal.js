import React from 'react';
import {Modal, View, Text, Pressable, StyleSheet} from 'react-native';

const PeopleModal = ({
  visible,
  selectedPeople,
  onSelectPeople,
  onPressClose,
}) => {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <Pressable style={styles.modalBackground} onPress={onPressClose}>
        <View
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}>
          <Text style={styles.topText}>인원</Text>
          <View style={styles.peopleChoiceView}>
            <Pressable
              style={styles.radioButton}
              onPress={() => onSelectPeople('10인 이하', false)}>
              <Text
                style={[
                  styles.radioText,
                  selectedPeople === '10인 이하' && styles.selectedRadioText,
                ]}>
                10인 이하
              </Text>
            </Pressable>
            <Pressable
              style={styles.radioButton}
              onPress={() => onSelectPeople('10인 이상', true)}>
              <Text
                style={[
                  styles.radioText,
                  selectedPeople === '10인 이상' && styles.selectedRadioText,
                ]}>
                10인 이상
              </Text>
            </Pressable>
          </View>
          <Pressable onPress={onPressClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
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
    color: '#333',
    fontSize: 20,
    fontFamily: 'Pretendard-SemiBold',
    marginTop: 20,
    marginBottom: 20,
  },
  peopleChoiceView: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  radioButton: {
    padding: 10,
    paddingRight: 50,
    paddingLeft: 50,
    borderRadius: 5,
  },
  radioText: {
    fontSize: 18,
    color: '#999',
  },
  selectedRadioText: {
    fontFamily: 'Pretendard-Bold',
    color: '#45C9FF',
  },
  closeButton: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#45C9FF',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'Pretendard-Medium',
  },
});

export default PeopleModal;
