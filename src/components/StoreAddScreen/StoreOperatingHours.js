import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Modal, Pressable, TextInput, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';


const StoreOperatingHours = ({ operatingHours, setOperatingHours }) => {

  const [visible, setVisible] = useState(false);

  const openHandle = () => {
    setVisible(true);
  }

  const closeHandle = () => {
    setVisible(false);
  }

  const handleChange = (key, value) => {
    setOperatingHours({ ...operatingHours, [key]: value });
  };
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  const minutes = ['00', '15', '30', '45'];

  const isOperatingHoursSet =
  operatingHours.openHour ||
  operatingHours.openMinute ||
  operatingHours.closedHour ||
  operatingHours.closedMinute;
  

  return (
    <View>
      <View style={styles.storeinputview}>
        <TouchableOpacity style={styles.storeinput} onPress={openHandle}>
          {isOperatingHoursSet ? (
            <>
              <Text style={styles.storeinputtext}>영업 시간</Text>
              <Text style={styles.inputText}>
                {`${operatingHours.openHour || '00'}:${operatingHours.openMinute || '00'} - ${operatingHours.closedHour || '00'}:${operatingHours.closedMinute || '00'}`}
              </Text>
            </>
          ) : (
            <Text style={styles.inputHideText}>영업 시간</Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={visible} animationType="fade" transparent={true}>
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTopText}>매장 영업 시간</Text>
            <View style={styles.pickerTopView}>
              <Text style={styles.pickerLabel}>시작</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={operatingHours.openHour}
                  onValueChange={value => handleChange('openHour', value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}>
                  {hours.map(hour => (
                    <Picker.Item key={hour} label={hour} value={hour} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.pickerColon}>:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={operatingHours.openMinute}
                  onValueChange={value => handleChange('openMinute', value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}>
                  {minutes.map(minute => (
                    <Picker.Item key={minute} label={minute} value={minute} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.pickerTopView}>
              <Text style={styles.pickerLabel}>종료</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={operatingHours.closedHour}
                  onValueChange={value => handleChange('closedHour', value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}>
                  {hours.map(hour => (
                    <Picker.Item key={hour} label={hour} value={hour} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.pickerColon}>:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={operatingHours.closedMinute}
                  onValueChange={value => handleChange('closedMinute', value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}>
                  {minutes.map(minute => (
                    <Picker.Item key={minute} label={minute} value={minute} />
                  ))}
                </Picker>
              </View>
            </View>
            <Pressable onPress={closeHandle} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </Modal>




    </View>
  );
};

const styles = StyleSheet.create({
  storeinputview: {
    marginTop: 50,
    marginHorizontal: 20,
  },
  storeinputtext: {
    fontWeight: '400',
    color: '#999',
    fontSize: 16,
    marginBottom: 10,
  },
  storeinput: {
    width: '100%',
    borderBottomColor: '#F2F2F2',
    borderBottomWidth: 1,
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 7,
    paddingLeft: 1,
  },
  inputHideText: {
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 1,
    paddingLeft: 1,
    color: '#999',
  },
  inputText: {
    fontSize: 22,
    fontWeight: '500',
    paddingVertical: 1,
    paddingLeft: 1,
  },
  pickerTopView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  pickerLabel: {
    fontWeight: '400',
    fontSize: 16,
    color: '#333',
    marginRight: 10,
  },
  pickerColon: {
    fontWeight: '600',
    fontSize: 16,
    color: '#444',
    marginHorizontal: 10,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden', // iOS 겹침 방지
    justifyContent: 'center',
    height: 60,
  },
  picker: {
    color: '#333', // 텍스트 색상
  },
  pickerItem: {
    color: '#333', // 텍스트 색상을 검은색으로 고정
    fontSize: 18, // 텍스트 크기
    fontWeight: '400', // 텍스트 두께
  },
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
  modalTopText: {
    color: '#333',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 20,
  },
  closeButton: {
    marginVertical: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#16BBFF',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default StoreOperatingHours;
