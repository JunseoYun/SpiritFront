import React from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {Picker} from '@react-native-picker/picker';

const StoreOperatingHours = ({operatingHours, setOperatingHours}) => {
  const handleChange = (key, value) => {
    setOperatingHours({...operatingHours, [key]: value});
  };

  const hours = Array.from({length: 24}, (_, i) =>
    i.toString().padStart(2, '0'),
  );
  const minutes = ['00', '15', '30', '45'];

  return (
    <View>
      <View style={styles.storeinputview}>
        <Text style={styles.storeinputtext}>영업 시간</Text>
      </View>
      <View style={styles.pickerTopView}>
        <Text style={styles.pickerLabel}>시작</Text>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={operatingHours.openHour}
            onValueChange={value => handleChange('openHour', value)}
            style={styles.picker}
          >
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
          >
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
          >
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
          >
            {minutes.map(minute => (
              <Picker.Item key={minute} label={minute} value={minute} />
            ))}
          </Picker>
        </View>
      </View>
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
  pickerTopView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
  },
  pickerLabel: {
    fontWeight: '600',
    fontSize: 16,
    color: '#444',
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
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  picker: {
    height: Platform.OS === 'ios' ? 50 : 50, // iOS와 Android에 따라 높이 조정
    color: '#333', // 선택된 텍스트 색상
  },
});

export default StoreOperatingHours;
