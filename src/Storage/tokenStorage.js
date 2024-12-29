import AsyncStorage from '@react-native-async-storage/async-storage';

// 토큰 저장
export const storeToken = async token => {
  // try {
  //   await AsyncStorage.setItem('token', token);
  //   console.log('토큰이 성공적으로 저장되었습니다.');
  // } catch (error) {
  //   console.error('토큰 저장 중 오류가 발생했습니다:', error);
  // }
};

export const getToken = async () => {
  // try {
  //   const token = await AsyncStorage.getItem('token');
  //   if (token !== null) {
  //     return token;
  //   } else {
  //     console.log('저장된 토큰이 없습니다.');
  //     return null;
  //   }
  // } catch (error) {
  //   console.error('토큰 가져오기 중 오류가 발생했습니다:', error);
  //   return null;
  // }
  return null;
};

export const removeToken = async () => {
  // try {
  //   await AsyncStorage.removeItem('token');
  //   console.log('토큰이 성공적으로 삭제되었습니다.');
  // } catch (error) {
  //   console.error('토큰 삭제 중 오류가 발생했습니다:', error);
  // }
};
