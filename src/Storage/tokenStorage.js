import AsyncStorage from '@react-native-async-storage/async-storage';

let unLogin = null;
// 토큰 저장
export const setToken = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    console.log('토큰이 성공적으로 저장되었습니다.');
  } catch (error) {
    console.error('토큰 저장 중 오류가 발생했습니다:', error);
  }
};

export const getAccessToken = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (token !== null) {
      return token;
    } else {
      console.log('저장된 토큰이 없습니다.');
      return null;
    }
  } catch (error) {
    console.error('토큰 가져오기 중 오류가 발생했습니다:', error);
    return null;
  }
};

export const getRefreshToken = async () => {
  try {
    const token = await AsyncStorage.getItem('refreshToken');
    if (token !== null) {
      return token;
    } else {
      console.log('저장된 토큰이 없습니다.');
      return null;
    }
  } catch (error) {
    console.error('토큰 가져오기 중 오류가 발생했습니다:', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem('accessToken');
    await AsyncStorage.removeItem('refreshToken');
    console.log('토큰이 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('토큰 삭제 중 오류가 발생했습니다:', error);
  }
};

export const setUnLogin = async () => {
  try {
    await AsyncStorage.setItem('unLogin', 'true');

    unLogin = 'true';
    console.log(unLogin);
  } catch (error) {
    console.log('unLogin 오류:', error);
  }
  return 'true';
};

export const getUnLogin = async () => {
  if (unLogin) return unLogin; // 메모리에 캐싱된 위치가 있으면 반환
  try {
    const unLoginStatus = await AsyncStorage.getItem('unLogin');
    unLogin = unLoginStatus;
    console.log('getItem: ', unLogin);
    return unLogin;
  } catch (error) {
    console.log('unLogin 정보 가져오기 오류:', error);
  }
};

export const clearUnLogin = async () => {
  await AsyncStorage.removeItem('unLogin');
  console.log('clear');
};
