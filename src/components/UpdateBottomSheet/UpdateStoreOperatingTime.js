import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트

const UpdateStoreOperatingTime = ({
  hours,
  minutes,
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
}) => {
  return (
    <View style={styles.bottomSheetContent}>
      <Text style={styles.title}>영업 시간</Text>
      <Text style={styles.title}>
        {updatedValue?.openTime?.slice(0, 5)} -{' '}
        {updatedValue?.closeTime?.slice(0, 5)}
      </Text>
      <View style={styles.pickerSection}>
        {/* 오픈 시간 Picker */}
        <View style={styles.pickerTopView}>
          <View style={styles.pickerWrapper}>
            <Picker
              itemStyle={styles.pickerItem}
              selectedValue={updatedValue.openHour || '00'}
              onValueChange={value =>
                setUpdatedValue(prev => ({
                  ...prev,
                  openHour: value,
                  openTime: `${value}:${prev.openMinute || '00'}`,
                }))
              }
              style={styles.picker}>
              {hours.map(hour => (
                <Picker.Item key={hour} label={hour} value={hour} />
              ))}
            </Picker>
          </View>
          <Text style={styles.pickerColon}>:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              itemStyle={styles.pickerItem}
              selectedValue={updatedValue.openMinute || '00'}
              onValueChange={value =>
                setUpdatedValue(prev => ({
                  ...prev,
                  openMinute: value,
                  openTime: `${prev.openHour || '00'}:${value}`,
                }))
              }
              style={styles.picker}>
              {minutes.map(minute => (
                <Picker.Item key={minute} label={minute} value={minute} />
              ))}
            </Picker>
          </View>
        </View>

        {/* 마감 시간 Picker */}
        <View style={styles.pickerTopView}>
          <View style={styles.pickerWrapper}>
            <Picker
              itemStyle={styles.pickerItem}
              selectedValue={updatedValue.closeHour || '00'}
              onValueChange={value =>
                setUpdatedValue(prev => ({
                  ...prev,
                  closeHour: value,
                  closeTime: `${value}:${prev.closeMinute || '00'}`,
                }))
              }
              style={styles.picker}>
              {hours.map(hour => (
                <Picker.Item key={hour} label={hour} value={hour} />
              ))}
            </Picker>
          </View>
          <Text style={styles.pickerColon}>:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              itemStyle={styles.pickerItem}
              selectedValue={updatedValue.closeMinute || '00'}
              onValueChange={value =>
                setUpdatedValue(prev => ({
                  ...prev,
                  closeMinute: value,
                  closeTime: `${prev.closeHour || '00'}:${value}`,
                }))
              }
              style={styles.picker}>
              {minutes.map(minute => (
                <Picker.Item key={minute} label={minute} value={minute} />
              ))}
            </Picker>
          </View>
        </View>
      </View>
      <ActionButtons onCancel={onCancel} onSave={onSave} />
    </View>
  );
};

export default UpdateStoreOperatingTime;

const styles = StyleSheet.create({
  bottomSheetContent: {
    flex: 1,
    padding: 18,
    backgroundColor: '#F7F7F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  pickerSection: {
    marginVertical: 20,
  },
  pickerTopView: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  pickerWrapper: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    overflow: 'hidden',
    justifyContent: 'center',
    height: 60,
  },
  pickerColon: {
    fontWeight: '600',
    fontSize: 16,
    color: '#444',
    marginHorizontal: 10,
  },
  pickerItem: {
    color: '#333',
    fontSize: 18,
  },
});
