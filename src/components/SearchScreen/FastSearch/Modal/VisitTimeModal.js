import React from 'react';
import {Modal, View, Text, Pressable, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const VisitTimeModal = ({
  visible,
  selectedHour,
  selectedMinute,
  onHourChange,
  onMinuteChange,
  onPressClose,
}) => {
  const TimeHour = [
    {label: '-', value: null},
    {label: '00', value: '00'},
    {label: '01', value: '01'},
    {label: '02', value: '02'},
    {label: '03', value: '03'},
    {label: '04', value: '04'},
    {label: '05', value: '05'},
    {label: '06', value: '06'},
    {label: '07', value: '07'},
    {label: '08', value: '08'},
    {label: '09', value: '09'},
    {label: '10', value: '10'},
    {label: '11', value: '11'},
    {label: '12', value: '12'},
    {label: '13', value: '13'},
    {label: '14', value: '14'},
    {label: '15', value: '15'},
    {label: '16', value: '16'},
    {label: '17', value: '17'},
    {label: '18', value: '18'},
    {label: '19', value: '19'},
    {label: '20', value: '20'},
    {label: '21', value: '21'},
    {label: '22', value: '22'},
    {label: '23', value: '23'},
  ];

  const TimeMinute = [
    {label: '-', value: null},
    {label: '00', value: '00'},
    {label: '10', value: '10'},
    {label: '20', value: '20'},
    {label: '30', value: '30'},
    {label: '40', value: '40'},
    {label: '50', value: '50'},
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.topText}>방문 예정 시간</Text>

          <View style={styles.timeView}>
            <View style={styles.hourView}>
              <View style={styles.pickerView}>
                <Picker
                  selectedValue={selectedHour}
                  onValueChange={itemValue => onHourChange(itemValue)}
                  mode="dropdown"
                  style={styles.pickerItems}>
                  {TimeHour.map((item, index) => (
                    <Picker.Item
                      key={index}
                      label={item.label}
                      value={item.value}
                      style={styles.pickerItems}
                    />
                  ))}
                </Picker>
              </View>
              <Text style={styles.pickerText}>시</Text>
            </View>

            <View style={styles.minuteView}>
              <View style={styles.pickerView}>
                <Picker
                  selectedValue={selectedMinute}
                  onValueChange={itemValue => onMinuteChange(itemValue)}
                  mode="dropdown"
                  style={styles.pickerItems}>
                  {TimeMinute.map((item, index) => (
                    <Picker.Item
                      key={index}
                      label={item.label}
                      value={item.value}
                      style={styles.pickerItems}
                    />
                  ))}
                </Picker>
              </View>
              <Text style={styles.pickerText}>분</Text>
            </View>
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
  timeView: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 30,
    marginBottom: 30,
  },
  hourView: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 50,
  },
  minuteView: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pickerView: {
    width: '50%',
    backgroundColor: '#F2F2F2',
    borderRadius: 7,
  },
  pickerItems: {
    fontSize: 17,
    color: 'black',
    fontWeight: 'bold',
  },
  pickerText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: 'black',
    paddingHorizontal: 10,
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

export default VisitTimeModal;
