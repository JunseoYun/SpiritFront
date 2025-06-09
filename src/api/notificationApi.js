import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

export const NotifiGet = async page => {
  console.log(page);
  try {
    const response = await axiosInstance.get(`/notification/get-received`, {
      params: {page},
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const NotifiRead = async notificationId => {
  try {
    const response = await axiosInstance.patch(
      `/notification/read/${notificationId}`,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const NotifiReadAll = async () => {
  try {
    const response = await axiosInstance.patch(`/notification/read/all`, {});
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
