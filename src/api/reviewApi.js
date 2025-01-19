import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

export const ReviewCreate = async (reviewContent, rate, storeId) => {
  try {
    const response = await axiosInstance.post('/review/create', {
      reviewContent,
      rate,
      storeId,
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const ReviewStoreGet = async storeId => {
  try {
    const response = await axiosInstance.get(`/review/get/${storeId}`);
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
