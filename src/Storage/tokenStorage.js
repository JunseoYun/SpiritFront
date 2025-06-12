import AsyncStorage from '@react-native-async-storage/async-storage';

// 토큰 저장
export const setToken = async (accessToken, refreshToken) => {
  try {
    await AsyncStorage.setItem('accessToken', accessToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
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
  } catch (error) {
    console.error('토큰 삭제 중 오류가 발생했습니다:', error);
  }
};
