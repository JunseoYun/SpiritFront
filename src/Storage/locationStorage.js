import AsyncStorage from '@react-native-async-storage/async-storage';

const fixedLocation = {latitude: 37.496486, longitude: 127.0283};
const fixedAddress = '강남역';
let cachedLocation = null; // 캐시된 위치를 저장할 변수
let error = null;
let cachedAddress = null;

export const saveLocationAddress = async (location, address) => {
  try {
    await AsyncStorage.setItem('location', JSON.stringify(location));
    await AsyncStorage.setItem('address', JSON.stringify(address));

    cachedLocation = location; // 메모리에 캐싱
    cachedAddress = address;
  } catch (error) {
    console.log('위치 정보 저장 오류:', error);
  }
};

export const getLocation = async () => {
  if (cachedLocation) return cachedLocation; // 메모리에 캐싱된 위치가 있으면 반환
  try {
    const storedLocation = await AsyncStorage.getItem('location');
    if (storedLocation) {
      cachedLocation = JSON.parse(storedLocation); // JSON 파싱 후 메모리에 캐싱
      return cachedLocation;
    }
  } catch (error) {
    console.log('위치 정보 가져오기 오류:', error);
  }
  return fixedLocation;
};

export const getAddress = async () => {
  if (cachedAddress) return cachedAddress; // 메모리에 캐싱된 위치가 있으면 반환
  try {
    const storedAddress = await AsyncStorage.getItem('address');
    if (storedAddress) {
      cachedAddress = JSON.parse(storedAddress); // JSON 파싱 후 메모리에 캐싱
      return cachedAddress;
    }
  } catch (error) {
    console.log('주소 정보 가져오기 오류:', error);
  }
  return fixedAddress;
};

export const clearLocationStorage = async () => {
  try {
    await AsyncStorage.removeItem('location'); // 'location' 키 삭제
    await AsyncStorage.removeItem('address'); // 'address' 키 삭제
    cachedLocation = null;
    cachedAddress = null;
  } catch (error) {
    console.log('캐시 데이터 삭제 오류:', error);
  }
  return {fixedLocation, fixedAddress};
};
