import React from 'react';
import {StyleSheet, View, Text} from 'react-native';
import StaticKakaoMap from '../common/StaticKakaoMap';

const StoreLocationSection = ({title, location, storeName}) => {
  const hasCoordinates = !!location?.latitude && !!location?.longitude;
  const addressText = location?.address
    ? `${location.address}${
        location?.addressDetail ? `, ${location.addressDetail}` : ''
      }`
    : '등록된 정보가 없습니다.';

  return (
    <>
      <View style={styles.divider} />
      <Text style={styles.label}>{title}</Text>
      <Text style={styles.addressText}>{addressText}</Text>
      {hasCoordinates && (
        <View style={styles.mapContainer}>
          <StaticKakaoMap
            latitude={location.latitude}
            longitude={location.longitude}
            labelText={storeName || '매장 위치'}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: '#EFEFEF',
    height: 1,
    marginHorizontal: 16,
    marginVertical: 30,
  },
  label: {
    fontFamily: 'Pretendard-Bold',
    color: '#333',
    fontSize: 18,
    marginHorizontal: 18,
    marginTop: 0,
    marginBottom: 10,
  },
  addressText: {
    marginHorizontal: 18,
    color: '#333',
    fontSize: 15,
    marginBottom: 10,
  },
  mapContainer: {
    marginHorizontal: 18,
  },
});

export default StoreLocationSection;
