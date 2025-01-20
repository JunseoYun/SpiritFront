import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

//매뉴 추가 api
export const StoreMenucreate = async data => {
  try {
    const response = await axiosInstance.post(`/menu/create`, {
      data,
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const StoreMenuget = async storeId => {
  try {
    const response = await axiosInstance.get(
      `/menu/getByStoreId/${storeId}`,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const StoreMenudelete = async selectedMenuId => {
  try {
    const response = await axiosInstance.delete(
      `/menu/delete/${selectedMenuId}`,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
