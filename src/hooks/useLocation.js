import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import axios from 'axios';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';



export const fetchLocationAddress = () => {
  const hasPermission = requestLocationPermission();
  if (!hasPermission) {
    Alert.alert('위치 권한이 거부되었습니다.');
    return;
  }
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;
          const newLocation = { latitude, longitude };

          // 주소 정보 가져오기
          const address = await getAddressFromCoordinates(newLocation);

          // 위치와 주소 정보 함께 반환
          resolve({ location: newLocation, address });
        } catch (err) {
          console.error('위치 또는 주소 가져오기 오류:', err);
          reject(err);
        }
      },
      error => {
        console.error('위치 가져오기 오류:', error);
        handleLocationError(error);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
};

export const fetchLocation = () => {
  const hasPermission = requestLocationPermission();
  if (!hasPermission) {
    Alert.alert('위치 권한이 거부되었습니다.');
    return;
  }
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      async position => {
        try {
          const { latitude, longitude } = position.coords;
          const currentLocation = { latitude, longitude };
          resolve(currentLocation);
        } catch (err) {
          console.error('위치 또는 주소 가져오기 오류:', err);
          reject(err);
        }
      },
      error => {
        console.error('위치 가져오기 오류:', error);
        handleLocationError(error);
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
};


const handleLocationError = error => {
  if (error.code === 1) {
    error = '위치 권한이 거부되었습니다.';
  } else if (error.code === 2) {
    error = '위치 정보를 사용할 수 없습니다.';
  } else if (error.code === 3) {
    error = '위치 요청이 시간 초과되었습니다.';
  } else if (error.code === 4) {
    error = '위치 서비스가 비활성화되었습니다.';
  } else {
    error = '알 수 없는 오류가 발생했습니다.';
  }
};

export const requestLocationPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: '위치 권한 요청',
          message: '이 앱은 위치 접근 권한이 필요합니다.',
          buttonNeutral: '나중에 묻기',
          buttonNegative: '취소',
          buttonPositive: '허용',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (error) {
      console.warn('권한 요청 오류:', error);
      return false;
    }
  } else if (Platform.OS === 'ios') {
    try {
      const result = await request(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
      if (result === RESULTS.GRANTED) {
        return true;
      } else if (result === RESULTS.DENIED) {
        console.log('iOS 위치 권한이 거부되었습니다.');
        return false;
      } else if (result === RESULTS.BLOCKED) {
        console.log('iOS 위치 권한이 차단되었습니다. 설정에서 변경이 필요합니다.');
        return false;
      }
    } catch (error) {
      console.warn('iOS 권한 요청 오류:', error);
      return false;
    }
  }
  return false;
};



const getAddressFromCoordinates = async cachedLocation => {
  const { latitude, longitude } = cachedLocation;
  const KAKAO_API_KEY = '9b09512f07cf4d2555413abbedcbcc3a'; // 발급받은 REST API 키
  const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${longitude}&y=${latitude}`;

  try {
    const response = await axios.get(url, {
      headers: { Authorization: `KakaoAK ${KAKAO_API_KEY}` },
    });
    if (response.data.documents.length > 0) {
      const addressDetail = response.data.documents[0].address;
      return addressDetail.address_name;
    } else {
      return '주소를 찾을 수 없습니다.';
    }
  } catch (error) {
    console.error('역 지오코딩 오류:', error);
    return '역 지오코딩 실패';
  }
};
