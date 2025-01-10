import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import styles from '../../styles/StoreMainStyle';

const StoreActions = () => (
  <View style={styles.CallView}>
    <View style={{flexDirection: 'row'}}>
      <Ionicons name="call-outline" size={20} color="black" />
      <Text style={styles.CallViewtext}>전화</Text>
    </View>
    <View style={{flexDirection: 'row'}}>
      <Ionicons name="heart-outline" size={20} color="black" />
      <Text style={styles.CallViewtext}>찜</Text>
    </View>
    <View style={{flexDirection: 'row'}}>
      <Ionicons name="chatbubble-ellipses-outline" size={20} color="black" />
      <Text style={styles.CallViewtext}>채팅방</Text>
    </View>
  </View>
);


const styles = StyleSheet.create({
  CallView: {
    width: '60%',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 15,
  },
  CallViewtext: {
    color: 'black',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 3,
  },
});

export default StoreActions;
