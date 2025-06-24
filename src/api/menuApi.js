import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

//매뉴 추가 api
export const StoreMenucreate = async data => {
  const formData = new FormData();
  if (data.file) {
    formData.append('file', {
      uri: data.file.path,
      type: data.file.mime,
      name: data.file.filename,
    });
  }

  const createMenuDto = JSON.stringify(data.createMenuDto);

  formData.append('createMenuDto', {
    string: createMenuDto,
    type: 'application/json',
  });

  try {
    const response = await axiosInstance.post(`/menu/create`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const MenuUpdate = async (menuId, data) => {
  try {
    const response = await axiosInstance.put(
      `/menu/update/${menuId}`,
      data,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const MenuUpdateSort = async (storeId, menuIdInOrderList) => {
  try {
    const response = await axiosInstance.put(`/menu/update/sort-order`, {
      storeId,
      menuIdInOrderList,
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const MenuUpdateImage = async (menuId, file) => {
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
      `/menu/update-image/${menuId}`,
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

export const MenuDeleteImage = async menuId => {
  try {
    const response = await axiosInstance.delete(
      `/menu/delete-image/${menuId}`,
      {},
    );
    return response.data.data; // ✅ 서버에서 이미지 URL 반환
  } catch (error) {
    throw error; // ✅ 에러를 상위 호출자에게 전달
  }
};

export const StoreMenuget = async storeId => {
  try {
    const response = await axiosInstance.get(
      `/menu/get-by/store/${storeId}`,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const StoreMenudelete = async menuId => {
  try {
    const response = await axiosInstance.delete(`/menu/delete/${menuId}`, {});
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
