import React from 'react';
import {View, Text} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import styles from './StoreStyle';

const StoreTV = ({selectedscreenOption, setselectedscreenOption}) => {
  const handleCheckBoxscreenChange = index => {
    setselectedscreenOption(index === 0);
  };

  return (
    <View>
      <View style={styles.storeinputview}>
        <Text style={styles.storetext}>스크린 여부</Text>
      </View>
      <View style={styles.storeinputview}>
        <View style={styles.CheckBoxview}>
          <CheckBox
            value={selectedscreenOption === true}
            onValueChange={() => handleCheckBoxscreenChange(0)}
          />
          <Text style={styles.CheckBoxtext}>O</Text>
        </View>
        <View style={styles.CheckBoxview}>
          <CheckBox
            value={selectedscreenOption === false}
            onValueChange={() => handleCheckBoxscreenChange(1)}
          />
          <Text style={styles.CheckBoxtext}>X</Text>
        </View>
      </View>
    </View>
  );
};

export default StoreTV;
