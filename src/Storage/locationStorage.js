import AsyncStorage from '@react-native-async-storage/async-storage';
import {get_init_road} from '../api/location';

let fixedLocation = {
  latitude: 37.50451038636537,
  longitude: 127.02449668534305,
};
let fixedAddress = '신논현역';

let cachedLocation = null; // 메모리 캐시
let cachedAddress = null;
let cachedSearchRadiusKm = null;

export const DEFAULT_SEARCH_RADIUS_KM = 2;

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
  }
};

// 검색 반경 저장
export const saveSearchRadius = async radiusKm => {
  try {
    await AsyncStorage.setItem('searchRadiusKm', JSON.stringify(radiusKm));
    cachedSearchRadiusKm = radiusKm;
  } catch (err) {
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
  }
  return fixedAddress;
};

// 캐시/스토리지/기본값 순으로 검색 반경 가져오기
export const getSearchRadius = async () => {
  if (cachedSearchRadiusKm !== null) return cachedSearchRadiusKm;
  try {
    const stored = await AsyncStorage.getItem('searchRadiusKm');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (typeof parsed === 'number') {
        cachedSearchRadiusKm = parsed;
        return parsed;
      }
    }
  } catch (err) {
  }
  return DEFAULT_SEARCH_RADIUS_KM;
};

// AsyncStorage 초기화
export const clearLocationStorage = async () => {
  try {
    await AsyncStorage.removeItem('location');
    await AsyncStorage.removeItem('address');
    cachedLocation = null;
    cachedAddress = null;
  } catch (err) {
  }
  return {fixedLocation, fixedAddress};
};
