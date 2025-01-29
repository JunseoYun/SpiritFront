import React from 'react';
import {View, Text, Pressable, Image, StyleSheet} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const RecentStoreItem = ({store}) => {
  return (
    <Pressable style={styles.recentView}>
      {/* 이미지 */}
      {store.mainImgUrl ? (
        <Image source={{uri: store.mainImgUrl}} style={styles.recentimg} />
      ) : (
        <View style={styles.storeImagetext}>
          <Text style={{color: 'white', textAlign: 'center'}}>이미지 없음</Text>
        </View>
      )}
      {/* 매장 정보 */}
      <View style={styles.infoContainer}>
        <Text style={styles.storeName}>{store.name}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>{store.storeRate}</Text>
        </View>
        <Text style={styles.closingTime}>
          영업 종료{' '}
          {store.businessHoursDto?.closeTime?.slice(0, 5) || '정보 없음'}
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
  storeImagetext: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    justifyContent: 'center', // 수직 중앙 정렬
    alignItems: 'center',
    backgroundColor: 'black',
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
