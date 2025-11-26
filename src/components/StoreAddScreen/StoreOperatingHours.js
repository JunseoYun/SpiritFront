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
import CustomText from '../../utils/CustomText';

const StoreOperatingHours = ({operatingHours, setOperatingHours}) => {
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
      !operatingHours.openHour &&
      !operatingHours.openMinute &&
      !operatingHours.closedHour &&
      !operatingHours.closedMinute;

    let newState = {...operatingHours};

    if (isInitial) {
      // 현재 빈 필드들을 '00'으로 채워넣음
      newState = {
        openHour: '00',
        openMinute: '00',
        closedHour: '00',
        closedMinute: '00',
      };
    }
    // 해당 key는 입력값으로 변경 (이미 입력된 값은 그대로 둠)
    newState[key] = value;
    setOperatingHours(newState);
  };

  const hours = Array.from({length: 24}, (_, i) =>
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
              <CustomText style={styles.storeinputtext}>영업 시간*</CustomText>
              <CustomText style={styles.inputText}>
                {`${operatingHours.openHour || '00'}:${
                  operatingHours.openMinute || '00'
                } - ${operatingHours.closedHour || '00'}:${
                  operatingHours.closedMinute || '00'
                }`}
              </CustomText>
            </>
          ) : (
            <CustomText style={styles.inputHideText}>영업 시간*</CustomText>
          )}
        </TouchableOpacity>
      </View>
      <Modal visible={visible} animationType="slide" transparent={true}>
        <Pressable style={styles.modalBackground} onPress={closeHandle}>
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true} // 이벤트 차단
          >
            <CustomText style={styles.modalTopText}>매장 영업 시간</CustomText>
            <View style={styles.pickerTopView}>
              <CustomText style={styles.pickerLabel}>오픈</CustomText>
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
              <CustomText style={styles.pickerColon}>:</CustomText>
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
              <CustomText style={styles.pickerLabel}>마감</CustomText>
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
              <CustomText style={styles.pickerColon}>:</CustomText>
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
              <CustomText style={styles.closeButtonText}>확인</CustomText>
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
    fontSize: 15,
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

export default StoreOperatingHours;
