import React, { useState, useEffect } from 'react';
import {
  Text,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
  View,
  StyleSheet,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { saveLocationAddress, getAddress, getLocation, clearLocationStorage } from '../../storage/locationStorage';

import Feather from 'react-native-vector-icons/Feather';

const SetLocationScreen = ({ navigation, route }) => {
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState(null);
  const [selectAddress, setSelectAddress] = useState('');
  const [selectLocation, setSelectLocation] = useState(null);

  // 이전 화면에서 전달된 데이터를 처리
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const storageLocation = await getLocation();
        if (storageLocation) {
          setLocation(storageLocation);
        }
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

  // 이전 화면에서 전달된 데이터를 처리
  useEffect(() => {
    if (route.params?.address && route.params?.coords) {
      setSelectAddress(route.params.address);
      setSelectLocation(route.params.coords);
    }
  }, [route.params]);

  const searchAddressHandle = () => {
    navigation.navigate('LocationSearchScreen');
  };

  const saveLocationHandle = async () => {
    try {
      if (selectLocation && selectAddress) {
        const newLocationAddress = await saveLocationAddress(selectLocation, selectAddress);
        if (newLocationAddress) {
          setLocation(newLocationAddress.location);
          setAddress(newLocationAddress.address);
        }
      } else {
        Alert.alert('주소를 선택해주세요.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const clearLocationHandle = async () => {
    if (address === '강남대학교') {
      Alert.alert('현재 기본 주소입니다.');
    } else {
      try {
        const newLocationAddress = await clearLocationStorage();
        if (newLocationAddress) {
          setLocation(newLocationAddress.fixedLocation);
          setAddress(newLocationAddress.fixedAddress);

          Alert.alert('저장된 주소가 삭제되었습니다.');
        }
      } catch (error) {
        console.log(error);
      }
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
            <Text style={styles.infoText}>{address || '저장된 주소가 없습니다.'}</Text>
          </View>

        </View>


        <View style={styles.infoBox}>
          <Ionicons
            name="location"
            size={25}
            color={selectAddress ? '#16BBFF' : '#999'}
          />
          <View style={styles.infoBoxText}>
            <Text style={selectAddress ? styles.currentLabel : styles.label}>선택 주소</Text>
            <Text style={styles.infoText}>
              {selectAddress || '선택된 주소가 없습니다.'}
            </Text>

          </View>

        </View>

        <Pressable style={styles.selectButton}>
          <Feather
            name="crosshair" size={25} color="#444" style={styles.selectButtonIcon}/>
          <Text style={[styles.buttonText, styles.selectButtonText]}>현재 위치로 선택</Text>
        </Pressable>

        <Pressable onPress={saveLocationHandle} style={styles.button}>
          <Text style={styles.buttonText}>선택된 주소로 위치 설정하기</Text>
        </Pressable>



        <Pressable onPress={clearLocationHandle} style={[styles.button, styles.clearButton]}>
          <Text style={[styles.buttonText, styles.clearButtonText]}>현재 주소 삭제</Text>
        </Pressable>
      </ScrollView>
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
    fontWeight: '600',
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
    elevation: 2,
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
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 3,
  },
  infoText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  infoSelectText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#16BBFF',
  }
});

export default SetLocationScreen;
