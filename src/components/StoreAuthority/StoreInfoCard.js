import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const StoreInfoCard = ({storeData, storeAddressData}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>매장 이름</Text>
      <Text style={styles.value}>{storeData.storeName}</Text>

      <Text style={styles.label}>매장 번호</Text>
      <Text style={styles.value}>{storeData.storeNumber}</Text>

      <Text style={styles.label}>주소</Text>
      <Text style={styles.value}>
        {storeAddressData.storeAddress}
        {storeAddressData.storeAddressDetail &&
          `, ${storeAddressData.storeAddressDetail}`}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 18,
    paddingTop: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginTop: 4,
  },
});

export default StoreInfoCard;
