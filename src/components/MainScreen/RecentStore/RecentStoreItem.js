import React from 'react';
import {View, Text, Pressable, Image, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RecentStoreItem = ({store}) => {
  return (
    <Pressable style={styles.recentView}>
      {/* 이미지 */}
      <Image
        source={require('../../../assets/jangan.png')}
        style={styles.recentimg}
      />
      {/* 매장 정보 */}
      <View style={styles.infoContainer}>
        <Text style={styles.storeName}>{store.storeName}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>3.7</Text>
        </View>
        <Text style={styles.closingTime}>
          영업 종료 {store.closeHour.slice(0, 5)}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  recentView: {
    width: 150,
    marginHorizontal: 10,
    marginBottom: 20,
  },
  recentimg: {
    width: '100%',
    height: 100,
    resizeMode: 'cover',
    borderRadius: 10,
  },
  infoContainer: {
    marginTop: 8,
    paddingHorizontal: 5,
  },
  storeName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
    marginLeft: 4,
  },
  closingTime: {
    fontSize: 12,
    color: '#555',
    fontWeight: '400',
  },
});

export default RecentStoreItem;
