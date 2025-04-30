import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

export const get_address = async (latitude, longitude) => {
  try {
    const response = await axiosInstance.get('/location/get-address', {
      params: {latitude, longitude}, // ✅ GET 요청에서는 params 사용
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
    return null; // 에러 발생 시 null 반환
  }
};

export const get_coordinate = async address => {
  try {
    const response = await axiosInstance.get('/location/get-coordinate', {
      params: {
        address,
      },
    });
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    functionError(error);
    return null;
  }
};
