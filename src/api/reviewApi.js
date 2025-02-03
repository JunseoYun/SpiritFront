import axiosInstance from './axiosInstance';
import {functionError} from './errorHandler';

export const ReviewCreate = async data => {
  const formData = new FormData();

  if (data.files && data.files.length > 0) {
    data.files.forEach(file => {
      formData.append('files', {
        uri: file.path,
        type: file.mime,
        name: file.filename,
      });
    });
  }

  const createReviewDto = JSON.stringify(data.createReviewDto);

  formData.append('createReviewDto', {
    string: createReviewDto,
    type: 'application/json',
  });

  try {
    const response = await axiosInstance.post('/review/create', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
      },
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const ReviewStoreGet = async (storeId, page) => {
  try {
    const response = await axiosInstance.get(
      `/review/get-by/store/${storeId}`,
      {
        params: {page},
      },
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const ReviewRecentGet = async page => {
  try {
    const response = await axiosInstance.get(`/review/get-by/recent`, {
      params: {page},
    });
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const ReviewEdit = async (reviewId, data) => {
  try {
    const response = await axiosInstance.put(
      `/review/update/${reviewId}`,
      data,
      {},
    );
    return response;
  } catch (error) {
    functionError(error);
  }
};

export const ReviewEditImage = async (reviewId, data) => {
  const formData = new FormData();
  data.files.forEach(file => {
    if (file) {
      formData.append('files', {
        uri: file.path, // 이미지 URI
        type: file.mime, // 이미지 타입 (확인 후 필요한 타입 사용)
        name: file.filename, // 파일 이름 (확장자 포함)
      });
    }
  });
  try {
    const response = await axiosInstance.post(
      `/review/upload-image/${reviewId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data', // 파일 업로드는 multipart/form-data
        },
      },
    );
    return response;
  } catch (error) {
    console.log('asdasdasd');
    functionError(error);
  }
};

export const ReviewDeleteImage = async (reviewId, image) => {
  try {
    const response = await axiosInstance.delete(
      `/review/delete-image/${reviewId}`,
      {
        data: {
          imgUrlList: [image], // 이미지 URL을 배열로 전달
        },
      },
    );
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};

export const ReviewDelete = async reviewId => {
  try {
    const response = await axiosInstance.delete(`/review/delete/${reviewId}`);
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
