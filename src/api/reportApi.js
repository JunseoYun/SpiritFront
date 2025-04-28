import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

export const report_create = async data => {
  try {
    const response = await axiosInstance.post('/report/create', data, {
      headers: {
        'Content-Type': 'application/json', // 그냥 json 보내면 됩니다
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
