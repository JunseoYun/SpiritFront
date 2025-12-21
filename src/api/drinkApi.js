import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';
import toFileField from '../utils/toFileField';

//주류 추가 api
export const StoreDrinkcreate = async data => {
  const formData = new FormData();
  if (data.file) {
    const f = toFileField(data.file, 'drink');
    if (f) formData.append('file', f);
  }

  const createDrinkDto = JSON.stringify(data.createDrinkDto);

  formData.append('createDrinkDto', {
    string: createDrinkDto,
    type: 'application/json',
  });

  try {
    const response = await axiosInstance.post(`/drink/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const StoreDrinkget = async storeId => {
  try {
    const response = await axiosInstance.get(
      `/drink/get-by/store/${storeId}`,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const DrinkUpdate = async (drinkId, data) => {
  try {
    const response = await axiosInstance.put(
      `/drink/update/${drinkId}`,
      data,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const DrinkUpdateImage = async (drinkId, file) => {
  const formData = new FormData();

  if (file) {
    const f = toFileField(file, 'drink');
    if (f) formData.append('file', f);
  }

  try {
    const response = await axiosInstance.post(
      `/drink/update-image/${drinkId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
        },
      },
    );
    return response.data.data; // ✅ 서버에서 이미지 URL 반환
  } catch (error) {
    throw error; // ✅ 에러를 상위 호출자에게 전달
  }
};

export const DrinkDeleteImage = async drinkId => {
  try {
    const response = await axiosInstance.delete(
      `/drink/delete-image/${drinkId}`,
      {},
    );
    return response.data.data; // ✅ 서버에서 이미지 URL 반환
  } catch (error) {
    throw error; // ✅ 에러를 상위 호출자에게 전달
  }
};

export const DrinkUpdateSort = async (storeId, drinkIdInOrderList) => {
  try {
    const response = await axiosInstance.put(`/drink/update/sort-order`, {
      storeId,
      drinkIdInOrderList,
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const StoreDrinkdelete = async drinkId => {
  try {
    const response = await axiosInstance.delete(`/drink/delete/${drinkId}`, {});
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
