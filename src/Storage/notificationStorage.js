import AsyncStorage from '@react-native-async-storage/async-storage';

export const setNotification = async (notificationName, trueorfalse) => {
  try {
    await AsyncStorage.setItem(notificationName, trueorfalse);
    console.log('알림 정보가 성공적으로 저장되었습니다.');
  } catch (error) {
    console.error('알림 정보 저장 중 오류가 발생했습니다:', error);
  }
};

export const getNotification = async notificationName => {
  try {
    const notification = await AsyncStorage.getItem(notificationName);
    if (notification !== null) {
      return notification;
    } else {
      console.log('저장된 알림 정보가 없습니다.');
      return null;
    }
  } catch (error) {
    console.error('알림 정보 저장 중 오류가 발생했습니다:', error);
  }
};

export const removeNotification = async () => {
  try {
    await AsyncStorage.removeItem('basicNotification');
    console.log('알림 토큰이 성공적으로 삭제되었습니다.');
  } catch (error) {
    console.error('토큰 삭제 중 오류가 발생했습니다:', error);
  }
};
