import React, {useState, useEffect} from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
  View,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  saveLocationAddress,
  getAddress,
  getLocation,
  clearLocationStorage,
} from '../../storage/locationStorage';

import Feather from 'react-native-vector-icons/Feather';

import {
  fetchLocationAddress,
  requestLocationPermission,
} from '../../hooks/useLocation';
import useCustomAlert from '../../hooks/useCustomAlert';
import {useToast} from '../../context/ToastContext';
import Loading from '../../hooks/Loading';

const SetLocationScreen = ({navigation, route}) => {
  const [currentAddress, setcurrentAddress] = useState('');
  const [currentLocation, setcurrentLocation] = useState(null);
  const [selectAddress, setSelectAddress] = useState('');
  const [selectLocation, setSelectLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const {showAlert, AlertComponent} = useCustomAlert();
  const {showToast} = useToast();

  // 이전 화면에서 전달된 데이터를 처리
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const storageLocation = await getLocation();
        if (storageLocation) {
          setcurrentLocation(storageLocation);
        }
        const storageAddress = await getAddress();
        if (storageAddress) {
          setcurrentAddress(storageAddress);
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchLocation();
  }, []);

  // 이전 화면에서 전달된 데이터를 처리
  useEffect(() => {
    if (route.params?.address && route.params?.coords) {
      setSelectAddress(route.params.address);
      setSelectLocation(route.params.coords);
    }
  }, [route.params]);

  const searchAddressHandle = () => {
    navigation.navigate('LocationSearchScreen', {
      onAddressSelect,
    });
  };

  const onAddressSelect = ({address, coords}) => {
    setSelectAddress(address);
    setSelectLocation(coords);
  };

  const saveLocationHandle = async () => {
    if (JSON.stringify(currentLocation) === JSON.stringify(selectLocation)) {
      showAlert({
        title: '이전에 설정한 위치와 같습니다.',
      });
      return;
    }
    try {
      setLoading(true);
      if (selectLocation && selectAddress) {
        const newLocationAddress = await saveLocationAddress(
          selectLocation,
          selectAddress,
        );
        if (newLocationAddress) {
          setcurrentLocation(newLocationAddress.location);
          setcurrentAddress(newLocationAddress.address);
          showToast('주소 설정이 완료 되었습니다.');
          setTimeout(
            () =>
              navigation.reset({
                index: 0,
                routes: [{name: 'MainBtmbar', params: {screen: 'MainScreen'}}], // 이동할 화면
              }),
            100,
          );
          setSelectAddress(null);
          setSelectLocation(null);
        }
      } else {
        showAlert({
          title: '주소를 선택해주세요.',
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const clearLocationHandle = async () => {
    if (currentAddress === '강남역') {
      Alert.alert('현재 기본 주소입니다.');
    } else {
      try {
        const newLocationAddress = await clearLocationStorage();
        if (newLocationAddress) {
          setcurrentLocation(newLocationAddress.fixedLocation);
          setcurrentAddress(newLocationAddress.fixedAddress);

          showAlert({
            title: '저장된 주소가 삭제되었습니다.',
          });
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const handleGetCurrentLocation = async () => {
    try {
      const location = await getLocation();
      navigation.navigate('LocataionMapScreen', {
        location,
        onAddressSelect,
      });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <Pressable onPress={searchAddressHandle} style={styles.searchInput}>
            <Text style={styles.placeholderText}>주소를 검색하세요</Text>
          </Pressable>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="location-outline" size={25} color="#333" />
          <View style={styles.infoBoxText}>
            <Text style={styles.label}>현재 주소</Text>
            <Text style={styles.infoText}>
              {currentAddress || '저장된 주소가 없습니다.'}
            </Text>
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons
            name="location"
            size={25}
            color={selectAddress ? '#45C9FF' : '#999'}
          />
          <View style={styles.infoBoxText}>
            <Text style={selectAddress ? styles.currentLabel : styles.label}>
              선택 주소
            </Text>
            <Text style={styles.infoText}>
              {selectAddress || '선택된 주소가 없습니다.'}
            </Text>
          </View>
        </View>

        <Pressable
          onPress={handleGetCurrentLocation}
          style={styles.selectButton}>
          <Feather
            name="crosshair"
            size={25}
            color="#444"
            style={styles.selectButtonIcon}
          />
          <Text style={[styles.buttonText, styles.selectButtonText]}>
            현재 위치로 선택
          </Text>
        </Pressable>

        <Pressable onPress={saveLocationHandle} style={styles.button}>
          <Text style={styles.buttonText}>선택된 주소로 위치 설정하기</Text>
        </Pressable>

        <Pressable
          onPress={clearLocationHandle}
          style={[styles.button, styles.clearButton]}>
          <Text style={[styles.buttonText, styles.clearButtonText]}>
            현재 주소 삭제
          </Text>
        </Pressable>
      </ScrollView>
      <AlertComponent />

      <Loading loading={loading} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    padding: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    padding: 3,
    fontFamily: 'Pretendard-Medium',
  },
  selectButton: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
    borderWidth: 1, // 테두리 두께
    borderColor: '#999',
    justifyContent: 'center',
  },
  selectButtonIcon: {
    marginRight: 8, // 아이콘과 텍스트 간격
  },
  selectButtonText: {
    color: '#444',
    fontSize: 16,
    fontWeight: '600',
  },

  button: {
    backgroundColor: '#16BBFF',
    padding: 16,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  clearButton: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Pretendard-SemiBold',
  },

  clearButtonText: {
    color: '#FFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 8,
  },
  infoBoxText: {
    padding: 10,
  },
  currentLabel: {
    fontSize: 14,
    color: '#16BBFF',
    fontWeight: '500',
    marginBottom: 3,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Pretendard-Medium',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#181A1A',
  },
  infoSelectText: {
    fontSize: 18,
    fontFamily: 'Pretendard-SemiBold',
    color: '#45C9FF',
  },
  footer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(194, 194, 194, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontFamily: 'Hakgyoansim Dunggeunmiso TTF B', // 커스텀 폰트 적용
    fontSize: 20,
    color: '#333',
  },
});

export default SetLocationScreen;
