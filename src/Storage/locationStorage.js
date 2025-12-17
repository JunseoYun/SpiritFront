import AsyncStorage from '@react-native-async-storage/async-storage';
import {get_init_road} from '../api/location';

let fixedLocation = {
  latitude: 37.50451038636537,
  longitude: 127.02449668534305,
};
let fixedAddress = '신논현역';

let cachedLocation = null; // 메모리 캐시
let cachedAddress = null;

// 서버에서 가져와 저장
export const initLocationFromServer = async () => {
  try {
    const cachelocation = await getLocation();
    const cacheaddress = await getAddress();

    const isDefault =
      cachelocation.latitude === fixedLocation.latitude &&
      cachelocation.longitude === fixedLocation.longitude &&
      cacheaddress === fixedAddress;

    if (!isDefault) {
      return {location, address};
    }

    const data = await get_init_road();
    const location = data.getCoordinateDto;
    const address = data.getAddressDto.address;
    await saveLocationAddress(location, address);
  } catch (err) {
    console.log('서버 초기 위치 가져오기 실패:', err);
    return {cachedLocation: fixedLocation, cachedAddress: fixedAddress};
  }
};

// AsyncStorage + 캐시 저장
export const saveLocationAddress = async (location, address) => {
  try {
    await AsyncStorage.setItem('location', JSON.stringify(location));
    await AsyncStorage.setItem('address', JSON.stringify(address));
    cachedLocation = location;
    cachedAddress = address;
  } catch (err) {
    console.log('위치 정보 저장 오류:', err);
  }
};

// 캐시/스토리지/기본값 순으로 위치 가져오기
export const getLocation = async () => {
  if (cachedLocation) return cachedLocation;
  try {
    const stored = await AsyncStorage.getItem('location');
    if (stored) {
      cachedLocation = JSON.parse(stored);
      return cachedLocation;
    }
  } catch (err) {
    console.log('위치 정보 가져오기 오류:', err);
  }
  return fixedLocation;
};

// 캐시/스토리지/기본값 순으로 주소 가져오기
export const getAddress = async () => {
  if (cachedAddress) return cachedAddress;
  try {
    const stored = await AsyncStorage.getItem('address');
    if (stored) {
      cachedAddress = JSON.parse(stored);
      return cachedAddress;
    }
  } catch (err) {
    console.log('주소 정보 가져오기 오류:', err);
  }
  return fixedAddress;
};

// AsyncStorage 초기화
export const clearLocationStorage = async () => {
  try {
    await AsyncStorage.removeItem('location');
    await AsyncStorage.removeItem('address');
    cachedLocation = null;
    cachedAddress = null;
  } catch (err) {
    console.log('캐시 데이터 삭제 오류:', err);
  }
  return {fixedLocation, fixedAddress};
};
