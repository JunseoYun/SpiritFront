import React from 'react';
import {View, Text} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import styles from './StoreStyle';

const days = ['월', '화', '수', '목', '금', '토', '일', '없음'];

const StoreClosedDay = ({closedDay, setClosedDay}) => {
  return (
    <View style={styles.storeinputview}>
      <Text style={styles.ClosedDayText}>휴무일</Text>
      <View style={styles.ClosedPickerview}>
        <Picker
          selectedValue={closedDay}
          onValueChange={value => setClosedDay(value)}>
          {days.map(day => (
            <Picker.Item key={day} label={day} value={day} />
          ))}
        </Picker>
      </View>
    </View>
  );
};

export default StoreClosedDay;
