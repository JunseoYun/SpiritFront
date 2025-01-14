import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
// import styles from '../../styles/StoreMainStyle';

const StoreActions = () => (
  <View style={styles.CallView}>
    <View style={styles.View}>
      <Ionicons name="call-outline" size={20} color="#333" />
      <Text style={styles.CallViewtext}> 전화</Text>
    </View>
    <View style={styles.separator} /> 
    <View style={styles.View}>
      <Ionicons name="heart-outline" size={20} color="#333" />
      <Text style={styles.CallViewtext}> 찜</Text>
    </View>
    <View style={styles.separator} /> 
    <View style={styles.View}>
      <Ionicons name="chatbubble-ellipses-outline" size={20} color="#333" />
      <Text style={styles.CallViewtext}> 채팅</Text>
    </View>
  </View>
);


const styles = StyleSheet.create({
  CallView: {
    width: '80%',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'center',
    flexDirection: 'row',
    marginTop: 12,
    marginBottom: 20,
  },
  View: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 70,
  },
  CallViewtext: {
    color: '#333',
    fontSize: 14,
    fontWeight: 'bold',
  },
  separator: {
    width: 1.5,              // 세로선 너비
    height: '60%',         // 세로선 높이
    backgroundColor: '#E7E7E7', // 세로선 색상
    marginHorizontal: 10,  // 아이템과 구분선 간격
  },

});

export default StoreActions;
