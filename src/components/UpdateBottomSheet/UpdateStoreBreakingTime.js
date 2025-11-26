import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import ActionButtons from './ActionButtons'; // 분리된 ActionButtons 컴포넌트
import CustomText from '../../utils/CustomText';

const UpdateStoreBreakingTime = ({
  hours,
  minutes,
  updatedValue,
  setUpdatedValue,
  onCancel,
  onSave,
}) => {
  return (
    <View style={styles.bottomSheetContent}>
      <CustomText style={styles.title}>브레이크 타임</CustomText>
      <CustomText style={styles.title}>
        {updatedValue?.breakStartTime?.slice(0, 5) || '없음'} -{' '}
        {updatedValue?.breakEndTime?.slice(0, 5) || '없음'}
      </CustomText>

      {/* 초기화 버튼 */}
      <View style={styles.nullButtonView}>
        <Pressable
          style={styles.nullButton}
          onPress={() =>
            setUpdatedValue(prev => ({
              ...prev,
              breakStartTime: null,
              breakEndTime: null,
              breakStartHour: null,
              breakStartMinute: null,
              breakEndHour: null,
              breakEndMinute: null,
            }))
          }>
          <CustomText style={styles.nullButtonText}>
            브레이크 타임 없음
          </CustomText>
        </Pressable>
      </View>

      <View style={styles.pickerSection}>
        {/* 오픈 시간 Picker */}
        <View style={styles.pickerTopView}>
          <View style={styles.pickerWrapper}>
            <Picker
              itemStyle={styles.pickerItem}
              selectedValue={updatedValue.breakStartHour || '00'}
              onValueChange={value =>
                setUpdatedValue(prev => ({
                  ...prev,
                  breakStartHour: value,
                  breakStartTime: `${value}:${prev.breakStartMinute || '00'}`,
                }))
              }
              style={styles.picker}>
              {hours.map(hour => (
                <Picker.Item key={hour} label={hour} value={hour} />
              ))}
            </Picker>
          </View>
          <CustomText style={styles.pickerColon}>:</CustomText>
          <View style={styles.pickerWrapper}>
            <Picker
              itemStyle={styles.pickerItem}
              selectedValue={updatedValue.breakStartMinute || '00'}
              onValueChange={value =>
                setUpdatedValue(prev => ({
                  ...prev,
                  breakStartMinute: value,
                  breakStartTime: `${prev.breakStartHour || '00'}:${value}`,
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
              selectedValue={updatedValue.breakEndHour || '00'}
              onValueChange={value =>
                setUpdatedValue(prev => ({
                  ...prev,
                  breakEndHour: value,
                  breakEndTime: `${value}:${prev.breakEndMinute || '00'}`,
                }))
              }
              style={styles.picker}>
              {hours.map(hour => (
                <Picker.Item key={hour} label={hour} value={hour} />
              ))}
            </Picker>
          </View>
          <CustomText style={styles.pickerColon}>:</CustomText>
          <View style={styles.pickerWrapper}>
            <Picker
              itemStyle={styles.pickerItem}
              selectedValue={updatedValue.breakEndMinute || '00'}
              onValueChange={value =>
                setUpdatedValue(prev => ({
                  ...prev,
                  breakEndMinute: value,
                  breakEndTime: `${prev.breakEndHour || '00'}:${value}`,
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

export default UpdateStoreBreakingTime;

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
  nullButtonView: {
    marginBottom: 20,
  },
  nullButton: {
    width: '45%',
    backgroundColor: '#E9E9E9',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  nullButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '500',
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
