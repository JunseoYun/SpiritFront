import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const StoreBreakingHours = ({breakingHours, setBreakingHours}) => {
  const [visible, setVisible] = useState(false);

  const openHandle = () => {
    setVisible(true);
  };

  const closeHandle = () => {
    setVisible(false);
  };

  const handleChange = (key, value) => {
    // 모든 필드가 빈값인지 확인 (첫 입력 여부)
    const isInitial =
      !breakingHours.startHour &&
      !breakingHours.startMinute &&
      !breakingHours.endHour &&
      !breakingHours.endMinute;

    let newState = {...breakingHours};

    if (isInitial) {
      // 빈 필드들을 '00'으로 채워 넣음
      newState = {
        startHour: '00',
        startMinute: '00',
        endHour: '00',
        endMinute: '00',
      };
    }
    // 해당 key는 입력된 값으로 변경
    newState[key] = value;
    setBreakingHours(newState);
  };
  const hours = Array.from({length: 24}, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  const minutes = ['00', '15', '30', '45'];

  const isBreakingHoursSet =
    breakingHours.startHour ||
    breakingHours.startMinute ||
    breakingHours.endHour ||
    breakingHours.endMinute;

  return (
    <View>
      <View style={styles.storeinputview}>
        <TouchableOpacity style={styles.storeinput} onPress={openHandle}>
          {isBreakingHoursSet ? (
            <>
              <Text style={styles.storeinputtext}>브레이킹 시간</Text>
              <Text style={styles.inputText}>
                {`${breakingHours.startHour || '00'}:${
                  breakingHours.startMinute || '00'
                } - ${breakingHours.endHour || '00'}:${
                  breakingHours.endMinute || '00'
                }`}
              </Text>
            </>
          ) : (
            <Text style={styles.inputHideText}>브레이크 시간</Text>
          )}
        </TouchableOpacity>
      </View>
      <Modal visible={visible} animationType="slide" transparent={true}>
        <Pressable style={styles.modalBackground} onPress={closeHandle}>
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true} // 이벤트 차단
          >
            <Text style={styles.modalTopText}>매장 브레이크 타임</Text>
            <View style={styles.pickerTopView}>
              <Text style={styles.pickerLabel}>오픈</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={breakingHours.startHour}
                  onValueChange={value => handleChange('startHour', value)}
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
                  selectedValue={breakingHours.startMinute}
                  onValueChange={value => handleChange('startMinute', value)}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}>
                  {minutes.map(minute => (
                    <Picker.Item key={minute} label={minute} value={minute} />
                  ))}
                </Picker>
              </View>
            </View>
            <View style={styles.pickerTopView}>
              <Text style={styles.pickerLabel}>마감</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={breakingHours.endHour}
                  onValueChange={value => handleChange('endHour', value)}
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
                  selectedValue={breakingHours.endMinute}
                  onValueChange={value => handleChange('endMinute', value)}
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
        </Pressable>
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
    fontWeight: '500',
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
  },
  modalContainer: {
    position: 'absolute', // 모달을 화면의 특정 위치에 배치하기 위해 추가
    bottom: 0,
    width: '100%',
    height: '45%',
    paddingVertical: 5,
    paddingTop: 5,
    backgroundColor: 'white',
    borderRadius: 30,
    alignItems: 'center',
    // 그림자 스타일
    shadowColor: '#333', // 그림자 색상 (검은색)
    shadowOffset: {width: 0, height: -4}, // 그림자 위치 (위쪽으로)
    shadowOpacity: 0.2, // 그림자 투명도
    shadowRadius: 5, // 그림자 퍼짐 정도
    elevation: 20, // 안드로이드 그림자
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
    backgroundColor: '#3CBBFF',
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#FFF',
  },
});

export default StoreBreakingHours;
