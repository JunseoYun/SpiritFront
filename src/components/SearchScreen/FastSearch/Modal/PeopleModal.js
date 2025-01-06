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
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.topText}>인원</Text>
          <View style={styles.peopleChoiceView}>
            <Pressable
              style={styles.radioButton}
              onPress={() => onSelectPeople('8인 이하')}>
              <Text
                style={[
                  styles.radioText,
                  selectedPeople === '8인 이하' && styles.selectedRadioText,
                ]}>
                8인 이하
              </Text>
            </Pressable>
            <Pressable
              style={styles.radioButton}
              onPress={() => onSelectPeople('8인 이상')}>
              <Text
                style={[
                  styles.radioText,
                  selectedPeople === '8인 이상' && styles.selectedRadioText,
                ]}>
                8인 이상
              </Text>
            </Pressable>
          </View>
          <Pressable onPress={onPressClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>닫기</Text>
          </Pressable>
        </View>
      </View>
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
    color: 'gray',
  },
  selectedRadioText: {
    fontWeight: 'bold',
    color: '#16BBFF',
  },
  closeButton: {
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'gray',
    fontSize: 14,
    fontWeight: 'bold',
    paddingTop: 15,
    paddingBottom: 6,
  },
});

export default PeopleModal;
