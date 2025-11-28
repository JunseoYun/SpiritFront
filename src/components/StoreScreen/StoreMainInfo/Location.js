import React from 'react';

import {View, Text, StyleSheet} from 'react-native';

import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomText from '../../../utils/CustomText';

const Location = ({isUpdate, distance, unit}) => {
  return (
    <>
      {!isUpdate && (
        <View style={styles.locationview}>
          <Ionicons name="location-outline" size={20} color="#333" />
          <CustomText style={styles.locationtext}>
            {distance} {unit}
          </CustomText>
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  locationview: {
    flexDirection: 'row',
    width: '80%',
    marginTop: 8,
    marginHorizontal: 18,
    alignItems: 'center',
  },
  locationtext: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
  },
});

export default Location;
