import React from 'react';

import {View, Text, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Address = ({locationDto}) => {
  return (
    <View style={styles.addresssetview}>
      <Ionicons name="storefront-outline" size={20} color="#333" />
      <View style={{flexDirection: 'row', flexWrap: 'wrap', width: '100%'}}>
        <Text style={styles.infoHidetext}>
          {locationDto?.address}
          {locationDto?.addressDetail ? `, ${locationDto?.addressDetail}` : ''}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addresssetview: {
    flexDirection: 'row',
    width: '100%',
    marginTop: 12,
    marginHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoHidetext: {
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    paddingLeft: 7,
    width: '80%',
  },
});

export default Address;
