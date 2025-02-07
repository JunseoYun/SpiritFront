import React from 'react';
import {Modal, View, Text, Pressable, StyleSheet, Platform} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const VisitTimeModal = ({
  visible,
  selectedHour,
  selectedMinute,
  onHourChange,
  onMinuteChange,
  onPressClose,
  postbutton,
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
    <Modal visible={visible} animationType="fade" transparent={true}>
      <Pressable style={styles.modalBackground} onPress={onPressClose}>
        <View
          style={styles.modalContainer}
          onStartShouldSetResponder={() => true}>
          <Text style={styles.topText}>방문 예정 시간</Text>

          <View style={styles.timeView}>
            <View style={styles.hourView}>
              <View style={styles.pickerView}>
                <Picker
                  selectedValue={selectedHour}
                  onValueChange={itemValue => onHourChange(itemValue)}
                  mode="dropdown"
                  itemStyle={styles.pickerItem}
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
                  itemStyle={styles.pickerItem}
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

          <View style={{flexDirection: 'row'}}>
            <Pressable onPress={postbutton} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>확인</Text>
            </Pressable>
            <Pressable onPress={onPressClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </Pressable>
          </View>
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
  timeView: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hourView: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  minuteView: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerView: {
    width: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden', // iOS 겹침 방지
    justifyContent: 'center',
    height: Platform.OS === 'ios' ? 120 : 60, // OS별 높이 설정
    alignSelf: 'center',
  },
  pickerItems: {
    color: '#333',
  },
  pickerItem: {
    color: '#333', // 텍스트 색상을 검은색으로 고정
    fontSize: 18, // 텍스트 크기
    fontWeight: '400', // 텍스트 두께
  },
  pickerText: {
    fontWeight: 'bold',
    fontSize: 17,
    color: 'black',
    paddingHorizontal: 10,
  },
  closeButton: {
    marginTop: 10,
    marginBottom: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(22, 187, 255, 0.9)',
    borderRadius: 5,
    marginHorizontal: 8,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default VisitTimeModal;
