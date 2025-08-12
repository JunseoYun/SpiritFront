import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  RefreshControl,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {getAddress} from '../../storage/locationStorage';

const MyLocation = ({navigation}) => {
  const [address, setAddress] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const fetchLocation = async () => {
    try {
      const storageAddress = await getAddress();
      if (storageAddress) {
        setAddress(storageAddress);
      } else {
        setAddress('저장된 주소가 없습니다.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLocation(); // 새로고침할 때 주소 다시 가져오기
    setRefreshing(false);
  }, []);

  const searchAddressHandle = () => {
    navigation.navigate('SetLocationScreen');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.infoBox}>
        <Ionicons
          name="location-outline"
          size={25}
          color="#45C9FF"
          style={styles.icon}
        />
        <View>
          <Text style={styles.label}>현재 위치</Text>
          <Text style={styles.address}>{address}</Text>
        </View>
      </View>
      <Pressable style={styles.button} onPress={searchAddressHandle}>
        <Feather
          name="crosshair"
          size={15}
          color="#1a1a1a"
          style={styles.texticon}
        />
        <Text style={styles.buttonText}>내 위치 변경하기</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2, // Android 그림자
    marginBottom: 20,
  },
  icon: {
    marginRight: 12,
  },
  texticon: {
    marginRight: 6,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    color: '#45C9FF',
    marginBottom: 4,
  },
  address: {
    fontSize: 18,
    color: '#181A1A',
    fontFamily: 'Pretendard-SemiBold',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontFamily: 'Pretendard-Medium',
  },
});

export default MyLocation;
