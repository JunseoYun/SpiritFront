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

export const ReviewStoreGet = async storeId => {
  try {
    const response = await axiosInstance.get(`/review/get-by/store/${storeId}`);
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

export const ReviewDelete = async reviewId => {
  try {
    const response = await axiosInstance.delete(`/review/delete/${reviewId}`);
    return response.data.data;
  } catch (error) {
    functionError(error);
  }
};
