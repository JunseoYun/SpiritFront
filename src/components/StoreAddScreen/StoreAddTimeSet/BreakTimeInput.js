import React from 'react';
import {View, Text, Pressable, StyleSheet} from 'react-native';

const BreakTimeInput = ({
  sameStartTime,
  sameEndTime,
  isStartTime,
  isEndTime,
  wrongBreak,
  isNextBreaking,
  handleTimePickerToggle,
}) => {
  return (
    <View>
      <View style={styles.checkboxHeader}>
        <Text style={styles.checkboxLabel}>브레이크타임</Text>
      </View>
      <View style={styles.timeInputContainer}>
        <Pressable
          style={[
            styles.timeInput,
            isStartTime && {backgroundColor: 'rgba(22, 187, 255, 0.2)'},
            isStartTime &&
              wrongBreak && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
          ]}
          onPress={() => handleTimePickerToggle('start')}>
          <Text
            style={[
              styles.timeText,
              isStartTime && {color: '#16BBFF'},
              isStartTime && wrongBreak && {color: '#FF4816'},
            ]}>
            {`${sameStartTime.hour}:${sameStartTime.minute}`}
          </Text>
        </Pressable>
        <Text style={styles.separator}>~</Text>
        <Pressable
          style={[
            styles.timeInput,
            isEndTime && {backgroundColor: 'rgba(22, 187, 255, 0.2)'},
            isEndTime &&
              wrongBreak && {backgroundColor: 'rgba(255, 50, 50, 0.2)'},
          ]}
          onPress={() => handleTimePickerToggle('end')}>
          <Text
            style={[
              styles.timeText,
              isEndTime && {color: '#16BBFF'},
              isEndTime && wrongBreak && {color: '#FF4816'},
            ]}>
            {isNextBreaking && '다음날'}{' '}
            {`${sameEndTime.hour}:${sameEndTime.minute}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  checkboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    justifyContent: 'space-between',
    marginTop: 30,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 12,
  },
  timeInput: {
    backgroundColor: '#F2F2F2',
    color: '#333',
    padding: 10,
    borderRadius: 5,
    width: 80,
    textAlign: 'center',
    flex: 1,
    alignItems: 'center',
  },
  timeText: {
    fontWeight: '600',
    color: '#333',
    fontSize: 15,
  },
  separator: {
    fontSize: 18,
    color: '#333',
    marginHorizontal: 15,
  },
});

export default BreakTimeInput;
