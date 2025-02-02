import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

//주류 추가 api
export const StoreDrinkcreate = async data => {
  const formData = new FormData();
  if (data.file) {
    formData.append('file', {
      uri: data.file.path,
      type: data.file.mime,
      name: data.file.filename,
    });
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
    formData.append('file', {
      uri: file.path, // ✅ 올바른 참조
      type: file.mime,
      name: file.path.split('/').pop(), // ✅ 파일 이름 추출
    });
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

export const StoreDrinkdelete = async drinkId => {
  try {
    const response = await axiosInstance.delete(`/drink/delete/${drinkId}`, {});
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
