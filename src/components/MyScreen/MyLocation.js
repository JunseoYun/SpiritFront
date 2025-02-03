import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {getAddress} from '../../storage/locationStorage';

const MyLocation = ({navigation}) => {
  const [address, setAddress] = useState('');

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const storageAddress = await getAddress();
        if (storageAddress) {
          setAddress(storageAddress);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchLocation();
  }, []);

  const searchAddressHandle = () => {
    navigation.navigate('SetLocationScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoBox}>
        <Ionicons
          name="location-outline"
          size={25}
          color="#16BBFF"
          style={styles.icon}
        />
        <View>
          <Text style={styles.label}>현재 위치</Text>
          <Text style={styles.address}>
            {address || '저장된 주소가 없습니다.'}
          </Text>
        </View>
      </View>
      <Pressable style={styles.button} onPress={searchAddressHandle}>
        <Text style={styles.buttonText}>위치 설정하기</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    padding: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android 그림자
    marginBottom: 20,
  },
  icon: {
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16BBFF',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#333',
    fontWeight: '400',
  },
  button: {
    backgroundColor: '#16BBFF',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default MyLocation;
