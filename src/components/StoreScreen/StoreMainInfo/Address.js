import React from 'react';

import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

import AntDesign from 'react-native-vector-icons/AntDesign';
import Entypo from 'react-native-vector-icons/Entypo';

const Address = ({isUpdate, storedata, handleEdit}) => {
  return (
    <>
      {isUpdate ? (
        <TouchableOpacity
          style={styles.addresssetview}
          onPress={
            isUpdate
              ? () =>
                  handleEdit('locationDto', {
                    address: storedata?.locationDto?.address,
                    addressDetail: storedata?.locationDto?.addressDetail,
                    latitude: storedata?.locationDto?.latitude,
                    longitude: storedata?.locationDto?.longitude,
                  })
              : null
          }>
          <AntDesign name="home" size={20} color="#333" />
          <View style={{flexDirection: 'row', flexWrap: 'wrap', width: '100%'}}>
            <Text style={styles.infoHidetext}>
              {storedata?.locationDto?.address},
            </Text>
            {storedata?.locationDto?.addressDetail && (
              <Text style={styles.infoHidetext}>
                {storedata?.locationDto?.addressDetail}
              </Text>
            )}
          </View>
          <View style={{right: 30, position: 'absolute', alignSelf: 'center'}}>
            <Entypo name="chevron-small-right" size={25} color="#333" />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.addresssetview}>
          <AntDesign name="home" size={20} color="#333" />
          <View style={{flexDirection: 'row', flexWrap: 'wrap', width: '100%'}}>
            <Text style={styles.infoHidetext}>
              {storedata?.locationDto?.address},
            </Text>
            {storedata?.locationDto?.addressDetail && (
              <Text style={styles.infoHidetext}>
                {storedata?.locationDto?.addressDetail}
              </Text>
            )}
          </View>
        </View>
      )}
    </>
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
    fontWeight: '500',
    color: '#333',
    paddingLeft: 10,
  },
});

export default Address;
