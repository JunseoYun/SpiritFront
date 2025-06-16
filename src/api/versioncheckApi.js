import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';
import Config from 'react-native-config';

export const Versioncheck = async () => {
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
