import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';
// 매장 데이터 가져오기
export const getStore = async () => {
  try {
    const response = await axiosInstance.get(`/store/get`);
    return response.data.data; // API 응답 구조에 따라 수정
  } catch (error) {
    functionError(error);
  }
};

// 매장 데이터 가져오기
export const getByCategoryStore = async (categoryname, location) => {
  const {latitude, longitude} = location;

  try {
    const response = await axiosInstance.get(
      `/store/getByCategory/${categoryname}`,
      {
        params: {latitude, longitude},
      },
    );
    return response.data.data; // API 응답 구조에 따라 수정
  } catch (error) {
    functionError(error);
  }
};

//스토어상세페이지 관련 api
export const StoreMainget = async (storeId, innerlatitude, innerlongitude) => {
  try {
    const response = await axiosInstance.get(
      `/store/get/${storeId}?latitude=${innerlatitude}&longitude=${innerlongitude}`,
      {},
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const StoreRegister = async data => {
  const formData = new FormData();

  data.files.forEach(file => {
    if (file) {
      formData.append('files', {
        uri: file.path, // 이미지 URI
        type: file.mime, // 이미지 타입 (확인 후 필요한 타입 사용)
        name: file.filename, // 파일 이름 (확장자 포함)
      });
      console.log('이미지 파일 경로:', file.path);
      console.log('이미지 파일 타입:', file.mime);
      console.log('이미지 파일 이름:', file.filename);
    } else {
      console.error('파일이 없습니다:', file);
    }
  });

  const createStoreDto = JSON.stringify(data.createStoreDto);

  formData.append('createStoreDto', {
    string: createStoreDto,
    type: 'application/json',
  });

  try {
    const response = await axiosInstance.post('/store/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
