import React, {useState, useEffect} from 'react';
import {
  Text,
  SafeAreaView,
  View,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import {
  saveLocationAddress,
  getAddress,
  getLocation,
  clearLocationStorage,
} from '../../storage/locationStorage';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useToast} from '../../context/ToastContext';
import Loading from '../../hooks/Loading';
import {log_access_create} from '../../api/userApi';
import CustomText from '../../utils/CustomText';

const SetLocationScreen = ({navigation}) => {
  const [currentAddress, setCurrentAddress] = useState('');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const storageLocation = await getLocation();
        if (storageLocation) setCurrentLocation(storageLocation);
        const storageAddress = await getAddress();
        if (storageAddress) setCurrentAddress(storageAddress);
      } catch (error) {
        console.log(error);
      }
    };
    fetchLocation();
  }, []);

  const onAddressSelect = async ({address, coords}) => {
    if (JSON.stringify(currentLocation) === JSON.stringify(coords)) {
      showToast('이전에 설정한 위치와 같습니다.');
      return;
    }
    try {
      setLoading(true);
      if (address && coords) {
        await saveLocationAddress(coords, address);

        log_access_create(coords);
        setCurrentLocation(coords);
        setCurrentAddress(address);
        showToast('주소 설정이 완료 되었습니다.');
        setTimeout(() => {
          navigation.reset({index: 0, routes: [{name: 'MainBtmbar'}]});
        }, 100);
      } else {
        showAlert({title: '주소를 선택해주세요.'});
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    navigation.navigate('LocationSearchScreen', {onAddressSelect});
  };

  const handleGetCurrentLocation = async () => {
    try {
      const location = await getLocation();
      navigation.navigate('LocataionMapScreen', {location});
    } catch (error) {
      console.log(error);
    }
  };

  const handleClearLocation = async () => {
    if (currentAddress === '죽전역') {
      showToast('현재 기본 주소입니다.');
    } else {
      try {
        const newLocationAddress = await clearLocationStorage();
        if (newLocationAddress) {
          setCurrentLocation(newLocationAddress.fixedLocation);
          setCurrentAddress(newLocationAddress.fixedAddress);
          showToast('저장된 주소가 삭제되었습니다.');
        }
        setTimeout(() => {
          navigation.reset({
            index: 1,
            routes: [{name: 'MainBtmbar'}],
          });
        }, 100);
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 현재 주소 카드 */}
      <View style={styles.card}>
        <Ionicons name="location-outline" size={24} color="#3CBBFF" />
        <View style={{marginLeft: 12}}>
          <CustomText style={styles.cardLabel}>현재 설정된 위치</CustomText>
          <CustomText style={styles.cardText}>
            {currentAddress || '저장된 주소가 없습니다.'}
          </CustomText>
        </View>
      </View>
      <View style={styles.noticeView}>
        <Ionicons
          name="information-circle-outline"
          size={15}
          color="#6B7280"
          style={{marginRight: 3}}
        />
        <CustomText maxScale={1.3} style={styles.noticeText}>
          현재 한잔할까는 용인시를 중심으로 운영 중입니다.
        </CustomText>
      </View>

      <TouchableOpacity
        style={styles.blueButton}
        onPress={handleGetCurrentLocation}>
        <Feather
          name="crosshair"
          size={15}
          color="#1a1a1a"
          style={{marginRight: 6}}
        />
        <CustomText style={styles.buttonTextWhite}>현재 위치로 설정</CustomText>
      </TouchableOpacity>
      <TouchableOpacity style={styles.grayButton} onPress={handleSearch}>
        <Ionicons
          name="search-outline"
          size={15}
          color="#333"
          style={{marginRight: 6}}
        />
        <CustomText style={styles.buttonText}>주소 검색하기</CustomText>
      </TouchableOpacity>
      {/* 주소 삭제 */}
      <Pressable onPress={handleClearLocation} style={styles.deleteButton}>
        <CustomText style={styles.deleteButtonText}>현재 위치 삭제</CustomText>
      </Pressable>

      <AlertComponent />
      <Loading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F6FD',
    padding: 18,
    borderRadius: 8,
    marginBottom: 10,
    marginHorizontal: 18,
    marginTop: 20,
  },
  cardLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 16,
    color: '#121212',
    fontFamily: 'Pretendard-SemiBold',
    marginRight: 10,
  },
  noticeView: {
    marginHorizontal: 18,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    textAlign: 'center',
  },
  noticeText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'Pretendard-Regular',
  },
  blueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 5,
    justifyContent: 'center',
    marginVertical: 3,
    marginHorizontal: 18,
    borderWidth: 0.7,
    borderColor: '#1a1a1a',
  },
  grayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F2',
    paddingVertical: 12,
    borderRadius: 5,
    justifyContent: 'center',
    marginHorizontal: 18,
    marginTop: 15,
  },
  buttonTextWhite: {
    color: '#1a1a1a',
    fontSize: 14,
    fontFamily: 'Pretendard-Medium',
  },
  buttonText: {
    color: '#333',
    fontSize: 15,
    fontFamily: 'Pretendard-Medium',
  },
  deleteButton: {
    marginTop: 28,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#999',
    fontSize: 14,
    fontFamily: 'Pretendard-Regular',
  },
});

export default SetLocationScreen;
