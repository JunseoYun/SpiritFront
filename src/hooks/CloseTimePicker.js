import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import WheelPicker from './WheelPicker';

const CloseTimePicker = ({
  selectedHour,
  selectedMinute,
  onHourChange,
  onMinuteChange,
}) => {
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  // ✅ 00시 ~ 33시까지 배열 생성
  const hours = Array.from({length: 34}, (_, i) =>
    i.toString().padStart(2, '0'),
  );

  const minutes = [
    '00',
    '05',
    '10',
    '15',
    '20',
    '25',
    '30',
    '35',
    '40',
    '45',
    '50',
    '55',
  ];

  useEffect(() => {
    const hourIndex = hours.indexOf(selectedHour);
    const minuteIndex = minutes.indexOf(selectedMinute);

    if (hourRef.current && hourIndex !== -1) {
      hourRef.current.scrollToIndex({index: hourIndex, animated: true});
    }
    if (minuteRef.current && minuteIndex !== -1) {
      minuteRef.current.scrollToIndex({index: minuteIndex, animated: true});
    }
  }, [selectedHour, selectedMinute]);

  return (
    <View style={styles.container}>
      <WheelPicker
        data={hours}
        selectedValue={selectedHour}
        onValueChange={onHourChange}
        scrollRef={hourRef}
        visibleCount={5}
        fontSize={20}
        style={styles.hourPicker}
        type={'hour'}
      />

      <View style={styles.colonView}>
        <Text style={styles.colon}>:</Text>
      </View>

      <WheelPicker
        data={minutes}
        selectedValue={selectedMinute}
        onValueChange={onMinuteChange}
        scrollRef={minuteRef}
        visibleCount={5}
        fontSize={20}
        style={styles.minutePicker}
        type={'minute'}
      />

      <View style={styles.selectView}></View>
    </View>
  );
};

export default CloseTimePicker;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  colonView: {
    paddingHorizontal: 3,
    width: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colon: {
    color: '#333',
    fontSize: 20,
  },
  selectView: {
    position: 'absolute',
    borderRadius: 7,
    height: 40,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  hourPicker: {
    alignItems: 'flex-end',
  },
  minutePicker: {
    alignItems: 'flex-start',
  },
});
