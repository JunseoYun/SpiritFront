import React from 'react';
import {View, Text} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import styles from './StoreStyle';

const StoreGroup = ({selectedOption, setSelectedOption}) => {
  const handleCheckBoxChange = index => {
    setSelectedOption(index === 0);
  };
  return (
    <View>
      <View style={styles.storeinputview}>
        <Text style={styles.storetext}>단체석 여부 8인 이상</Text>
      </View>
      <View style={styles.storeinputview}>
        <View style={styles.CheckBoxview}>
          <CheckBox
            value={selectedOption === true}
            onValueChange={() => handleCheckBoxChange(0)}
          />
          <Text style={styles.CheckBoxtext}>O</Text>
        </View>
        <View style={styles.CheckBoxview}>
          <CheckBox
            value={selectedOption === false}
            onValueChange={() => handleCheckBoxChange(1)}
          />
          <Text style={styles.CheckBoxtext}>X</Text>
        </View>
      </View>
    </View>
  );
};

export default StoreGroup;
