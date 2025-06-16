import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';
import Config from 'react-native-config';

export const Versioncheck = async () => {
  // const VERSION_CODE = '1.1.1'; // 또는 DeviceInfo.getVersion()
  try {
    const response = await axiosInstance.get('/version/check', {
      params: {
        clientVersion: Config.VERSION_CODE,
      },
    });
    return response;
  } catch (error) {
    functionError(error);
    throw error;
  }
};
