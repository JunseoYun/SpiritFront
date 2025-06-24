import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

export const get_address = async (latitude, longitude) => {
  try {
    const response = await axiosInstance.get('/location/get-address', {
      params: {latitude, longitude},
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
    return null;
  }
};

export const get_road = async (latitude, longitude) => {
  try {
    const response = await axiosInstance.get('/location/get-road', {
      params: {latitude, longitude},
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
    return null;
  }
};

export const get_coordinate = async address => {
  try {
    const response = await axiosInstance.get('/location/get-coordinate', {
      params: {
        address,
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
    return null;
  }
};
