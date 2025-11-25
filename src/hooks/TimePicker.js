import React, {useRef, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import WheelPicker from './WheelPicker';
import CustomText from '../components/common/CustomText';

const TimePicker = ({
  selectedHour = '00',
  selectedMinute = '00',
  onHourChange,
  onMinuteChange,
}) => {
  const hourRef = useRef(null);
  const minuteRef = useRef(null);

  // 시간/분 데이터
  const hours = Array.from({length: 24}, (_, i) =>
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

    // → 매 렌더마다 무조건 scrollTo()를 실행하면,
    //   이미 스크롤 이벤트가 진행 중일 때도 억지로 끊어먹기 때문에 튐/버벅임 발생

    if (hourRef.current && hourIndex !== -1) {
      hourRef.current.scrollTo({
        y: hourIndex * 40,
        animated: true,
      });
    }
    if (minuteRef.current && minuteIndex !== -1) {
      minuteRef.current.scrollTo({
        y: minuteIndex * 40,
        animated: true,
      });
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
      />

      {/* 콜론(:) */}
      <View style={styles.colonView}>
        <CustomText style={styles.colon}>:</CustomText>
      </View>
      <WheelPicker
        data={minutes}
        selectedValue={selectedMinute}
        onValueChange={onMinuteChange}
        scrollRef={minuteRef}
        visibleCount={5}
        fontSize={20}
        style={styles.minutePicker}
      />

      <View style={styles.selectView}></View>
    </View>
  );
};

export default TimePicker;

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
    color: '#181A1A',
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
  },
  selectView: {
    position: 'absolute',
    borderRadius: 7,
    height: 40, // 선택 영역의 높이 지정
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
