import {Platform, PermissionsAndroid, Alert, Linking} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {get_address, get_coordinate} from '../api/location';
import {getGlobalShowAlert} from '../context/CustomAlertContext';
const showAlert = getGlobalShowAlert();

export const fetchLocationAddress = () => {
  const hasPermission = requestLocationPermission();
  if (!hasPermission) {
    showAlert({
      title: '위치 권한이 거부되었습니다.',
    });
    return;
  }
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      async position => {
        try {
          const {latitude, longitude} = position.coords;
          const newLocation = {latitude, longitude};

          // 주소 정보 가져오기
          const address = await getAddressFromCoordinates(newLocation);

          // 위치와 주소 정보 함께 반환
          resolve({newLocation: newLocation, address});
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
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
    );
  });
};

export const fetchLocation = () => {
  const hasPermission = requestLocationPermission();
  if (!hasPermission) {
    showAlert({
      title: '위치 권한이 거부되었습니다.',
    });
    return;
  }
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      async position => {
        try {
          const {latitude, longitude} = position.coords;
          const currentLocation = {latitude, longitude};
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
      {enableHighAccuracy: false, timeout: 15000, maximumAge: 10000},
    );
  });
};

export const handleLocationError = error => {
  if (error.code === 1) {
    const hasPermission = requestLocationPermission();
    if (!hasPermission) {
      showAlert({
        title: '위치 권한이 거부되었습니다.',
      });
      return;
    }
  } else if (error.code === 2) {
    showAlert({
      title: '위치 서비스 비활성화',
      message: '위치 서비스를 활성화해야 현재 위치를 사용할 수 있습니다.',
      onConfirm: () => {
        openLocationSettings();
      },
      onCancel: null,
      type: 'confirm',
    });
  } else if (error.code === 3) {
    showAlert({
      title: '위치 요청 시간 초과되었습니다.',
    });
  } else if (error.code === 4) {
    showAlert({
      title: '위치 서비스가 비활성화되었습니다.',
    });
  } else {
    error = '알 수 없는 오류가 발생했습니다.';
  }
};

const openLocationSettings = () => {
  if (Platform.OS === 'android') {
    Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS'); // 안드로이드 설정 화면으로 이동
  } else {
    Linking.openURL('App-Prefs:root=LOCATION_SERVICES'); // iOS 위치 설정 화면으로 이동
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
        console.log(
          'iOS 위치 권한이 차단되었습니다. 설정에서 변경이 필요합니다.',
        );
        return false;
      }
    } catch (error) {
      console.warn('iOS 권한 요청 오류:', error);
      return false;
    }
  }
  return false;
};

export const getAddressFromCoordinates = async cachedLocation => {
  const {latitude, longitude} = cachedLocation;

  try {
    const response = await get_address(latitude, longitude);

    if (response) {
      return response.address;
    } else {
      return '주소를 찾을 수 없습니다.';
    }
  } catch (error) {
    console.error('역 지오코딩 오류:', error);
    return '역 지오코딩 실패';
  }
};

export const getLatLngFromAddress = async address => {
  try {
    const response = await get_coordinate(address);
    if (response) {
      return {latitude: response.latitude, longitude: response.longitude};
    } else {
      throw new Error('No results found');
    }
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
