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
import CustomText from '../../utils/CustomText';

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
          size={24}
          color="#555"
          style={styles.icon}
        />
        <View>
          <CustomText style={styles.label}>현재 설정된 위치</CustomText>
          <CustomText style={styles.address}>{address}</CustomText>
        </View>
      </View>
      <Pressable style={styles.button} onPress={searchAddressHandle}>
        <Feather
          name="crosshair"
          size={15}
          color="#1a1a1a"
          style={styles.texticon}
        />
        <CustomText style={styles.buttonText}>내 위치 변경하기</CustomText>
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
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.1,
    shadowRadius: 3,
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
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#121212',
    fontFamily: 'Pretendard-SemiBold',
    marginRight: 15,
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
