import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const StoreInfoCard = ({storeData}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>매장 이름(상호명)</Text>
      <Text style={styles.value}>{storeData.storeName}</Text>
      <Text style={styles.label}>매장 연락처</Text>
      <Text style={styles.value}>{storeData.storeNumber}</Text>
      <Text style={styles.label}>신청자 연락처</Text>
      <Text style={styles.value}>{storeData.userContact}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 14,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 18,
    paddingTop: 7,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
    marginTop: 12,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'Pretendard-Medium',
    marginTop: 4,
  },
});

export default StoreInfoCard;
