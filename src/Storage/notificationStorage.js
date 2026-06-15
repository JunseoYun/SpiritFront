import AsyncStorage from '@react-native-async-storage/async-storage';

export const setNotification = async (notificationName, trueorfalse) => {
  try {
    await AsyncStorage.setItem(notificationName, trueorfalse);
  } catch (error) {
  }
};

export const getNotification = async notificationName => {
  try {
    const notification = await AsyncStorage.getItem(notificationName);
    if (notification !== null) {
      return notification;
    } else {
      return null;
    }
  } catch (error) {
  }
};

export const removeNotification = async () => {
  try {
    await AsyncStorage.removeItem('basicNotification');
  } catch (error) {
  }
};
